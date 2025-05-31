import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const stakeSolCode = `import { Connection, PublicKey, StakeProgram, SystemProgram, Transaction, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

const endpoint = 'https://rpc.helius.xyz/?api-key=YOUR_API_KEY';
const connection = new Connection(endpoint, 'confirmed');
const { publicKey, sendTransaction } = useWallet();

const validatorPubkey = new PublicKey('ValidatorVoteAddressHere');
const lamports = 1 * LAMPORTS_PER_SOL;
const stakeAccount = Keypair.generate();

const createAccountIx = SystemProgram.createAccount({
  fromPubkey: publicKey,
  newAccountPubkey: stakeAccount.publicKey,
  lamports,
  space: StakeProgram.space,
  programId: StakeProgram.programId,
});
const initializeIx = StakeProgram.initialize({
  stakePubkey: stakeAccount.publicKey,
  authorized: { staker: publicKey, withdrawer: publicKey },
});
const delegateIx = StakeProgram.delegate({
  stakePubkey: stakeAccount.publicKey,
  authorizedPubkey: publicKey,
  votePubkey: validatorPubkey,
});

const tx = new Transaction().add(createAccountIx, initializeIx, delegateIx);
tx.feePayer = publicKey;
tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
tx.sign(stakeAccount);
const signature = await sendTransaction(tx, connection);
`;

const StakeSolGuide = () => (
  <div>
    <h1>Stake SOL Playground Guide</h1>
    <p>
      This guide shows you how to stake SOL to a validator, view your stake accounts, and unstake using Solana web3.js and wallet adapter.
    </p>
    <h2>1. Prerequisites</h2>
    <ul>
      <li>Connect your wallet using the <b>Connect Wallet Playground</b>.</li>
      <li>Have enough SOL to stake and pay transaction fees.</li>
      <li>Know the validator's vote account address.</li>
    </ul>
    <h2>2. Install Dependencies</h2>
    <pre>
      <code>npm install @solana/web3.js @solana/wallet-adapter-react</code>
    </pre>
    <h2>3. Create and Fund a Stake Account</h2>
    <p>
      Use <code>SystemProgram.createAccount</code> and <code>StakeProgram.initialize</code> to create and initialize a stake account.
    </p>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
{`const stakeAccount = Keypair.generate();
const createAccountIx = SystemProgram.createAccount({
  fromPubkey: publicKey,
  newAccountPubkey: stakeAccount.publicKey,
  lamports,
  space: StakeProgram.space,
  programId: StakeProgram.programId,
});
const initializeIx = StakeProgram.initialize({
  stakePubkey: stakeAccount.publicKey,
  authorized: { staker: publicKey, withdrawer: publicKey },
});`}
    </SyntaxHighlighter>
    <h2>4. Delegate Stake</h2>
    <p>
      Delegate your stake to a validator using <code>StakeProgram.delegate</code>.
    </p>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
{`const delegateIx = StakeProgram.delegate({
  stakePubkey: stakeAccount.publicKey,
  authorizedPubkey: publicKey,
  votePubkey: validatorPubkey,
});`}
    </SyntaxHighlighter>
    <h2>5. Send the Transaction</h2>
    <p>
      Sign and send the transaction with your wallet and the new stake account.
    </p>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
{`const tx = new Transaction().add(createAccountIx, initializeIx, delegateIx);
tx.feePayer = publicKey;
tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
tx.sign(stakeAccount);
const signature = await sendTransaction(tx, connection);`}
    </SyntaxHighlighter>
    <h2>6. Full Example</h2>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
      {stakeSolCode}
    </SyntaxHighlighter>
    <h2>7. Next Steps</h2>
    <ul>
      <li>Try the <b>Stake SOL Playground</b>!</li>
      <li>Explore viewing and unstaking from your stake accounts.</li>
      <li>Learn more about Solana staking and rewards.</li>
    </ul>
  </div>
);

export default StakeSolGuide; 