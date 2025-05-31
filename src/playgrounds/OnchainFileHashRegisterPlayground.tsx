import React, { useState, useMemo } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { Connection, PublicKey, Transaction, SystemProgram, TransactionInstruction } from '@solana/web3.js';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import bs58 from 'bs58';

const endpoint = 'https://rpc.helius.xyz/?api-key=d0b16cfa-5967-42dd-9613-82121f42828b';
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

function WalletConnect() {
  return <WalletMultiButton />;
}

async function sha256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', arrayBuffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper to decode v0 instructions
function decodeV0Instructions(message: any): { programId: PublicKey; data: any }[] {
  const keys = message.staticAccountKeys || message.accountKeys;
  return message.compiledInstructions.map((ix: any) => ({
    programId: new PublicKey(keys[ix.programIdIndex]),
    data: ix.data,
  }));
}

const OnchainFileHashRegister = () => {
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [txSig, setTxSig] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [mode, setMode] = useState<'register' | 'verify'>('register');
  const [verifyResult, setVerifyResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRegisteredHash, setLastRegisteredHash] = useState<string | null>(null);
  const [lastRegisteredSig, setLastRegisteredSig] = useState<string | null>(null);
  const [manualTxSig, setManualTxSig] = useState('');

  const { publicKey, sendTransaction, connected } = useWallet();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(null); setHash(null); setTxSig(null); setTimestamp(null); setVerifyResult(null);
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setHash(await sha256(f));
    }
  };

  const handleRegister = async (publicKey: PublicKey, sendTransaction: any) => {
    if (!file || !hash) return;
    setLoading(true); setTxSig(null); setTimestamp(null);
    try {
      const connection = new Connection(endpoint, 'confirmed');
      const memoIx = new TransactionInstruction({
        keys: [],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(hash, 'utf8'),
      });
      const tx = new Transaction().add(memoIx);
      const sig = await sendTransaction(tx, connection);
      setTxSig(sig);
      setLastRegisteredHash(hash);
      setLastRegisteredSig(sig);
      // Fetch block time
      const { blockTime } = await connection.getConfirmedTransaction(sig) || {};
      if (blockTime) setTimestamp(new Date(blockTime * 1000).toLocaleString());
      // Auto-verify after registration
      setTimeout(() => handleVerifyAuto(hash, sig), 2000);
    } catch (e: any) {
      setTxSig('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify helper with retry
  const handleVerifyAuto = async (autoHash: string, autoSig: string) => {
    setLoading(true); setVerifyResult(null);
    const connection = new Connection(endpoint, 'confirmed');
    let attempts = 0;
    const maxAttempts = 10;
    const delay = 2000;
    async function tryFetch() {
      attempts++;
      try {
        if (autoHash && autoSig) {
          console.log('Attempt', attempts, 'of', maxAttempts, 'to verify hash:', autoHash);
          const tx = await connection.getTransaction(autoSig, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 });
          if (tx) {
            console.log('Transaction found:', tx);
            let instructions: { programId: PublicKey; data: any }[] = [];
            if ('instructions' in tx.transaction.message) {
              // Legacy transaction
              console.log('Processing legacy transaction');
              const accountKeys = tx.transaction.message.accountKeys;
              instructions = tx.transaction.message.instructions.map((ix: any) => ({
                programId: accountKeys[ix.programIdIndex],
                data: ix.data,
              }));
              console.log('Account keys:', accountKeys);
            } else if ('compiledInstructions' in tx.transaction.message) {
              // V0 transaction
              console.log('Processing v0 transaction');
              const keys = tx.transaction.message.staticAccountKeys || tx.transaction.message.getAccountKeys().keySegments().flat();
              console.log('Account keys:', keys);
              instructions = tx.transaction.message.compiledInstructions.map((ix: any) => ({
                programId: new PublicKey(keys[ix.programIdIndex]),
                data: ix.data,
              }));
            }
            console.log('Decoded instructions:', instructions);
            for (const ix of instructions) {
              console.log('Checking instruction:', ix);
              if (ix.programId && ix.programId.equals && ix.programId.equals(MEMO_PROGRAM_ID)) {
                console.log('Found memo instruction');
                let memoData = '';
                if (ix.data && typeof ix.data !== 'string') {
                  try {
                    memoData = Buffer.from(ix.data).toString('utf8');
                    console.log('Decoded memo data (utf8):', memoData);
                  } catch {
                    try {
                      memoData = Buffer.from(ix.data, 'base64').toString('utf8');
                      console.log('Decoded memo data (base64):', memoData);
                    } catch (e) {
                      console.log('Failed to decode memo data:', e);
                    }
                  }
                } else if (typeof ix.data === 'string') {
                  try {
                    // Try to decode base58 first
                    const decoded = bs58.decode(ix.data);
                    memoData = Buffer.from(decoded).toString('utf8');
                    console.log('Decoded memo data (base58):', memoData);
                  } catch {
                    // If base58 fails, use the string directly
                    memoData = ix.data;
                    console.log('Memo data (string):', memoData);
                  }
                }
                console.log('Comparing memo:', memoData, 'with hash:', autoHash);
                if (memoData === autoHash) {
                  setVerifyResult('Hash found! Registered at: ' + (tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : 'unknown time') + '\nTx: ' + autoSig);
                  setLoading(false);
                  return;
                }
              }
            }
          } else {
            console.log('Transaction not found yet');
          }
        }
        if (attempts < maxAttempts) {
          console.log('Retrying in', delay, 'ms...');
          setTimeout(tryFetch, delay);
        } else {
          console.log('Max attempts reached, hash not found');
          setVerifyResult('Hash not found on-chain.');
          setLoading(false);
        }
      } catch (e) {
        console.error('Error during verification:', e);
        if (attempts < maxAttempts) {
          console.log('Retrying after error in', delay, 'ms...');
          setTimeout(tryFetch, delay);
        } else {
          setVerifyResult('Error: ' + (e instanceof Error ? e.message : String(e)));
          setLoading(false);
        }
      }
    }
    tryFetch();
  };

  const handleVerify = async () => {
    if (!hash) return;
    setLoading(true); setVerifyResult(null);
    try {
      const connection = new Connection(endpoint, 'confirmed');
      // If the user just registered this hash, check the transaction directly
      if (lastRegisteredHash === hash && lastRegisteredSig) {
        console.log('Checking direct transaction:', lastRegisteredSig);
        const tx = await connection.getTransaction(lastRegisteredSig, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 });
        if (tx) {
          let instructions: { programId: PublicKey; data: any }[] = [];
          if ('instructions' in tx.transaction.message) {
            // Legacy transaction
            const accountKeys = tx.transaction.message.accountKeys;
            instructions = tx.transaction.message.instructions.map((ix: any) => ({
              programId: accountKeys[ix.programIdIndex],
              data: ix.data,
            }));
          } else if ('compiledInstructions' in tx.transaction.message) {
            // V0 transaction
            const keys = tx.transaction.message.staticAccountKeys || tx.transaction.message.getAccountKeys().keySegments().flat();
            instructions = tx.transaction.message.compiledInstructions.map((ix: any) => ({
              programId: new PublicKey(keys[ix.programIdIndex]),
              data: ix.data,
            }));
          }
          for (const ix of instructions) {
            if (ix.programId && ix.programId.equals && ix.programId.equals(MEMO_PROGRAM_ID)) {
              let memoData = '';
              if (ix.data && typeof ix.data !== 'string') {
                try {
                  memoData = Buffer.from(ix.data).toString('utf8');
                } catch {
                  try {
                    memoData = Buffer.from(ix.data, 'base64').toString('utf8');
                  } catch {}
                }
              } else if (typeof ix.data === 'string') {
                try {
                  // Try to decode base58 first
                  const decoded = bs58.decode(ix.data);
                  memoData = Buffer.from(decoded).toString('utf8');
                } catch {
                  // If base58 fails, use the string directly
                  memoData = ix.data;
                }
              }
              console.log('Direct checked memo:', memoData);
              if (memoData === hash) {
                setVerifyResult('Hash found! Registered at: ' + (tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : 'unknown time') + '\nTx: ' + lastRegisteredSig);
                setLoading(false);
                return;
              }
            }
          }
        } else {
          console.log('Direct transaction not found, falling back to memo search.');
        }
      }
      // Fallback: search recent memos as before
      console.log('Starting fallback memo search...');
      const sigs = await connection.getSignaturesForAddress(MEMO_PROGRAM_ID, { limit: 1000 });
      let found = false;
      for (const sigInfo of sigs) {
        const tx = await connection.getTransaction(sigInfo.signature, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 });
        if (!tx) continue;
        let instructions: { programId: PublicKey; data: any }[] = [];
        if ('instructions' in tx.transaction.message) {
          // Legacy transaction
          const accountKeys = tx.transaction.message.accountKeys;
          instructions = tx.transaction.message.instructions.map((ix: any) => ({
            programId: accountKeys[ix.programIdIndex],
            data: ix.data,
          }));
        } else if ('compiledInstructions' in tx.transaction.message) {
          // V0 transaction
          const keys = tx.transaction.message.staticAccountKeys || tx.transaction.message.getAccountKeys().keySegments().flat();
          instructions = tx.transaction.message.compiledInstructions.map((ix: any) => ({
            programId: new PublicKey(keys[ix.programIdIndex]),
            data: ix.data,
          }));
        }
        for (const ix of instructions) {
          if (ix.programId && ix.programId.equals && ix.programId.equals(MEMO_PROGRAM_ID)) {
            let memoData = '';
            if (ix.data && typeof ix.data !== 'string') {
              try {
                memoData = Buffer.from(ix.data).toString('utf8');
              } catch {
                try {
                  memoData = Buffer.from(ix.data, 'base64').toString('utf8');
                } catch {}
              }
            } else if (typeof ix.data === 'string') {
              try {
                // Try to decode base58 first
                const decoded = bs58.decode(ix.data);
                memoData = Buffer.from(decoded).toString('utf8');
                console.log('Checked memo (base58):', memoData);
              } catch {
                // If base58 fails, use the string directly
                memoData = ix.data;
                console.log('Checked memo (string):', memoData);
              }
            }
            if (memoData === hash) {
              setVerifyResult('Hash found! Registered at: ' + (tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : 'unknown time') + '\nTx: ' + sigInfo.signature);
              setLoading(false);
              found = true;
              return;
            }
          }
        }
      }
      if (!found) setVerifyResult('Hash not found on-chain.');
    } catch (e) {
      setVerifyResult('Error: ' + (e instanceof Error ? e.message : String(e)));
      console.error('Verification error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Handler for manual signature verification
  const handleManualSigVerify = async () => {
    if (!manualTxSig || !hash) return;
    setLoading(true); setVerifyResult(null);
    try {
      const connection = new Connection(endpoint, 'confirmed');
      const tx = await connection.getTransaction(manualTxSig, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 });
      if (tx) {
        let instructions: { programId: PublicKey; data: any }[] = [];
        if ('instructions' in tx.transaction.message) {
          // Legacy transaction
          const accountKeys = tx.transaction.message.accountKeys;
          instructions = tx.transaction.message.instructions.map((ix: any) => ({
            programId: accountKeys[ix.programIdIndex],
            data: ix.data,
          }));
        } else if ('compiledInstructions' in tx.transaction.message) {
          // V0 transaction
          const keys = tx.transaction.message.staticAccountKeys || tx.transaction.message.getAccountKeys().keySegments().flat();
          instructions = tx.transaction.message.compiledInstructions.map((ix: any) => ({
            programId: new PublicKey(keys[ix.programIdIndex]),
            data: ix.data,
          }));
        }
        for (const ix of instructions) {
          if (ix.programId && ix.programId.equals && ix.programId.equals(MEMO_PROGRAM_ID)) {
            let memoData = '';
            if (ix.data && typeof ix.data !== 'string') {
              try {
                memoData = Buffer.from(ix.data).toString('utf8');
              } catch {
                try {
                  memoData = Buffer.from(ix.data, 'base64').toString('utf8');
                } catch {}
              }
            } else if (typeof ix.data === 'string') {
              try {
                // Try to decode base58 first
                const decoded = bs58.decode(ix.data);
                memoData = Buffer.from(decoded).toString('utf8');
              } catch {
                // If base58 fails, use the string directly
                memoData = ix.data;
              }
            }
            if (memoData === hash) {
              setVerifyResult('Hash found! Registered at: ' + (tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : 'unknown time') + '\nTx: ' + manualTxSig);
              setLoading(false);
              return;
            }
          }
        }
        setVerifyResult('Hash not found in this transaction.');
      } else {
        setVerifyResult('Transaction not found.');
      }
    } catch (e) {
      setVerifyResult('Error: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Onchain File Hash Register</h3>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setMode('register')} disabled={mode==='register'}>Register</button>
        <button onClick={() => setMode('verify')} style={{ marginLeft: 8 }} disabled={mode==='verify'}>Verify</button>
      </div>
      <input type="file" onChange={handleFile} />
      {hash && <div style={{ marginTop: 8, wordBreak: 'break-all', fontSize: 13 }}><b>SHA-256:</b> {hash}</div>}
      {mode === 'verify' && (
        <div style={{ margin: '12px 0' }}>
          <label htmlFor="manual-tx-sig" style={{ fontSize: 13, fontWeight: 500 }}>Or enter a transaction signature to verify:</label><br />
          <input
            id="manual-tx-sig"
            type="text"
            placeholder="Paste transaction signature..."
            style={{ width: '100%', maxWidth: 420, marginTop: 4, padding: 6, borderRadius: 4, border: '1px solid #d9d9d9', fontSize: 13 }}
            value={manualTxSig}
            onChange={e => setManualTxSig(e.target.value)}
            disabled={loading}
          />
          <button
            style={{ marginTop: 6, fontSize: 13 }}
            onClick={handleManualSigVerify}
            disabled={loading || !manualTxSig || !hash}
          >
            {loading ? 'Searching...' : 'Verify by Signature'}
          </button>
        </div>
      )}
      {mode === 'register' && hash && (
        <WalletProvider wallets={[new PhantomWalletAdapter()]} autoConnect>
          <WalletModalProvider>
            <WalletConnect />
            <button
              onClick={async () => {
                if (!connected || !publicKey) return alert('Connect wallet first!');
                await handleRegister(publicKey, sendTransaction);
              }}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register Hash On-Chain'}
            </button>
            {txSig && (
              <div style={{ marginTop: 8, fontSize: 13 }}>
                <b>Transaction Signature:</b><br />
                <span style={{ wordBreak: 'break-all', background: '#f5f5f5', color: '#222', border: '1px solid #d9d9d9', borderRadius: 4, padding: '2px 6px', display: 'inline-block', fontFamily: 'monospace', fontSize: 14 }}>{txSig}</span><br />
                <a href={`https://solscan.io/tx/${txSig}`} target="_blank" rel="noopener noreferrer">View on Solscan</a><br />
                <span style={{ color: '#389e0d', fontWeight: 500 }}><b>Save this signature</b> to verify your registration in the future!</span>
              </div>
            )}
            {timestamp && <div>Timestamp: {timestamp}</div>}
          </WalletModalProvider>
        </WalletProvider>
      )}
      {mode === 'verify' && hash && (
        <button onClick={handleVerify} disabled={loading}>{loading ? 'Searching...' : 'Verify Hash On-Chain'}</button>
      )}
      {verifyResult && <div style={{ marginTop: 8, whiteSpace: 'pre-line' }}>{verifyResult}</div>}
    </div>
  );
};

const fileHashCode = `// Onchain File Hash Register Example\n// 1. Compute SHA-256 hash of file\n// 2. Register hash on-chain using Memo program\n// 3. Verify hash by searching recent memos\n\nimport { Connection, PublicKey, Transaction } from '@solana/web3.js';\nconst MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');\n\nasync function sha256(file) { /* ... */ }\nasync function registerHash(hash, publicKey, sendTransaction) {\n  const connection = new Connection('https://rpc.helius.xyz/?api-key=YOUR_API_KEY');\n  const memoIx = { keys: [], programId: MEMO_PROGRAM_ID, data: hash };\n  const tx = new Transaction().add(memoIx);\n  const sig = await sendTransaction(tx, connection);\n  return sig;\n}\nasync function verifyHash(hash) {\n  const connection = new Connection('https://rpc.helius.xyz/?api-key=YOUR_API_KEY');\n  const sigs = await connection.getSignaturesForAddress(MEMO_PROGRAM_ID, { limit: 1000 });\n  for (const sigInfo of sigs) {\n    const tx = await connection.getTransaction(sigInfo.signature, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 });\n    if (!tx) continue;\n    for (const ix of tx.transaction.message.instructions) {\n      if (ix.programId.equals(MEMO_PROGRAM_ID) && ix.data === hash) {\n        return sigInfo.signature;\n      }\n    }\n  }\n  return null;\n}\n`;

const OnchainFileHashRegisterPlayground = () => {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="playground-container">
            <div className="side left" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{textAlign: 'center', width: '100%', marginBottom: 24}}>Onchain File Hash Register Playground</h2>
              <OnchainFileHashRegister />
              <div className="card" style={{marginTop: 24}}>
                <h3>How it Works</h3>
                <ol>
                  <li>Upload a file to compute its SHA-256 hash.</li>
                  <li>Register the hash on-chain using the Memo program.</li>
                  <li>Verify a file by searching for its hash in recent memos.</li>
                </ol>
                <p>This playground demonstrates decentralized proof-of-existence and timestamping on Solana.</p>
                <div style={{ marginTop: 16, color: '#b8860b', fontSize: 13, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 6, padding: 8 }}>
                  <b>Note:</b> Only the <b>last 1000 memos</b> are searched when verifying by file. If your registration is older or the Memo program is busy, your hash may not be found. <br />
                  <span style={{ color: '#ad6800' }}>After registering, <b>save the transaction signature</b> below for robust future verification.</span>
                </div>
              </div>
            </div>
            <div className="side">
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 24px', marginTop: 28}}>
                <h2 style={{textAlign: 'left', margin: 0}}>Code</h2>
                <a href="/docs?guide=file-hash-register" style={{ color: '#60efff', fontWeight: 500, fontSize: 15 }}>Detailed Guide</a>
              </div>
              <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14, width: '100%' }}>
                {fileHashCode}
              </SyntaxHighlighter>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default OnchainFileHashRegisterPlayground; 