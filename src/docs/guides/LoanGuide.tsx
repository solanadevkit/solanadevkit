import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const loanGuideCode = `import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

const endpoint = 'https://rpc.helius.xyz/?api-key=YOUR_API_KEY';
const wallets = [new PhantomWalletAdapter()];

<ConnectionProvider endpoint={endpoint}>
  <WalletProvider wallets={wallets} autoConnect>
    <WalletModalProvider>
      <WalletMultiButton />
      {/* Loan logic here */}
    </WalletModalProvider>
  </WalletProvider>
</ConnectionProvider>

// Deposit SOL as Collateral
const handleDeposit = (sol) => {
  if (sol > user.sol) {
    setMessage('Insufficient SOL balance.');
    return;
  }
  setUser({ ...user, sol: user.sol - sol, collateral: user.collateral + sol });
  setMessage('Deposited ' + sol + ' SOL as collateral.');
};

// Borrow USDC
const handleBorrow = (usdc) => {
  const maxBorrow = user.collateral * 0.5 - user.debt;
  if (usdc > maxBorrow) {
    setMessage('Borrow amount exceeds maximum allowed by collateral.');
    return;
  }
  setUser({ ...user, usdc: user.usdc + usdc, debt: user.debt + usdc });
  setMessage('Borrowed ' + usdc + ' USDC.');
};

// Repay USDC
const handleRepay = (usdc) => {
  if (usdc > user.usdc) {
    setMessage('Insufficient USDC balance.');
    return;
  }
  const repayAmount = Math.min(usdc, user.debt);
  setUser({ ...user, usdc: user.usdc - repayAmount, debt: user.debt - repayAmount });
  setMessage('Repaid ' + repayAmount + ' USDC debt.');
};

// Withdraw SOL Collateral
const handleWithdraw = (sol) => {
  if (sol > user.collateral) {
    setMessage('Insufficient collateral.');
    return;
  }
  const newCollateral = user.collateral - sol;
  if (user.debt > newCollateral * 0.5) {
    setMessage('Withdrawal would exceed allowed LTV.');
    return;
  }
  setUser({ ...user, sol: user.sol + sol, collateral: user.collateral - sol });
  setMessage('Withdrew ' + sol + ' SOL from collateral.');
};
`;

const LoanGuide = () => (
  <div>
    <h1>Loan Playground Guide</h1>
    <p>
      This guide shows you how to simulate decentralized lending and borrowing. No real transactions are performed—this is for learning and experimentation.
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
    <h2>3. How to Deposit SOL as Collateral</h2>
    <ol>
      <li>Enter the amount of SOL to deposit.</li>
      <li>Click <b>Deposit</b> to add it as collateral.</li>
    </ol>
    <h2>4. How to Borrow USDC</h2>
    <ol>
      <li>Enter the amount of USDC to borrow (up to 50% of your collateral value).</li>
      <li>Click <b>Borrow</b> to receive USDC and increase your debt.</li>
    </ol>
    <h2>5. How to Repay USDC</h2>
    <ol>
      <li>Enter the amount of USDC to repay.</li>
      <li>Click <b>Repay</b> to reduce your debt and unlock collateral.</li>
    </ol>
    <h2>6. How to Withdraw SOL Collateral</h2>
    <ol>
      <li>Enter the amount of SOL to withdraw from collateral.</li>
      <li>Click <b>Withdraw</b> (only possible if your health factor allows).</li>
    </ol>
    <h2>7. Example Code</h2>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
      {loanGuideCode}
    </SyntaxHighlighter>
    <h2>8. Next Steps</h2>
    <ul>
      <li>Experiment with different amounts and see how your health factor changes.</li>
      <li>Try repaying and withdrawing to understand the lending logic.</li>
      <li>Use this simulation to understand the basics before using real DeFi protocols.</li>
    </ul>
  </div>
);

export default LoanGuide; 