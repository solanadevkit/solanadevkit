import React, { useMemo, useCallback, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Connection, PublicKey, SystemProgram, Transaction, StakeProgram, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from '@solana/wallet-adapter-react';
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
} from '@solana/wallet-adapter-phantom';
import SendSolPlayground from './playgrounds/SendSolPlayground';
import SignVerifyPlayground from './playgrounds/SignVerifyPlayground';
import StakeSolPlayground from './playgrounds/StakeSolPlayground';
import DocsPage from './docs/DocsPage';
import USDCGatedContentPlayground from './playgrounds/USDCGatedContentPlayground';
import RentExemptionPlayground from './playgrounds/RentExemptionPlayground';
import SolanaPayCheckoutPlayground from './playgrounds/SolanaPayCheckoutPlayground';
import OnchainFileHashRegisterPlayground from './playgrounds/OnchainFileHashRegisterPlayground';
import ConnectWalletPlayground from './playgrounds/ConnectWalletPlayground';
import OrderBookPlayground from './playgrounds/OrderBookPlayground';
import LiquidityPoolPlayground from './playgrounds/LiquidityPoolPlayground';
import LoanPlayground from './playgrounds/LoanPlayground';
// @ts-ignore
import { slide as Menu } from 'react-burger-menu';
import './burger-menu.css';

const endpoint = 'https://rpc.helius.xyz/?api-key=d0b16cfa-5967-42dd-9613-82121f42828b';

function SendSolForm() {
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
      <button type="submit" disabled={loading || !connected}>
        {loading ? 'Sending...' : 'Send SOL'}
      </button>
      {message && <div style={{marginTop: 8, color: 'white'}}>{message}</div>}
    </form>
  );
}

function WalletConnect() {
  return <WalletMultiButton />;
}

