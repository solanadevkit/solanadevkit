import React, { useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const endpoint = 'https://rpc.helius.xyz/?api-key=YOUR_API_KEY';
const wallets = [new PhantomWalletAdapter()];

const INITIAL_POOL = { sol: 100, usdc: 2500, shares: 100 };
const INITIAL_USER = { sol: 10, usdc: 500, shares: 0 };

const liquidityPoolCode = `import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
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

const LiquidityPoolPlayground = () => {
  const [user, setUser] = useState({ ...INITIAL_USER });
  const [pool, setPool] = useState({ ...INITIAL_POOL });
  const [addSol, setAddSol] = useState('');
  const [addUsdc, setAddUsdc] = useState('');
  const [removeShares, setRemoveShares] = useState('');
  const [message, setMessage] = useState('');

  const handleAddLiquidity = (e: React.FormEvent) => {
    e.preventDefault();
    const sol = parseFloat(addSol);
    const usdc = parseFloat(addUsdc);
    if (isNaN(sol) || isNaN(usdc) || sol <= 0 || usdc <= 0) {
      setMessage('Enter valid amounts for both tokens.');
      return;
    }
    if (sol > user.sol || usdc > user.usdc) {
      setMessage('Insufficient balance.');
      return;
    }
    // Calculate shares to mint (simple proportional formula)
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
    setMessage(`Added liquidity! Minted ${sharesMinted.toFixed(2)} pool shares.`);
    setAddSol('');
    setAddUsdc('');
  };

  const handleRemoveLiquidity = (e: React.FormEvent) => {
    e.preventDefault();
    const shares = parseFloat(removeShares);
    if (isNaN(shares) || shares <= 0) {
      setMessage('Enter a valid share amount.');
      return;
    }
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
    setMessage(`Removed liquidity! Received ${solOut.toFixed(2)} SOL and ${usdcOut.toFixed(2)} USDC.`);
    setRemoveShares('');
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="playground-container">
            <div className="side left" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{textAlign: 'center', width: '100%', marginBottom: 24}}>Liquidity Pool Playground (Simulated)</h2>
              <WalletMultiButton />
              <div className="card" style={{ marginTop: 24, width: '100%', maxWidth: 400 }}>
                <h3>Add Liquidity</h3>
                <form onSubmit={handleAddLiquidity} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input type="number" step="0.01" min="0" placeholder="SOL Amount" value={addSol} onChange={e => setAddSol(e.target.value)} required />
                  <input type="number" step="0.01" min="0" placeholder="USDC Amount" value={addUsdc} onChange={e => setAddUsdc(e.target.value)} required />
                  <button type="submit">Add Liquidity</button>
                </form>
              </div>
              <div className="card" style={{ marginTop: 24, width: '100%', maxWidth: 400 }}>
                <h3>Remove Liquidity</h3>
                <form onSubmit={handleRemoveLiquidity} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input type="number" step="0.01" min="0" placeholder="Pool Shares to Remove" value={removeShares} onChange={e => setRemoveShares(e.target.value)} required />
                  <button type="submit">Remove Liquidity</button>
                </form>
              </div>
              <div className="card" style={{ marginTop: 24, width: '100%', maxWidth: 400 }}>
                <h3>Your Balances</h3>
                <div>SOL: {user.sol.toFixed(2)}</div>
                <div>USDC: {user.usdc.toFixed(2)}</div>
                <div>Pool Shares: {user.shares.toFixed(2)}</div>
              </div>
              <div className="card" style={{ marginTop: 24, width: '100%', maxWidth: 400 }}>
                <h3>Pool Stats</h3>
                <div>Total SOL: {pool.sol.toFixed(2)}</div>
                <div>Total USDC: {pool.usdc.toFixed(2)}</div>
                <div>Total Shares: {pool.shares.toFixed(2)}</div>
              </div>
              {message && <div style={{marginTop: 16, color: '#60efff', fontWeight: 500}}>{message}</div>}
              <div className="card" style={{marginTop: 24}}>
                <h3>How it Works</h3>
                <ol>
                  <li>Connect your wallet.</li>
                  <li>Enter SOL and USDC amounts to add liquidity.</li>
                  <li>Click <b>Add Liquidity</b> to mint pool shares.</li>
                  <li>Remove liquidity by burning shares to get back tokens.</li>
                  <li>View your balances and pool stats.</li>
                </ol>
              </div>
            </div>
            <div className="side" style={{ flex: 1, minWidth: 0 }}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 24px', marginTop: 28}}>
                <h2 style={{textAlign: 'left', margin: 0}}>Code</h2>
                <a href="/docs?guide=liquidity-pool" style={{ color: '#60efff', fontWeight: 500, fontSize: 15 }}>Detailed Guide</a>
              </div>
              <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14, width: '100%' }}>
                {liquidityPoolCode}
              </SyntaxHighlighter>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default LiquidityPoolPlayground; 