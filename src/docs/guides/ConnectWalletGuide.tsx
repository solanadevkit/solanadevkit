import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

const ConnectWalletGuide = () => (
  <div>
    <h1>Connect Wallet Playground Guide</h1>
    <p>
      This guide shows you how to connect a Solana wallet (like Phantom) to your dApp using the Solana Wallet Adapter libraries. Connecting a wallet is the first step for any Solana application.
    </p>
    <h2>1. Install Dependencies</h2>
    <pre>
      <code>npm install @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-phantom @solana/web3.js</code>
    </pre>
    <h2>2. Wrap Your App with Providers</h2>
    <p>
      Use <code>ConnectionProvider</code>, <code>WalletProvider</code>, and <code>WalletModalProvider</code> to set up the wallet context for your app.
    </p>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
      {connectWalletCode}
    </SyntaxHighlighter>
    <h2>3. Add the Wallet Button</h2>
    <p>
      Use <code>&lt;WalletMultiButton /&gt;</code> to let users connect or disconnect their wallet. You can also access the connected wallet address and balance using the <code>useWallet</code> hook.
    </p>
    <h2>4. Display the Connected Address and Balance</h2>
    <p>
      Once connected, you can show the user's public key and fetch their SOL balance:
    </p>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
{`const { publicKey, connected } = useWallet();
const [balance, setBalance] = useState<number | null>(null);

useEffect(() => {
  if (!publicKey) return setBalance(null);
  const connection = new Connection(endpoint, 'confirmed');
  connection.getBalance(publicKey).then(lamports => setBalance(lamports / 1e9));
}, [publicKey]);

return (
  <div>
    <WalletMultiButton />
    {connected && publicKey && (
      <div>
        <div>Address: {publicKey.toBase58()}</div>
        <div>SOL Balance: {balance}</div>
      </div>
    )}
  </div>
);
`}
    </SyntaxHighlighter>
    <h2>5. Next Steps</h2>
    <ul>
      <li>Try connecting your wallet in the <b>Connect Wallet Playground</b>!</li>
      <li>Use this pattern as the foundation for all other Solana playgrounds and dApps.</li>
    </ul>
  </div>
);

export default ConnectWalletGuide; 