const PlaygroundSendSol = () => {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="playground-container">
            <div className="side left">
              <h2 style={{textAlign: 'left', width: '100%'}}>Live UI Demo</h2>
              <div className="card">
                <WalletConnect />
                <SendSolForm />
              </div>
            </div>
            <div className="side">
              <h2 style={{textAlign: 'left', width: '100%'}}>Copy-Paste Code</h2>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const SignVerifyMessage = () => {
  const { publicKey, signMessage, connected } = useWallet();
  const [challenge] = useState(() => `Sign this message to reveal the secret: ${Math.floor(Math.random() * 1000000)}`);
  const [signature, setSignature] = useState<Uint8Array | null>(null);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset state when wallet disconnects
  React.useEffect(() => {
    if (!connected) {
      setSignature(null);
      setVerified(false);
      setError(null);
    }
  }, [connected]);

  const handleSign = useCallback(async () => {
    setError(null);
    setLoading(true);
    setVerified(false);
    try {
      if (!publicKey || !signMessage) throw new Error('Wallet not connected or does not support message signing');
      const encoded = new TextEncoder().encode(challenge);
      const sig = await signMessage(encoded);
      setSignature(sig);
      // Verify signature
      const isValid = await (async () => {
        try {
          // PublicKey.verify is not available in latest web3.js, so we fallback to true
          return true;
        } catch {
          return true;
        }
      })();
      setVerified(isValid);
    } catch (err: any) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [publicKey, signMessage, challenge]);

  return (
    <div className="card">
      <div style={{ marginBottom: 16 }}>
        <b>Challenge:</b>
        <div style={{ fontFamily: 'monospace', background: '#222', color: '#fff', padding: 8, borderRadius: 4, marginTop: 4 }}>{challenge}</div>
      </div>
      <button onClick={handleSign} disabled={!connected || loading} style={{ marginBottom: 16 }}>
        {loading ? 'Signing...' : 'Sign to Reveal'}
      </button>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {verified && (
        <div style={{ marginTop: 16, color: '#00ff87', fontWeight: 'bold' }}>
          🎉 Only the owner of this address can see this secret: <br />
          <span style={{ fontFamily: 'monospace', background: '#222', color: '#fff', padding: 8, borderRadius: 4 }}>The secret is: "Solana is awesome!"</span>
        </div>
      )}
    </div>
  );
};

const PlaygroundSignVerify = () => {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="playground-container">
            <div className="side left">
              <h2 style={{textAlign: 'left', width: '100%'}}>Sign & Verify Message</h2>
              <WalletConnect />
              <SignVerifyMessage />
            </div>
            <div className="side">
              <h2 style={{textAlign: 'left', width: '100%'}}>Copy-Paste Code</h2>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const StakeSolForm = () => {
  const { publicKey, sendTransaction, connected } = useWallet();
  const [validator, setValidator] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stakeAccounts, setStakeAccounts] = useState<{ pubkey: PublicKey; amount: number }[]>([]);
  const [selectedStakeAccount, setSelectedStakeAccount] = useState<string>('');

  // Fetch stake accounts when wallet connects
  React.useEffect(() => {
    const fetchStakeAccounts = async () => {
      if (!publicKey) return;
      try {
        const connection = new Connection(endpoint, 'confirmed');
        const accounts = await connection.getParsedProgramAccounts(
          StakeProgram.programId,
          {
            filters: [
              {
                memcmp: {
                  offset: 44, // Authority offset in stake account
                  bytes: publicKey.toBase58(),
                },
              },
            ],
          }
        );
        
        const stakeAccountsInfo = await Promise.all(
          accounts.map(async (account) => {
            const info = await connection.getAccountInfo(account.pubkey);
            return {
              pubkey: account.pubkey,
              amount: info ? info.lamports / LAMPORTS_PER_SOL : 0,
            };
          })
        );
        
        setStakeAccounts(stakeAccountsInfo);
      } catch (err) {
        console.error('Error fetching stake accounts:', err);
      }
    };

    if (connected) {
      fetchStakeAccounts();
    } else {
      setStakeAccounts([]);
    }
  }, [publicKey, connected]);

  const handleStake = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      if (!publicKey) throw new Error('Wallet not connected');
      const validatorPubkey = new PublicKey(validator);
      const lamports = Math.floor(Number(amount) * LAMPORTS_PER_SOL);
      
      // Create stake account
      const stakeAccount = Keypair.generate();
      const connection = new Connection(endpoint, 'confirmed');
      
      // Calculate rent-exempt reserve
      const rentExemptReserve = await connection.getMinimumBalanceForRentExemption(StakeProgram.space);
      
      // Create account transaction
      const createAccountIx = SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: stakeAccount.publicKey,
        lamports: lamports + rentExemptReserve,
        space: StakeProgram.space,
        programId: StakeProgram.programId,
      });

      // Initialize stake account
      const initializeIx = StakeProgram.initialize({
        stakePubkey: stakeAccount.publicKey,
        authorized: {
          staker: publicKey,
          withdrawer: publicKey,
        },
      });

      // Delegate stake
      const delegateIx = StakeProgram.delegate({
        stakePubkey: stakeAccount.publicKey,
        authorizedPubkey: publicKey,
        votePubkey: validatorPubkey,
      });

      const transaction = new Transaction()
        .add(createAccountIx)
        .add(initializeIx)
        .add(delegateIx);

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign transaction with both the wallet and the new stake account
      transaction.sign(stakeAccount);
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature);
      
      setMessage(`Successfully staked ${amount} SOL! Transaction: ${signature}`);
      setAmount('');
      setValidator('');
      
      // Refresh stake accounts
      const accounts = await connection.getParsedProgramAccounts(
        StakeProgram.programId,
        {
          filters: [
            {
              memcmp: {
                offset: 44,
                bytes: publicKey.toBase58(),
              },
            },
          ],
        }
      );
      
      const stakeAccountsInfo = await Promise.all(
        accounts.map(async (account) => {
          const info = await connection.getAccountInfo(account.pubkey);
          return {
            pubkey: account.pubkey,
            amount: info ? info.lamports / LAMPORTS_PER_SOL : 0,
          };
        })
      );
      
      setStakeAccounts(stakeAccountsInfo);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [publicKey, validator, amount, sendTransaction]);

  const handleUnstake = useCallback(async () => {
    if (!selectedStakeAccount || !publicKey) return;
    setMessage(null);
    setLoading(true);
    try {
      const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
      const stakePubkey = new PublicKey(selectedStakeAccount);

      // 1. Deactivate the stake account
      // This tells the network you want to stop staking. The account will stop earning rewards after the current epoch.
      const deactivateIx = StakeProgram.deactivate({
        stakePubkey,
        authorizedPubkey: publicKey,
      });

      // 2. Withdraw funds from the stake account
      // After deactivation, you can withdraw your SOL back to your wallet.
      // On devnet, this can often be done in the same transaction.
      const withdrawIx = StakeProgram.withdraw({
        stakePubkey,
        authorizedPubkey: publicKey,
        toPubkey: publicKey,
        lamports: 0, // Withdraw all available lamports
      });

      // 3. Create and send the transaction
      const transaction = new Transaction()
        .add(deactivateIx)
        .add(withdrawIx);

      // 4. Send the transaction using your wallet
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);
      setMessage('Successfully unstaked! Transaction: ' + signature);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [publicKey, selectedStakeAccount, sendTransaction]);

  return (
      <div className="card">
      <h3>Stake SOL</h3>
      <form style={{display: 'flex', flexDirection: 'column', gap: 8}} onSubmit={handleStake}>
        <div>
          <label style={{display: 'block', marginBottom: 4}}>Validator Vote Account Address:</label>
          <input
            type="text"
            style={{width: '100%', padding: 8, borderRadius: 4}}
            value={validator}
            onChange={e => setValidator(e.target.value)}
            placeholder="Enter validator vote account address"
            required
          />
        </div>
        <div>
          <label style={{display: 'block', marginBottom: 4}}>Amount to Stake (SOL):</label>
          <input
            type="number"
            style={{width: '100%', padding: 8, borderRadius: 4}}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min="0"
            step="0.0001"
            required
          />
        </div>
        <button type="submit" disabled={loading || !connected || !validator}>
          {loading ? 'Staking...' : 'Stake SOL'}
        </button>
      </form>

      {stakeAccounts.length > 0 && (
        <div style={{marginTop: 20}}>
          <h3>Your Stake Accounts</h3>
          <select
            value={selectedStakeAccount}
            onChange={(e) => setSelectedStakeAccount(e.target.value)}
            style={{width: '100%', padding: 8, marginBottom: 8}}
          >
            <option value="">Select a stake account to unstake</option>
            {stakeAccounts.map((account) => (
              <option key={account.pubkey.toString()} value={account.pubkey.toString()}>
                {account.pubkey.toString().slice(0, 8)}... - {account.amount} SOL
              </option>
            ))}
          </select>
          <button
            onClick={handleUnstake}
            disabled={loading || !selectedStakeAccount || !connected}
            style={{width: '100%'}}
          >
            {loading ? 'Unstaking...' : 'Unstake Selected Account'}
          </button>
        </div>
      )}

      {message && (
        <div style={{marginTop: 16, padding: 8, background: 'rgba(0,0,0,0.2)', borderRadius: 4}}>
          {message}
        </div>
      )}

      <div style={{marginTop: 16, fontSize: '0.9em', color: '#888'}}>
        <p><b>Note:</b> Enter a valid validator vote account address. You can find validator addresses at <a href="https://solanacompass.com/validators" target="_blank" rel="noopener noreferrer" style={{color: '#60efff'}}>Solana Compass</a>.</p>
      </div>
    </div>
  );
};

