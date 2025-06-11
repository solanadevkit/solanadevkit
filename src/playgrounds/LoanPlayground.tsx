import React, { useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const endpoint = 'https://rpc.helius.xyz/?api-key=YOUR_API_KEY';

const INITIAL_USER = { sol: 10, usdc: 0, collateral: 0, debt: 0 };
const LTV = 0.5; // 50% loan-to-value
const LIQ_THRESHOLD = 0.8; // 80% liquidation threshold

const LoanPlayground = () => {
  const [user, setUser] = useState({ ...INITIAL_USER });
  const [depositSol, setDepositSol] = useState('');
  const [borrowUsdc, setBorrowUsdc] = useState('');
  const [repayUsdc, setRepayUsdc] = useState('');
  const [withdrawSol, setWithdrawSol] = useState('');
  const [message, setMessage] = useState('');
  const wallets = React.useMemo(() => [new PhantomWalletAdapter()], []);

  const healthFactor = user.debt === 0 ? '∞' : ((user.collateral * LIQ_THRESHOLD) / user.debt).toFixed(2);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const sol = parseFloat(depositSol);
    if (isNaN(sol) || sol <= 0) {
      setMessage('Enter a valid SOL amount.');
      return;
    }
    if (sol > user.sol) {
      setMessage('Insufficient SOL balance.');
      return;
    }
    setUser({ ...user, sol: user.sol - sol, collateral: user.collateral + sol });
    setMessage(`Deposited ${sol} SOL as collateral.`);
    setDepositSol('');
  };

  const handleBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    const usdc = parseFloat(borrowUsdc);
    if (isNaN(usdc) || usdc <= 0) {
      setMessage('Enter a valid USDC amount.');
      return;
    }
    const maxBorrow = user.collateral * LTV - user.debt;
    if (usdc > maxBorrow) {
      setMessage('Borrow amount exceeds maximum allowed by collateral.');
      return;
    }
    setUser({ ...user, usdc: user.usdc + usdc, debt: user.debt + usdc });
    setMessage(`Borrowed ${usdc} USDC.`);
    setBorrowUsdc('');
  };

  const handleRepay = (e: React.FormEvent) => {
    e.preventDefault();
    const usdc = parseFloat(repayUsdc);
    if (isNaN(usdc) || usdc <= 0) {
      setMessage('Enter a valid USDC amount.');
      return;
    }
    if (usdc > user.usdc) {
      setMessage('Insufficient USDC balance.');
      return;
    }
    const repayAmount = Math.min(usdc, user.debt);
    setUser({ ...user, usdc: user.usdc - repayAmount, debt: user.debt - repayAmount });
    setMessage(`Repaid ${repayAmount} USDC debt.`);
    setRepayUsdc('');
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const sol = parseFloat(withdrawSol);
    if (isNaN(sol) || sol <= 0) {
      setMessage('Enter a valid SOL amount.');
      return;
    }
    if (sol > user.collateral) {
      setMessage('Insufficient collateral.');
      return;
    }
    // Check if withdrawal would violate LTV
    const newCollateral = user.collateral - sol;
    if (user.debt > newCollateral * LTV) {
      setMessage('Withdrawal would exceed allowed LTV.');
      return;
    }
    setUser({ ...user, sol: user.sol + sol, collateral: user.collateral - sol });
    setMessage(`Withdrew ${sol} SOL from collateral.`);
    setWithdrawSol('');
  };

  const loanPlaygroundCode = `import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
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

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="playground-container">
            <div className="side left" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{textAlign: 'center', width: '100%', marginBottom: 24}}>Loan Playground (Simulated)</h2>
              <WalletMultiButton />
              <div className="card" style={{ marginTop: 24, width: '100%', maxWidth: 400 }}>
                <h3>Deposit SOL as Collateral</h3>
                <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input type="number" step="0.01" min="0" placeholder="SOL Amount" value={depositSol} onChange={e => setDepositSol(e.target.value)} required />
                  <button type="submit">Deposit</button>
                </form>
              </div>
              <div className="card" style={{ marginTop: 24, width: '100%', maxWidth: 400 }}>
                <h3>Borrow USDC</h3>
                <form onSubmit={handleBorrow} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input type="number" step="0.01" min="0" placeholder="USDC Amount" value={borrowUsdc} onChange={e => setBorrowUsdc(e.target.value)} required />
                  <button type="submit">Borrow</button>
                </form>
              </div>
              <div className="card" style={{ marginTop: 24, width: '100%', maxWidth: 400 }}>
                <h3>Repay USDC</h3>
                <form onSubmit={handleRepay} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input type="number" step="0.01" min="0" placeholder="USDC Amount" value={repayUsdc} onChange={e => setRepayUsdc(e.target.value)} required />
                  <button type="submit">Repay</button>
                </form>
              </div>
              <div className="card" style={{ marginTop: 24, width: '100%', maxWidth: 400 }}>
                <h3>Withdraw SOL Collateral</h3>
                <form onSubmit={handleWithdraw} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input type="number" step="0.01" min="0" placeholder="SOL Amount" value={withdrawSol} onChange={e => setWithdrawSol(e.target.value)} required />
                  <button type="submit">Withdraw</button>
                </form>
              </div>
              <div className="card" style={{ marginTop: 24, width: '100%', maxWidth: 400 }}>
                <h3>Your Balances</h3>
                <div>SOL: {user.sol.toFixed(2)}</div>
                <div>USDC: {user.usdc.toFixed(2)}</div>
                <div>Collateral: {user.collateral.toFixed(2)} SOL</div>
                <div>Debt: {user.debt.toFixed(2)} USDC</div>
                <div>Health Factor: {healthFactor}</div>
              </div>
              {message && <div style={{marginTop: 16, color: '#60efff', fontWeight: 500}}>{message}</div>}
              <div className="card" style={{marginTop: 24}}>
                <h3>How it Works</h3>
                <ol>
                  <li>Connect your wallet.</li>
                  <li>Deposit SOL as collateral.</li>
                  <li>Borrow USDC up to 50% of your collateral value.</li>
                  <li>Repay USDC debt to unlock collateral.</li>
                  <li>Withdraw SOL collateral if your health factor allows.</li>
                </ol>
              </div>
            </div>
            <div className="side" style={{ flex: 1, minWidth: 0 }}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 24px', marginTop: 28}}>
                <h2 style={{textAlign: 'left', margin: 0}}>Code</h2>
                <a href="/docs?guide=loan" style={{ color: '#60efff', fontWeight: 500, fontSize: 15 }}>Detailed Guide</a>
              </div>
              <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14, width: '100%' }}>
                {loanPlaygroundCode}
              </SyntaxHighlighter>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default LoanPlayground; 