import React, { useMemo, useState, useEffect } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { Connection, PublicKey } from '@solana/web3.js';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const endpoint = 'https://rpc.helius.xyz/?api-key=d0b16cfa-5967-42dd-9613-82121f42828b';

// Only show address and balance if connected
const ConnectedInfo = () => {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!publicKey) return setBalance(null);
    const connection = new Connection(endpoint, 'confirmed');
    connection.getBalance(publicKey).then(lamports => setBalance(lamports / 1e9));
  }, [publicKey]);

  if (!connected || !publicKey) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{ textAlign: 'center' }}><b>Connected Address:</b><br /><span style={{ fontFamily: 'monospace', fontSize: 15 }}>{publicKey.toBase58()}</span></div>
      <div style={{ marginTop: 8, textAlign: 'center' }}><b>SOL Balance:</b> {balance === null ? '...' : balance + ' SOL'}</div>
    </div>
  );
};

const connectWalletCode = `import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

const endpoint = 'https://rpc.helius.xyz/?api-key=YOUR_API_KEY';
const wallets = [new PhantomWalletAdapter()];

<ConnectionProvider endpoint={endpoint}>
  <WalletProvider wallets={wallets} autoConnect>
    <WalletModalProvider>
      <WalletMultiButton />
      {/* Your app here */}
    </WalletModalProvider>
  </WalletProvider>
</ConnectionProvider>
`;

const ConnectWalletPlayground = () => {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="playground-container">
            <div className="side left" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{textAlign: 'center', width: '100%', marginBottom: 24}}>Connect Wallet Playground</h2>
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <WalletMultiButton />
              </div>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 40 }}>
                {/* Only show address and balance if connected */}
                <ConnectedInfo />
              </div>
              <div className="card" style={{marginTop: 24}}>
                <h3>How it Works</h3>
                <ol>
                  <li>Click the button to connect your Solana wallet (e.g., Phantom).</li>
                  <li>See your wallet address and SOL balance.</li>
                  <li>Use this pattern as the foundation for all Solana dApps.</li>
                </ol>
              </div>
            </div>
            <div className="side" style={{ flex: 1, minWidth: 0 }}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 24px', marginTop: 48}}>
                <h2 style={{textAlign: 'left', margin: 0}}>Code</h2>
                <a href="/docs?guide=connect-wallet" style={{ color: '#60efff', fontWeight: 500, fontSize: 15 }}>Detailed Guide</a>
              </div>
              <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14, width: '100%' }}>
                {connectWalletCode}
              </SyntaxHighlighter>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default ConnectWalletPlayground; 