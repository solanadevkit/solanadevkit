import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { QRCodeCanvas } from 'qrcode.react';

const endpoint = 'https://rpc.helius.xyz/?api-key=d0b16cfa-5967-42dd-9613-82121f42828b';

function WalletConnect() {
  return <WalletMultiButton />;
}

const SolanaPayCheckout = () => {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [memo, setMemo] = useState('');
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [solanaPayUrl, setSolanaPayUrl] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up polling on unmount or new payment
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Poll for payment if reference is set and awaiting payment
  useEffect(() => {
    if (!reference || !recipient || !amount || paymentStatus !== 'Awaiting payment...') return;
    const connection = new Connection(endpoint, 'confirmed');
    const refPubkey = new PublicKey(reference);
    const recipientPubkey = new PublicKey(recipient);
    const expectedLamports = Math.floor(Number(amount) * LAMPORTS_PER_SOL);

    async function checkPayment() {
      try {
        const sigs = await connection.getSignaturesForAddress(refPubkey, { limit: 10 });
        for (const sigInfo of sigs) {
          const tx = await connection.getTransaction(sigInfo.signature, { commitment: 'confirmed' });
          if (!tx) continue;
          // Check for transfer to recipient with correct amount
          const innerInstructions = tx.meta?.innerInstructions || [];
          let found = false;
          for (const ix of tx.transaction.message.instructions) {
            // System transfer
            // (Omit ix.programId check for now)
            // Check if transfer to recipient
            // (For simplicity, check all instructions for now)
          }
          // Check postTokenBalances and postBalances for recipient
          const postBalances = tx.meta?.postBalances || [];
          const accountKeys = tx.transaction.message.accountKeys;
          // Check for SOL transfer
          for (let i = 0; i < accountKeys.length; i++) {
            if (accountKeys[i].equals(recipientPubkey)) {
              // Compare pre and post balances
              const pre = tx.meta?.preBalances?.[i] || 0;
              const post = tx.meta?.postBalances?.[i] || 0;
              if (post - pre === expectedLamports) {
                found = true;
              }
            }
          }
          // Check for reference in account keys
          if (found && accountKeys.some(k => k.equals(refPubkey))) {
            setPaymentStatus('Payment Confirmed');
            if (pollingRef.current) clearInterval(pollingRef.current);
            return;
          }
        }
      } catch (e) {
        // Ignore errors
      }
    }
    pollingRef.current = setInterval(checkPayment, 2000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [reference, recipient, amount, paymentStatus]);

  const handleCheckout = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setSecurityAlert(null);
    setPaymentStatus(null);
    setSolanaPayUrl(null);
    setReference(null);
    try {
      // Simulate security check (replace with actual Wallet Guardian integration)
      if (recipient === 'suspicious_address') {
        setSecurityAlert('Warning: Recipient address flagged as suspicious.');
        return;
      }
      // Generate unique reference
      const ref = Keypair.generate().publicKey.toBase58();
      setReference(ref);
      // Construct Solana Pay URL
      const url = new URL('solana:' + recipient);
      url.searchParams.set('amount', amount);
      url.searchParams.set('reference', ref);
      if (memo) url.searchParams.set('memo', memo);
      setSolanaPayUrl(url.toString());
      setPaymentStatus('Awaiting payment...');
      // Polling will start via useEffect
    } catch (e: any) {
      setPaymentStatus('Payment Failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [amount, recipient, memo]);

  return (
    <div className="card">
      <h3>Solana Pay Checkout</h3>
      <form style={{display: 'flex', flexDirection: 'column', gap: 8}} onSubmit={handleCheckout}>
        <input
          placeholder="Amount (SOL)"
          style={{padding: 8, borderRadius: 4}}
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
        />
        <input
          placeholder="Recipient Address"
          style={{padding: 8, borderRadius: 4}}
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          required
        />
        <input
          placeholder="Memo (Optional)"
          style={{padding: 8, borderRadius: 4}}
          value={memo}
          onChange={e => setMemo(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Generate QR Code'}
        </button>
      </form>
      {securityAlert && (
        <div style={{marginTop: 12, color: 'red'}}>{securityAlert}</div>
      )}
      {paymentStatus && (
        <div style={{marginTop: 12, color: paymentStatus === 'Payment Confirmed' ? 'green' : undefined}}>{paymentStatus}</div>
      )}
      {solanaPayUrl && (
        <div style={{ marginTop: 16 }}>
          <QRCodeCanvas value={solanaPayUrl} size={180} />
          <div style={{ marginTop: 8, wordBreak: 'break-all', fontSize: 12 }}>{solanaPayUrl}</div>
        </div>
      )}
    </div>
  );
};

const solanaPayCode = `// Solana Pay Checkout Example
// This example demonstrates how to integrate Solana Pay with security alerts.
// The UI generates a QR code for payments, with fields for amount, recipient, and memo.

import { Connection, PublicKey } from '@solana/web3.js';

const endpoint = 'https://rpc.helius.xyz/?api-key=YOUR_API_KEY';

async function processPayment(amount, recipient, memo) {
  // Simulate security check (replace with actual Wallet Guardian integration)
  if (recipient === 'suspicious_address') {
    console.log('Warning: Recipient address flagged as suspicious.');
    return;
  }
  // Simulate payment processing
  console.log('Payment Confirmed');
}

// Usage example:
// processPayment('1.5', 'recipient_address', 'Invoice #123');
`;

const SolanaPayCheckoutPlayground = () => {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="playground-container">
            <div className="side left" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{textAlign: 'center', width: '100%', marginBottom: 24}}>Solana Pay Checkout Playground</h2>
              <WalletConnect />
              <SolanaPayCheckout />
              <div className="card" style={{marginTop: 24}}>
                <h3>How it Works</h3>
                <ol>
                  <li>Enter the payment amount, recipient address, and optional memo.</li>
                  <li>Click <b>Generate QR Code</b> to simulate payment processing.</li>
                  <li>Review security alerts and payment status.</li>
                </ol>
                <p>Learn more about <a href="https://docs.solana.com/developing/programming-model/accounts#rent-exemption" target="_blank" rel="noopener noreferrer">Solana Pay</a> in the Solana docs.</p>
              </div>
            </div>
            <div className="side">
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 24px', marginTop: 28}}>
                <h2 style={{textAlign: 'left', margin: 0}}>Code</h2>
                <a href="/docs?guide=solana-pay-checkout" style={{ color: '#60efff', fontWeight: 500, fontSize: 15 }}>Detailed Guide</a>
              </div>
              <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14, width: '100%' }}>
                {solanaPayCode}
              </SyntaxHighlighter>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaPayCheckoutPlayground; 