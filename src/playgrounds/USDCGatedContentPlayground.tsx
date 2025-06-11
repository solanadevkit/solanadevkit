import React, { useMemo, useState, useCallback } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount, getMint } from '@solana/spl-token';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

const endpoint = 'https://rpc.helius.xyz/?api-key=d0b16cfa-5967-42dd-9613-82121f42828b';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

function WalletConnect() {
  return <WalletMultiButton />;
}

const USDCGatedContent = () => {
  const { publicKey, sendTransaction, connected } = useWallet();
  const [ata, setAta] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [exists, setExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const checkATA = useCallback(async () => {
    setMessage(null);
    setExists(null);
    setBalance(null);
    setAta(null);
    if (!publicKey) return;
    setLoading(true);
    try {
      const connection = new Connection(endpoint, 'confirmed');
      const mintPubkey = new PublicKey(USDC_MINT);
      const ataAddress = await getAssociatedTokenAddress(mintPubkey, publicKey);
      setAta(ataAddress.toBase58());
      const accountInfo = await connection.getAccountInfo(ataAddress);
      if (accountInfo) {
        setExists(true);
        try {
          const tokenAccount = await getAccount(connection, ataAddress);
          const mintInfo = await getMint(connection, mintPubkey);
          const decimals = mintInfo.decimals;
          const amount = Number(tokenAccount.amount);
          if (isNaN(amount) || isNaN(decimals)) {
            setBalance(0);
          } else {
            const balance = amount / Math.pow(10, decimals);
            if (balance > 0) {
              // Show hidden content
              console.log('Congratulations! You have', balance, 'USDC. Here is your exclusive content!');
            } else {
              // No USDC, do not show content
              console.log('No USDC found.');
            }
            setBalance(balance);
          }
        } catch {
          setBalance(0);
        }
      } else {
        setExists(false);
      }
    } catch (e: any) {
      setMessage('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  const handleCreateATA = useCallback(async () => {
    setMessage(null);
    setLoading(true);
    try {
      if (!publicKey) throw new Error('Wallet missing');
      const connection = new Connection(endpoint, 'confirmed');
      const mintPubkey = new PublicKey(USDC_MINT);
      const ataAddress = await getAssociatedTokenAddress(mintPubkey, publicKey);
      const ix = createAssociatedTokenAccountInstruction(
        publicKey, // payer
        ataAddress, // ata
        publicKey, // owner
        mintPubkey
      );
      const tx = new Transaction().add(ix);
      const sig = await sendTransaction(tx, connection);
      await connection.confirmTransaction(sig);
      setMessage('Token account created!');
      setExists(true);
      setAta(ataAddress.toBase58());
      setBalance(0);
    } catch (e: any) {
      setMessage('Error: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [publicKey, sendTransaction]);

  return (
    <div className="card">
      <h3>USDC Gated Content Checker</h3>
      <form style={{display: 'flex', flexDirection: 'column', gap: 8}} onSubmit={e => { e.preventDefault(); checkATA(); }}>
        <input
          value={USDC_MINT}
          disabled
          style={{padding: 8, borderRadius: 4, background: '#222', color: '#fff'}}
        />
        <button type="submit" disabled={!connected || loading}>
          {loading ? 'Checking...' : 'Check USDC Balance'}
        </button>
      </form>
      {ata && (
        <div style={{marginTop: 12}}>
          <div><b>Associated Token Account:</b> <span style={{fontFamily: 'monospace'}}>{ata}</span></div>
          {exists === false && (
            <button style={{marginTop: 8}} onClick={handleCreateATA} disabled={loading}>
              {loading ? 'Creating...' : 'Create USDC Token Account'}
            </button>
          )}
          {exists && (
            <div style={{marginTop: 8}}>
              <b>Balance:</b> {balance === null ? '...' : balance}
              {balance && balance > 0 && (
                <div style={{marginTop: 16, background: '#222', color: '#00ff87', padding: 12, borderRadius: 8}}>
                  🎉 <b>Congratulations!</b> You have {balance} USDC.<br />
                  <span>Here is your exclusive content: <b>Welcome to the USDC club!</b></span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {message && <div style={{marginTop: 8, color: 'white'}}>{message}</div>}
    </div>
  );
};

const usdcGatedCode = `// USDC Gated Content Example
// This example shows how to check a user's USDC balance and unlock content if they hold any USDC.
// You can use this pattern for any SPL token on Solana mainnet.

import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount, getMint } from '@solana/spl-token';

// 1. Set your Solana RPC endpoint (mainnet)
const endpoint = 'https://rpc.helius.xyz/?api-key=YOUR_API_KEY';
// 2. Set the USDC mint address (mainnet)
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

// 3. Function to check USDC balance for a given wallet
async function checkUSDCBalance(publicKey) {
  // Connect to Solana mainnet
  const connection = new Connection(endpoint, 'confirmed');
  // Get the USDC mint as a PublicKey
  const mintPubkey = new PublicKey(USDC_MINT);
  // Derive the user's associated token account (ATA) for USDC
  const ataAddress = await getAssociatedTokenAddress(mintPubkey, publicKey);
  // Fetch the account info for the ATA
  const accountInfo = await connection.getAccountInfo(ataAddress);
  if (accountInfo) {
    // If the ATA exists, fetch the token account data
    const tokenAccount = await getAccount(connection, ataAddress);
    // Fetch the mint info to get the correct decimals
    const mintInfo = await getMint(connection, mintPubkey);
    const decimals = mintInfo.decimals;
    // Convert the raw amount to a human-readable balance
    const amount = Number(tokenAccount.amount);
    const balance = amount / Math.pow(10, decimals);
    // Token-gated logic: unlock content if balance > 0
    if (balance > 0) {
      // Show hidden content (replace this with your own logic/UI)
      console.log('Congratulations! You have', balance, 'USDC. Here is your exclusive content!');
    } else {
      // No USDC, do not show content
      console.log('No USDC found.');
    }
    return balance;
  } else {
    // ATA does not exist, user has never received USDC
    return 0;
  }
}

// Usage example:
// const walletAddress = new PublicKey('YOUR_WALLET_ADDRESS');
// checkUSDCBalance(walletAddress);
`;

const USDCGatedContentPlayground = () => {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="playground-container">
            <div className="side left" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{textAlign: 'center', width: '100%', marginBottom: 24}}>USDC Gated Content Playground</h2>
              <WalletConnect />
              <USDCGatedContent />
              <div className="card" style={{marginTop: 24}}>
                <h3>How it Works</h3>
                <ol>
                  <li>Connect your wallet.</li>
                  <li>Click <b>Check USDC Balance</b> to see if you have USDC.</li>
                  <li>If you have &gt; 0 USDC, you'll unlock exclusive content!</li>
                  <li>If not, you can create your USDC token account and try again.</li>
                </ol>
                <p>Powered by <a href="https://spl.solana.com/token" target="_blank" rel="noopener noreferrer">SPL Token Program</a>.</p>
              </div>
            </div>
            <div className="side" style={{ flex: 1, minWidth: 0 }}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 24px', marginTop: 28}}>
                <h2 style={{textAlign: 'left', margin: 0}}>Code</h2>
                <a href="/docs?guide=usdc-gated-content" style={{ color: '#60efff', fontWeight: 500, fontSize: 15 }}>Detailed Guide</a>
              </div>
              <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14, width: '100%' }}>
                {usdcGatedCode}
              </SyntaxHighlighter>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default USDCGatedContentPlayground; 