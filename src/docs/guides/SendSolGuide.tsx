import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const sendSolCode = `import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

const endpoint = 'https://rpc.helius.xyz/?api-key=YOUR_API_KEY';
const connection = new Connection(endpoint, 'confirmed');

const { publicKey, sendTransaction, connected } = useWallet();

const recipient = 'RecipientPublicKeyHere';
const amount = 0.01; // Amount in SOL

const lamports = Math.floor(amount * 1e9);
const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: publicKey,
    toPubkey: new PublicKey(recipient),
    lamports,
  })
);

const signature = await sendTransaction(transaction, connection);
console.log('Transaction signature:', signature);
`;

const SendSolGuide = () => (
  <div>
    <h1>Send SOL Playground Guide</h1>
    <p>
      This guide will show you how to send SOL from your connected wallet to any recipient on Solana mainnet using the Solana web3.js and wallet adapter libraries.
    </p>

    <h2>1. Prerequisites</h2>
    <ul>
      <li>Connect your wallet using the <b>Connect Wallet Playground</b> or the WalletMultiButton.</li>
      <li>Make sure your wallet has enough SOL for the transfer and transaction fees.</li>
    </ul>

    <h2>2. Install Dependencies</h2>
    <pre>
      <code>npm install @solana/web3.js @solana/wallet-adapter-react</code>
    </pre>

    <h2>3. Prepare the Transaction</h2>
    <p>
      Use the <code>SystemProgram.transfer</code> instruction to create a transaction that sends SOL from your wallet to a recipient.
    </p>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
{`const recipient = 'RecipientPublicKeyHere';
const amount = 0.01; // Amount in SOL

const lamports = Math.floor(amount * 1e9);
const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: publicKey,
    toPubkey: new PublicKey(recipient),
    lamports,
  })
);`}
    </SyntaxHighlighter>

    <h2>4. Send the Transaction</h2>
    <p>
      Use the <code>sendTransaction</code> function from the wallet adapter to sign and send the transaction.
    </p>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
{`const signature = await sendTransaction(transaction, connection);
console.log('Transaction signature:', signature);`}
    </SyntaxHighlighter>

    <h2>5. Confirm the Transaction</h2>
    <p>
      Optionally, you can confirm the transaction and check its status on Solscan.
    </p>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
{'await connection.confirmTransaction(signature);\nconsole.log("View on Solscan:", `https://solscan.io/tx/${signature}`);'}
    </SyntaxHighlighter>

    <h2>6. Full Example</h2>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
      {sendSolCode}
    </SyntaxHighlighter>

    <h2>7. Next Steps</h2>
    <ul>
      <li>Try sending SOL in the <b>Send SOL Playground</b>!</li>
      <li>Handle errors and show transaction status to users for a better UX.</li>
      <li>Explore sending SPL tokens or interacting with other Solana programs.</li>
    </ul>
  </div>
);

export default SendSolGuide; 