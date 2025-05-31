import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { Connection, PublicKey, SystemProgram, Transaction, StakeProgram, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

function WalletConnect() {
  return <WalletMultiButton />;
}

const endpoint = 'https://rpc.helius.xyz/?api-key=d0b16cfa-5967-42dd-9613-82121f42828b';

const StakeSolForm = () => {
  const { publicKey, sendTransaction, connected } = useWallet();
  const [validator, setValidator] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stakeAccounts, setStakeAccounts] = useState<{ pubkey: PublicKey; amount: number }[]>([]);
  const [selectedStakeAccount, setSelectedStakeAccount] = useState<string>('');

  useEffect(() => {
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
      const stakeAccount = Keypair.generate();
      const connection = new Connection(endpoint, 'confirmed');
      const rentExemptReserve = await connection.getMinimumBalanceForRentExemption(StakeProgram.space);
      const createAccountIx = SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: stakeAccount.publicKey,
        lamports: lamports + rentExemptReserve,
        space: StakeProgram.space,
        programId: StakeProgram.programId,
      });
      const initializeIx = StakeProgram.initialize({
        stakePubkey: stakeAccount.publicKey,
        authorized: {
          staker: publicKey,
          withdrawer: publicKey,
        },
      });
      const delegateIx = StakeProgram.delegate({
        stakePubkey: stakeAccount.publicKey,
        authorizedPubkey: publicKey,
        votePubkey: validatorPubkey,
      });
      const transaction = new Transaction()
        .add(createAccountIx)
        .add(initializeIx)
        .add(delegateIx);
      transaction.sign(stakeAccount);
      const signature = await sendTransaction(transaction, connection);
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
      const connection = new Connection(endpoint, 'confirmed');
      const stakePubkey = new PublicKey(selectedStakeAccount);
      const deactivateIx = StakeProgram.deactivate({
        stakePubkey,
        authorizedPubkey: publicKey,
      });
      const withdrawIx = StakeProgram.withdraw({
        stakePubkey,
        authorizedPubkey: publicKey,
        toPubkey: publicKey,
        lamports: 0,
      });
      const transaction = new Transaction()
        .add(deactivateIx)
        .add(withdrawIx);
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);
      setMessage('Successfully unstaked! Transaction: ' + signature);
      setSelectedStakeAccount('');
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

const stakeSolCode = `// Stake SOL Example with Manual Validator Address\nimport { useWallet } from '@solana/wallet-adapter-react';\nimport { \n  Connection, \n  PublicKey, \n  SystemProgram, \n  Transaction, \n  StakeProgram,\n  LAMPORTS_PER_SOL,\n  Keypair\n} from '@solana/web3.js';\nimport React, { useState, useCallback, useEffect } from 'react';\n\nfunction StakeSolForm() {\n  const { publicKey, sendTransaction, connected } = useWallet();\n  const [validator, setValidator] = useState('');\n  const [amount, setAmount] = useState('');\n  const [message, setMessage] = useState(null);\n  const [loading, setLoading] = useState(false);\n  // ... stake/unstake logic ...\n  return (\n    <form onSubmit={handleStake}>\n      <input\n        value={validator}\n        onChange={e => setValidator(e.target.value)}\n        placeholder=\"Validator Vote Account Address\"\n        required\n      />\n      <input\n        value={amount}\n        onChange={e => setAmount(e.target.value)}\n        placeholder=\"Amount (SOL)\"\n        type=\"number\"\n        min=\"0\"\n        step=\"0.0001\"\n        required\n      />\n      <button type=\"submit\" disabled={loading || !connected || !validator}>\n        {loading ? 'Staking...' : 'Stake SOL'}\n      </button>\n      {message && <div>{message}</div>}\n    </form>\n  );\n}\n`;

const StakeSolPlayground = () => {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="playground-container">
            <div className="side left" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{textAlign: 'center', width: '100%', marginBottom: 24}}>Stake SOL Playground</h2>
              <WalletConnect />
              <StakeSolForm />
            </div>
            <div className="side" style={{ flex: 1, minWidth: 0 }}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 24px', marginTop: 28}}>
                <h2 style={{textAlign: 'left', margin: 0}}>Code</h2>
                <a href="/docs?guide=stake-sol" style={{ color: '#60efff', fontWeight: 500, fontSize: 15 }}>Detailed Guide</a>
              </div>
              <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14, width: '100%' }}>
                {stakeSolCode}
              </SyntaxHighlighter>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default StakeSolPlayground; 