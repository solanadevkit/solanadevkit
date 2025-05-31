import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const usdcGatedCode = `import { Connection, PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';

const endpoint = 'https://rpc.helius.xyz/?api-key=YOUR_API_KEY';
const connection = new Connection(endpoint, 'confirmed');
const USDC_MINT = new PublicKey('A...USDC_MINT_ADDRESS...');

const { publicKey } = useWallet();

const ata = await getAssociatedTokenAddress(USDC_MINT, publicKey);
const account = await getAccount(connection, ata);
const usdcBalance = Number(account.amount) / 1e6; // USDC has 6 decimals
console.log('USDC Balance:', usdcBalance);
`;

const USDCGatedContentGuide = () => (
  <div>
    <h1>USDC Gated Content Playground Guide</h1>
    <p>
      This guide shows you how to check a wallet's USDC balance and unlock content if the user holds enough USDC. This is a common pattern for token-gated access in dApps.
    </p>
    <h2>1. Prerequisites</h2>
    <ul>
      <li>Connect your wallet using the <b>Connect Wallet Playground</b>.</li>
      <li>Have some USDC in your wallet (on mainnet or devnet as appropriate).</li>
    </ul>
    <h2>2. Install Dependencies</h2>
    <pre>
      <code>npm install @solana/web3.js @solana/wallet-adapter-react @solana/spl-token</code>
    </pre>
    <h2>3. Get the Associated Token Account (ATA)</h2>
    <p>
      Use <code>getAssociatedTokenAddress</code> to find the user's USDC token account.
    </p>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
{`const ata = await getAssociatedTokenAddress(USDC_MINT, publicKey);`}
    </SyntaxHighlighter>
    <h2>4. Fetch the USDC Balance</h2>
    <p>
      Use <code>getAccount</code> to fetch the token account and read the balance.
    </p>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
{`const account = await getAccount(connection, ata);
const usdcBalance = Number(account.amount) / 1e6; // USDC has 6 decimals`}
    </SyntaxHighlighter>
    <h2>5. Unlock Content Based on Balance</h2>
    <p>
      Show or hide content based on the user's USDC balance.
    </p>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
{`if (usdcBalance >= 1) {
  // Unlock content
} else {
  // Show locked message
}`}
    </SyntaxHighlighter>
    <h2>6. Full Example</h2>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
      {usdcGatedCode}
    </SyntaxHighlighter>
    <h2>7. Next Steps</h2>
    <ul>
      <li>Try the <b>USDC Gated Content Playground</b>!</li>
      <li>Use this pattern for any SPL token-gated content or features.</li>
      <li>Explore more advanced gating (NFTs, multiple tokens, etc.).</li>
    </ul>
  </div>
);

export default USDCGatedContentGuide; 