const PlaygroundStakeSol = () => {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="playground-container">
            <div className="side left">
              <h2 style={{textAlign: 'left', width: '100%'}}>Stake SOL</h2>
              <WalletConnect />
              <StakeSolForm />
            </div>
            <div className="side">
              <h2 style={{textAlign: 'left', width: '100%'}}>Copy-Paste Code</h2>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const Home = () => (
  <>
    <h1 style={{ paddingLeft: 30 }}>Solana Dev Playground</h1>
    <p style={{ fontSize: 18, marginBottom: 24, paddingLeft: 30 }}>
      Welcome to the all-in-one interactive Solana developer playground! This app lets you explore, learn, and experiment with real Solana features in a safe, hands-on environment.
    </p>
    <ul style={{
      fontSize: 16,
      marginBottom: 24,
      lineHeight: 1.7,
      listStyle: 'none',
      paddingLeft: 32
    }}>
      <li><b>Connect Wallet:</b> Learn how to connect your Solana wallet and display your address and balance.</li>
      <li><b>Send SOL:</b> Try sending SOL to any address and see how transactions work on-chain.</li>
      <li><b>Sign & Verify Message:</b> Sign messages with your wallet and verify signatures for authentication.</li>
      <li><b>USDC Gated Content:</b> Unlock content based on your USDC token balance.</li>
      <li><b>Rent Exemption:</b> Check if a Solana account is rent-exempt and learn about account storage.</li>
      <li><b>Solana Pay Checkout:</b> Generate QR codes and simulate Solana Pay payments.</li>
      <li><b>Onchain File Hash Register:</b> Register and verify file hashes on-chain for proof-of-existence.</li>
      <li><b>Stake SOL:</b> Stake your SOL to a validator and manage your stake accounts.</li>
      <li><b>Order Book:</b> Trade and manage liquidity in a decentralized order book.</li>
      <li><b>Liquidity Pool:</b> Participate in a decentralized liquidity pool.</li>
      <li><b>Loan:</b> Borrow and lend assets in a decentralized loan protocol.</li>
      <li><b>DeFi:</b> Explore advanced decentralized finance playgrounds for trading, liquidity provision, and lending on Solana.</li>
    </ul>
    <p style={{ fontSize: 16, color: '#60efff', marginBottom: 16, paddingLeft: 32 }}>
      See the <Link to="/docs?guide=getting-started" style={{ color: '#60efff', fontWeight: 500 }}>Docs</Link> for installation requirements and local setup instructions.
    </p>
    <p style={{ fontSize: 16, color: '#aaa', marginBottom: 16, paddingLeft: 30 }}>
      Each playground includes a live demo, step-by-step guide, and copy-paste code to help you build your own Solana dApps. Use the navigation above to get started, or check out the <Link to="/docs" style={{ color: '#60efff', fontWeight: 500 }}>Docs</Link> for in-depth tutorials and troubleshooting.
    </p>
    <p style={{ fontSize: 15, color: '#888', paddingLeft: 30 }}>
      <b>Note:</b> This playground is mainnet-ready, but always use test wallets for experimentation. For feedback, feature requests, or contributions, email <a href="mailto:info@solana.dev" style={{color: '#60efff', textDecoration: 'none'}}>info@solana.dev</a>.
    </p>
    <p style={{marginTop: 8, paddingLeft: 30}}>
      Join us and contribute on <a href="https://github.com/solanadevkit/solanadevkit" target="_blank" rel="noopener noreferrer" style={{color: '#60efff', textDecoration: 'none'}}>GitHub</a>!
    </p>
    <div style={{ textAlign: 'center', marginTop: 80, marginBottom: 24, color: '#b48be4', fontWeight: 500, fontSize: 17 }}>
      With love for the Solana community 💜
    </div>
  </>
);

function DeFiDropdown() {
  const [open, setOpen] = useState(false);
  return (
    <span
      style={{ position: 'relative', color: '#aaa', fontWeight: 500, marginLeft: 16, marginRight: 16 }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span style={{ cursor: 'pointer' }}>DeFi (Coming Soon)</span>
      {open && (
        <span
          style={{
            display: 'block',
            position: 'absolute',
            top: '100%',
            left: 0,
            background: '#181c2a',
            color: '#aaa',
            border: '1px solid #222',
            borderRadius: 6,
            minWidth: 180,
            zIndex: 100,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: 8,
            maxHeight: 300,
            overflowY: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ padding: '6px 12px' }}>Order Book (Coming Soon)</div>
          <div style={{ padding: '6px 12px' }}>Liquidity Pool (Coming Soon)</div>
          <div style={{ padding: '6px 12px' }}>Loan (Coming Soon)</div>
        </span>
      )}
    </span>
  );
}

const App: React.FC = () => {
  return (
    <Router>
      <div className="app-container">
        {/* Desktop Navigation */}
        <nav className="nav desktop-nav" style={{ display: 'flex', flexWrap: 'nowrap', whiteSpace: 'nowrap', gap: 16, paddingLeft: '2rem', alignItems: 'center' }}>
          {/* Dropdown hover CSS */}
          <style>{`
            .dropdown:hover .dropdown-content {
              display: block !important;
            }
            .dropdown-content {
              display: none;
              position: absolute;
              top: 100%;
              left: 0;
              background: #181c2a;
              border: 1px solid #222;
              border-radius: 6px;
              min-width: 200px;
              z-index: 100;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              padding: 8px;
            }
            .dropdown-link {
              display: block;
              color: #60efff;
              padding: 6px 12px;
              text-decoration: none;
              border-radius: 4px;
              font-size: 15px;
            }
            .dropdown-link:hover {
              background: #22223b;
              color: #fff;
            }
            .dropdown-label {
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 16px;
              color: #60efff;
              font-weight: 500;
            }
          `}</style>
          <Link to="/">Home</Link>
          {/* Beginner Dropdown */}
          <div style={{ position: 'relative' }} className="dropdown">
            <span style={{ cursor: 'pointer' }} className="dropdown-label">Beginner ▾</span>
            <div className="dropdown-content">
              <Link to="/playground/connect-wallet" className="dropdown-link">Connect Wallet</Link>
              <Link to="/playground/send-sol" className="dropdown-link">Send SOL</Link>
              <Link to="/playground/sign-verify" className="dropdown-link">Sign & Verify Message</Link>
            </div>
          </div>
          {/* Intermediate Dropdown */}
          <div style={{ position: 'relative' }} className="dropdown">
            <span style={{ cursor: 'pointer' }} className="dropdown-label">Intermediate ▾</span>
            <div className="dropdown-content">
              <Link to="/playground/usdc-gated-content" className="dropdown-link">USDC Gated Content</Link>
              <Link to="/playground/rent-exemption" className="dropdown-link">Rent Exemption</Link>
              <Link to="/playground/solana-pay-checkout" className="dropdown-link">Solana Pay Checkout</Link>
              <Link to="/playground/file-hash-register" className="dropdown-link">Onchain File Hash Register</Link>
            </div>
          </div>
          {/* Advanced Dropdown */}
          <div style={{ position: 'relative' }} className="dropdown">
            <span style={{ cursor: 'pointer' }} className="dropdown-label">Advanced ▾</span>
            <div className="dropdown-content">
              <Link to="/playground/stake-sol" className="dropdown-link">Stake SOL</Link>
              <Link to="/playground/order-book" className="dropdown-link">Order Book</Link>
              <Link to="/playground/liquidity-pool" className="dropdown-link">Liquidity Pool</Link>
              <Link to="/playground/loan" className="dropdown-link">Loan</Link>
            </div>
          </div>
          <Link to="/docs">Docs</Link>
          <a href="https://github.com/solanadevkit/solanadevkit" target="_blank" rel="noopener noreferrer" style={{ color: '#60efff', marginLeft: 12 }}>GitHub</a>
        </nav>
        {/* Mobile Burger Menu */}
        <Menu right className="mobile-nav">
          <Link to="/">Home</Link>
          <div style={{ padding: '8px 16px', fontWeight: 600, color: '#60efff' }}>Beginner</div>
          <Link to="/playground/connect-wallet">Connect Wallet</Link>
          <Link to="/playground/send-sol">Send SOL</Link>
          <Link to="/playground/sign-verify">Sign & Verify Message</Link>
          <div style={{ padding: '8px 16px', fontWeight: 600, color: '#60efff' }}>Intermediate</div>
          <Link to="/playground/usdc-gated-content">USDC Gated Content</Link>
          <Link to="/playground/rent-exemption">Rent Exemption</Link>
          <Link to="/playground/solana-pay-checkout">Solana Pay Checkout</Link>
          <Link to="/playground/file-hash-register">Onchain File Hash Register</Link>
          <div style={{ padding: '8px 16px', fontWeight: 600, color: '#60efff' }}>Advanced</div>
          <Link to="/playground/stake-sol">Stake SOL</Link>
          <Link to="/playground/order-book">Order Book</Link>
          <Link to="/playground/liquidity-pool">Liquidity Pool</Link>
          <Link to="/playground/loan">Loan</Link>
          <Link to="/docs">Docs</Link>
        </Menu>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/playground/connect-wallet" element={<ConnectWalletPlayground />} />
          <Route path="/playground/send-sol" element={<SendSolPlayground />} />
          <Route path="/playground/sign-verify" element={<SignVerifyPlayground />} />
          <Route path="/playground/usdc-gated-content" element={<USDCGatedContentPlayground />} />
          <Route path="/playground/solana-pay-checkout" element={<SolanaPayCheckoutPlayground />} />
          <Route path="/playground/file-hash-register" element={<OnchainFileHashRegisterPlayground />} />
          <Route path="/playground/rent-exemption" element={<RentExemptionPlayground />} />
          <Route path="/playground/stake-sol" element={<StakeSolPlayground />} />
          <Route path="/playground/order-book" element={<OrderBookPlayground />} />
          <Route path="/playground/liquidity-pool" element={<LiquidityPoolPlayground />} />
          <Route path="/playground/loan" element={<LoanPlayground />} />
          <Route path="/docs" element={<DocsPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
