import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const solanaPayCode = `import { PublicKey } from '@solana/web3.js';
import QRCode from 'qrcode.react';

const recipient = 'RecipientPublicKeyHere';
const amount = 1.23; // Amount in SOL
const reference = 'UniqueReferenceHere';
const label = 'My Store';
const message = 'Thanks for your purchase!';

const url = new URL('solana:https://solana.com/pay');
url.searchParams.append('recipient', recipient);
url.searchParams.append('amount', amount.toString());
url.searchParams.append('reference', reference);
url.searchParams.append('label', label);
url.searchParams.append('message', message);

// Show QR code
<QRCode value={url.toString()} />;
`;

const SolanaPayCheckoutGuide = () => (
  <div>
    <h1>Solana Pay Checkout Playground Guide</h1>
    <p>
      This guide shows you how to create a Solana Pay payment request, generate a QR code, and detect payment confirmation on-chain. Solana Pay is a standard for point-of-sale and e-commerce payments on Solana.
    </p>
    <h2>1. Prerequisites</h2>
    <ul>
      <li>Connect your wallet using the <b>Connect Wallet Playground</b>.</li>
      <li>Have some SOL in your wallet for testing.</li>
    </ul>
    <h2>2. Install Dependencies</h2>
    <pre>
      <code>npm install qrcode.react @solana/web3.js</code>
    </pre>
    <h2>3. Create a Solana Pay URL</h2>
    <p>
      Build a Solana Pay URL with recipient, amount, reference, label, and message.
    </p>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
{`const url = new URL('solana:https://solana.com/pay');
url.searchParams.append('recipient', recipient);
url.searchParams.append('amount', amount.toString());
url.searchParams.append('reference', reference);
url.searchParams.append('label', label);
url.searchParams.append('message', message);`}
    </SyntaxHighlighter>
    <h2>4. Generate a QR Code</h2>
    <p>
      Use <code>qrcode.react</code> to display the payment request as a QR code.
    </p>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
{`<QRCode value={url.toString()} />`}
    </SyntaxHighlighter>
    <h2>5. Detect Payment Confirmation</h2>
    <p>
      Poll the blockchain for a transaction with the unique reference to confirm payment.
    </p>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
{`// Use connection.getSignaturesForAddress(reference) and check for a matching payment`}
    </SyntaxHighlighter>
    <h2>6. Full Example</h2>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
      {solanaPayCode}
    </SyntaxHighlighter>
    <h2>7. Next Steps</h2>
    <ul>
      <li>Try the <b>Solana Pay Checkout Playground</b>!</li>
      <li>Use Solana Pay for e-commerce, donations, or point-of-sale apps.</li>
      <li>Explore advanced features like SPL token payments and custom metadata.</li>
    </ul>
  </div>
);

export default SolanaPayCheckoutGuide; 