import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const rentExemptionCode = `import { Connection, PublicKey } from '@solana/web3.js';

const endpoint = 'https://rpc.helius.xyz/?api-key=YOUR_API_KEY';
const connection = new Connection(endpoint, 'confirmed');

const accountPubkey = new PublicKey('AccountAddressHere');
const accountInfo = await connection.getAccountInfo(accountPubkey);

if (accountInfo) {
  const isRentExempt = accountInfo.lamports > accountInfo.rentEpoch;
  console.log('Is rent exempt?', isRentExempt);
}
`;

const RentExemptionGuide = () => (
  <div>
    <h1>Rent Exemption Playground Guide</h1>
    <p>
      This guide explains Solana's rent model and how to check if an account is rent-exempt. Rent exemption is important for keeping accounts alive on Solana.
    </p>
    <h2>1. Prerequisites</h2>
    <ul>
      <li>Know the account address you want to check.</li>
      <li>Connect your wallet using the <b>Connect Wallet Playground</b> (optional).</li>
    </ul>
    <h2>2. Install Dependencies</h2>
    <pre>
      <code>npm install @solana/web3.js</code>
    </pre>
    <h2>3. Fetch Account Info</h2>
    <p>
      Use <code>getAccountInfo</code> to fetch the account's lamports and rent status.
    </p>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
{`const accountPubkey = new PublicKey('AccountAddressHere');
const accountInfo = await connection.getAccountInfo(accountPubkey);`}
    </SyntaxHighlighter>
    <h2>4. Check Rent Exemption</h2>
    <p>
      Compare the account's lamports to the rent-exempt minimum.
    </p>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
{`if (accountInfo) {
  const isRentExempt = accountInfo.lamports > accountInfo.rentEpoch;
  console.log('Is rent exempt?', isRentExempt);
}`}
    </SyntaxHighlighter>
    <h2>5. Full Example</h2>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
      {rentExemptionCode}
    </SyntaxHighlighter>
    <h2>6. Next Steps</h2>
    <ul>
      <li>Try the <b>Rent Exemption Playground</b>!</li>
      <li>Learn more about Solana's rent model and account lifecycle.</li>
      <li>Explore creating and funding rent-exempt accounts.</li>
    </ul>
  </div>
);

export default RentExemptionGuide; 