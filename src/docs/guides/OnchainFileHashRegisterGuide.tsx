import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const fileHashCode = `import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

// 1. Compute SHA-256 hash of file
const arrayBuffer = await file.arrayBuffer();
const hashBuffer = await window.crypto.subtle.digest('SHA-256', arrayBuffer);
const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

// 2. Register hash on-chain using Memo program
const memoIx = new TransactionInstruction({
  keys: [],
  programId: MEMO_PROGRAM_ID,
  data: Buffer.from(hash, 'utf8'),
});
const tx = new Transaction().add(memoIx);
const sig = await sendTransaction(tx, connection);

// 3. Verify hash by searching recent memos
const sigs = await connection.getSignaturesForAddress(MEMO_PROGRAM_ID, { limit: 1000 });
for (const sigInfo of sigs) {
  const tx = await connection.getTransaction(sigInfo.signature);
  // ...decode and check memo data...
}`;

const OnchainFileHashRegisterGuide = () => (
  <div>
    <h1>Onchain File Hash Register Playground Guide</h1>
    <p>
      This guide shows you how to register a file's hash on-chain using the Memo program, and verify it later for decentralized proof-of-existence and timestamping.
    </p>
    <h2>1. Prerequisites</h2>
    <ul>
      <li>Connect your wallet using the <b>Connect Wallet Playground</b>.</li>
      <li>Have a file ready to hash and register.</li>
    </ul>
    <h2>2. Install Dependencies</h2>
    <pre>
      <code>npm install @solana/web3.js</code>
    </pre>
    <h2>3. Compute the File Hash</h2>
    <p>
      Use the browser's <code>crypto.subtle.digest</code> to compute the SHA-256 hash of a file.
    </p>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
{`const arrayBuffer = await file.arrayBuffer();
const hashBuffer = await window.crypto.subtle.digest('SHA-256', arrayBuffer);
const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');`}
    </SyntaxHighlighter>
    <h2>4. Register the Hash On-Chain</h2>
    <p>
      Use the Memo program to store the hash on-chain as a memo.
    </p>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
{`const memoIx = new TransactionInstruction({
  keys: [],
  programId: MEMO_PROGRAM_ID,
  data: Buffer.from(hash, 'utf8'),
});
const tx = new Transaction().add(memoIx);
const sig = await sendTransaction(tx, connection);`}
    </SyntaxHighlighter>
    <h2>5. Verify the Hash</h2>
    <p>
      Search recent memos for your hash, or verify directly by transaction signature.
    </p>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
{`const sigs = await connection.getSignaturesForAddress(MEMO_PROGRAM_ID, { limit: 1000 });
for (const sigInfo of sigs) {
  const tx = await connection.getTransaction(sigInfo.signature);
  // ...decode and check memo data...
}`}
    </SyntaxHighlighter>
    <h2>6. Full Example</h2>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
      {fileHashCode}
    </SyntaxHighlighter>
    <h2>7. Next Steps</h2>
    <ul>
      <li>Try the <b>Onchain File Hash Register Playground</b>!</li>
      <li>Use this pattern for decentralized timestamping, proof-of-existence, or document notarization.</li>
      <li>Consider off-chain indexing for production use.</li>
    </ul>
  </div>
);

export default OnchainFileHashRegisterGuide; 