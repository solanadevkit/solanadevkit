import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

const liquidityPoolGuideCode = `import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

const endpoint = 'https://rpc.helius.xyz/?api-key=YOUR_API_KEY';
const wallets = [new PhantomWalletAdapter()];

<ConnectionProvider endpoint={endpoint}>
  <WalletProvider wallets={wallets} autoConnect>
    <WalletModalProvider>
      <WalletMultiButton />
      {/* Add/Remove Liquidity Logic */}
      {/* ... */}
    </WalletModalProvider>
  </WalletProvider>
</ConnectionProvider>

// Add Liquidity (Simulated)
const handleAddLiquidity = (sol, usdc) => {
  if (sol > user.sol || usdc > user.usdc) {
    setMessage('Insufficient balance.');
    return;
  }
  // Calculate shares to mint (proportional to pool)
  const shareRatio = Math.min(sol / pool.sol, usdc / pool.usdc);
  const sharesMinted = shareRatio * pool.shares;
  setUser({
    sol: user.sol - sol,
    usdc: user.usdc - usdc,
    shares: user.shares + sharesMinted,
  });
  setPool({
    sol: pool.sol + sol,
    usdc: pool.usdc + usdc,
    shares: pool.shares + sharesMinted,
  });
  setMessage('Added liquidity! Minted ' + sharesMinted.toFixed(2) + ' pool shares.');
};

// Remove Liquidity (Simulated)
const handleRemoveLiquidity = (shares) => {
  if (shares > user.shares) {
    setMessage('You do not have enough pool shares.');
    return;
  }
  // Calculate tokens to return
  const solOut = (shares / pool.shares) * pool.sol;
  const usdcOut = (shares / pool.shares) * pool.usdc;
  setUser({
    sol: user.sol + solOut,
    usdc: user.usdc + usdcOut,
    shares: user.shares - shares,
  });
  setPool({
    sol: pool.sol - solOut,
    usdc: pool.usdc - usdcOut,
    shares: pool.shares - shares,
  });
  setMessage('Removed liquidity! Received ' + solOut.toFixed(2) + ' SOL and ' + usdcOut.toFixed(2) + ' USDC.');
};
`;

const LiquidityPoolGuide = () => (
  <div>
    <h1>Liquidity Pool Playground Guide</h1>
    <p>
      This guide shows you how to simulate adding and removing liquidity in a two-token pool (SOL/USDC). No real transactions are performed—this is for learning and experimentation.
    </p>
    <h2>1. Prerequisites</h2>
    <ul>
      <li>Connect your wallet using the <b>Connect Wallet</b> button.</li>
      <li>Ensure you have simulated balances of SOL and USDC.</li>
    </ul>
    <h2>2. Install Dependencies</h2>
    <pre>
      <code>npm install @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-phantom @solana/web3.js</code>
    </pre>
    <h2>2. How to Add Liquidity</h2>
    <ol>
      <li>Enter the amount of SOL and USDC you want to add.</li>
      <li>Click <b>Add Liquidity</b>.</li>
      <li>You will receive pool shares proportional to your contribution.</li>
    </ol>
    <h2>3. How to Remove Liquidity</h2>
    <ol>
      <li>Enter the number of pool shares you want to burn.</li>
      <li>Click <b>Remove Liquidity</b>.</li>
      <li>You will receive SOL and USDC back, proportional to your share.</li>
    </ol>
    <h2>4. Example Code</h2>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
      {liquidityPoolGuideCode}
    </SyntaxHighlighter>
    <h2>5. Pool Stats</h2>
    <p>
      The pool stats section shows the total SOL, USDC, and pool shares. Your balances and pool share are also displayed.
    </p>
    <h2>6. Next Steps</h2>
    <ul>
      <li>Experiment with different amounts and see how your pool share changes.</li>
      <li>Try removing liquidity and observe how your balances update.</li>
      <li>Use this simulation to understand the basics before using real DeFi protocols.</li>
    </ul>
  </div>
);

export default LiquidityPoolGuide; 