import React, { useState, useMemo, useCallback } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { Connection, PublicKey } from '@solana/web3.js';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

const endpoint = 'https://rpc.helius.xyz/?api-key=d0b16cfa-5967-42dd-9613-82121f42828b';

function WalletConnect() {
  return <WalletMultiButton />;
}

const RentExemptionChecker = () => {
  const [pubkeyInput, setPubkeyInput] = useState('');
  const [result, setResult] = useState<null | {
    balance: number;
    rentExempt: boolean;
    minBalance: number;
    error?: string;
  }>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setResult(null);
    setLoading(true);
    try {
      // Connect to the Solana network using the provided endpoint
      const connection = new Connection(endpoint, 'confirmed');
      // Convert the input string to a PublicKey object
      const pubkey = new PublicKey(pubkeyInput);
      // Fetch the account info for the given public key
      const accountInfo = await connection.getAccountInfo(pubkey);
      if (!accountInfo) throw new Error('Account not found');
      // Calculate the minimum balance required for rent exemption based on the account's data length
      const minBalance = await connection.getMinimumBalanceForRentExemption(accountInfo.data.length);
      // Convert lamports to SOL for display
      const balance = accountInfo.lamports / 1e9;
      // Determine if the account is rent-exempt by comparing its balance to the minimum required
      setResult({
        balance,
        rentExempt: accountInfo.lamports >= minBalance,
        minBalance: minBalance / 1e9,
      });
    } catch (e: any) {
      setResult({ balance: 0, rentExempt: false, minBalance: 0, error: e.message });
    } finally {
      setLoading(false);
    }
  }, [pubkeyInput]);

  return (
    <div className="card">
      <h3>Check Account Rent Exemption</h3>
      <form style={{display: 'flex', flexDirection: 'column', gap: 8}} onSubmit={handleCheck}>
        <input
          placeholder="Enter any Solana public key"
          style={{padding: 8, borderRadius: 4}}
          value={pubkeyInput}
          onChange={e => setPubkeyInput(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Checking...' : 'Check Rent Exemption'}
        </button>
      </form>
      {result && (
        <div style={{marginTop: 12}}>
          {result.error ? (
            <div style={{color: 'red'}}>{result.error}</div>
          ) : (
            <>
              <div><b>Balance:</b> {result.balance} SOL</div>
              <div><b>Rent-Exempt:</b> {result.rentExempt ? '✅ Yes' : '❌ No'}</div>
              <div><b>Min. for Exemption:</b> {result.minBalance} SOL</div>
              {!result.rentExempt && (
                <div style={{marginTop: 8, color: '#ffb347'}}>
                  This account needs at least <b>{result.minBalance} SOL</b> to be rent-exempt.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const rentExemptionCode = `// Rent Exemption Checker Example
// This example shows how to check if a Solana account is rent-exempt.
// Rent-exempt accounts are not deleted and do not lose lamports over time.

import { Connection, PublicKey } from '@solana/web3.js';

const endpoint = 'https://rpc.helius.xyz/?api-key=YOUR_API_KEY';

async function checkRentExemption(pubkeyStr) {
  // Connect to the Solana network using the provided endpoint
  const connection = new Connection(endpoint, 'confirmed');
  // Convert the input string to a PublicKey object
  const pubkey = new PublicKey(pubkeyStr);
  // Fetch the account info for the given public key
  const accountInfo = await connection.getAccountInfo(pubkey);
  if (!accountInfo) throw new Error('Account not found');
  // Calculate the minimum balance required for rent exemption based on the account's data length
  const minBalance = await connection.getMinimumBalanceForRentExemption(accountInfo.data.length);
  // Convert lamports to SOL for display
  const balance = accountInfo.lamports / 1e9;
  // Determine if the account is rent-exempt by comparing its balance to the minimum required
  const rentExempt = accountInfo.lamports >= minBalance;
  console.log('Balance:', balance, 'SOL');
  console.log('Rent-Exempt:', rentExempt);
  console.log('Min. for Exemption:', minBalance / 1e9, 'SOL');
  return { balance, rentExempt, minBalance: minBalance / 1e9 };
}

// Usage example:
// checkRentExemption('YOUR_ACCOUNT_PUBLIC_KEY');
`;

const RentExemptionPlayground = () => {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="playground-container">
            <div className="side left" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{textAlign: 'center', width: '100%', marginBottom: 24}}>Rent Exemption Playground</h2>
              <WalletConnect />
              <RentExemptionChecker />
              <div className="card" style={{marginTop: 24}}>
                <h3>How it Works</h3>
                <ol>
                  <li>Paste any Solana account public key.</li>
                  <li>Click <b>Check Rent Exemption</b>.</li>
                  <li>See if the account is rent-exempt and how much SOL is needed for exemption.</li>
                </ol>
                <p>Learn more about <a href="https://docs.solana.com/developing/programming-model/accounts#rent-exemption" target="_blank" rel="noopener noreferrer">rent exemption</a> in the Solana docs.</p>
              </div>
            </div>
            <div className="side" style={{ flex: 1, minWidth: 0 }}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 24px', marginTop: 28}}>
                <h2 style={{textAlign: 'left', margin: 0}}>Code</h2>
                <a href="/docs?guide=rent-exemption" style={{ color: '#60efff', fontWeight: 500, fontSize: 15 }}>Detailed Guide</a>
              </div>
              <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14, width: '100%' }}>
                {rentExemptionCode}
              </SyntaxHighlighter>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default RentExemptionPlayground; 