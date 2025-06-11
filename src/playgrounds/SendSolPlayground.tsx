import React, { useMemo, useCallback, useState } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

function WalletConnect() {
  return <WalletMultiButton />;
}

const endpoint = 'https://rpc.helius.xyz/?api-key=d0b16cfa-5967-42dd-9613-82121f42828b';

const SendSolForm = () => {
  const { publicKey, sendTransaction, connected } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      if (!publicKey) throw new Error('Wallet not connected');
      const recipientPubkey = new PublicKey(recipient);
      const lamports = Math.floor(Number(amount) * 1e9);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports,
        })
      );
      const connection = new Connection(endpoint, 'confirmed');
      const signature = await sendTransaction(transaction, connection);
      setMessage(`Sent! Tx: ${signature}`);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [publicKey, recipient, amount, sendTransaction]);

  return (
    <form style={{display: 'flex', flexDirection: 'column', gap: 8}} onSubmit={handleSend}>
      <input
        placeholder="Recipient Address"
        style={{padding: 8, borderRadius: 4}}
        value={recipient}
        onChange={e => setRecipient(e.target.value)}
        required
      />
      <input
        placeholder="Amount (SOL)"
        type="number"
        style={{padding: 8, borderRadius: 4}}
        value={amount}
        onChange={e => setAmount(e.target.value)}
        min="0"
        step="0.0001"
        required
      />
      <button type="submit" disabled={loading || !connected} style={{width: 'auto', minWidth: 120}}>
        {loading ? 'Sending...' : 'Send SOL'}
      </button>
      {message && <div style={{marginTop: 8, color: 'white'}}>{message}</div>}
    </form>
  );
};

const sendSolCode = `// Import Solana wallet adapter and web3 dependencies\nimport { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';\nimport { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';\nimport { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';\nimport { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';\nimport { useWallet } from '@solana/wallet-adapter-react';\nimport React, { useState, useCallback } from 'react';\n\n// Set the Solana devnet endpoint and supported wallets\nconst endpoint = 'https://rpc.helius.xyz/?api-key=d0b16cfa-5967-42dd-9613-82121f42828b';\nconst wallets = [new PhantomWalletAdapter()];\n\n// Form component to send SOL\nfunction SendSolForm() {\n  // Access wallet state and sendTransaction function\n  const { publicKey, sendTransaction, connected } = useWallet();\n  const [recipient, setRecipient] = useState('');\n  const [amount, setAmount] = useState('');\n  const [message, setMessage] = useState(null);\n  const [loading, setLoading] = useState(false);\n\n  // Handle form submission\n  const handleSend = useCallback(async (e) => {\n    e.preventDefault();\n    setMessage(null);\n    setLoading(true);\n    try {\n      // Ensure wallet is connected\n      if (!publicKey) throw new Error('Wallet not connected');\n      // Parse recipient address and amount\n      const recipientPubkey = new PublicKey(recipient);\n      const lamports = Math.floor(Number(amount) * 1e9); // Convert SOL to lamports\n      // Create a transfer transaction\n      const transaction = new Transaction().add(\n        SystemProgram.transfer({\n          fromPubkey: publicKey,\n          toPubkey: recipientPubkey,\n          lamports,\n        })\n      );\n      // Connect to Solana and send the transaction\n      const connection = new Connection(endpoint, 'confirmed');\n      const signature = await sendTransaction(transaction, connection);\n      setMessage('Sent! Tx: ' + signature);\n    } catch (err) {\n      setMessage('Error: ' + err.message);\n    } finally {\n      setLoading(false);\n    }\n  }, [publicKey, recipient, amount, sendTransaction]);\n\n  return (\n    <form onSubmit={handleSend}>\n      {/* Recipient address input */}\n      <input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="Recipient Address" required />\n      {/* Amount input */}\n      <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (SOL)" type="number" min="0" step="0.0001" required />\n      {/* Send button */}\n      <button type="submit" disabled={loading || !connected}>{loading ? 'Sending...' : 'Send SOL'}</button>\n      {/* Show transaction status */}\n      {message && <div>{message}</div>}\n    </form>\n  );\n}\n\n// Main app with wallet providers and UI\nexport default function App() {\n  return (\n    <ConnectionProvider endpoint={endpoint}>\n      <WalletProvider wallets={wallets} autoConnect>\n        <WalletModalProvider>\n          {/* Wallet connect button */}\n          <WalletMultiButton />\n          {/* Send SOL form */}\n          <SendSolForm />\n        </WalletModalProvider>\n      </WalletProvider>\n    </ConnectionProvider>\n  );\n}\n`;

const SendSolPlayground = () => {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="playground-container">
            <div className="side left" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{textAlign: 'center', width: '100%', marginBottom: 24}}>Send Sol Playground</h2>
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <WalletConnect />
              </div>
              <div className="card" style={{ marginTop: 0 }}>
                <SendSolForm />
              </div>
              <div className="card" style={{marginTop: 24}}>
                <h3>How it Works</h3>
                <ol>
                  <li>Connect your wallet.</li>
                  <li>Enter the recipient's address and amount of SOL.</li>
                  <li>Click <b>Send SOL</b> to send.</li>
                  <li>View transaction status and confirmation.</li>
                </ol>
              </div>
            </div>
            <div className="side" style={{ flex: 1, minWidth: 0 }}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 24px', marginTop: 28}}>
                <h2 style={{textAlign: 'left', margin: 0}}>Code</h2>
                <a href="/docs?guide=send-sol" style={{ color: '#60efff', fontWeight: 500, fontSize: 15 }}>Detailed Guide</a>
              </div>
              <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14, width: '100%' }}>
                {sendSolCode}
              </SyntaxHighlighter>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SendSolPlayground; 