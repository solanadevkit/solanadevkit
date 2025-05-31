import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const signVerifyCode = `import { useWallet } from '@solana/wallet-adapter-react';

const { publicKey, signMessage, connected } = useWallet();
const message = 'Hello, Solana!';

// Sign the message
const encodedMessage = new TextEncoder().encode(message);
const signature = await signMessage(encodedMessage);
console.log('Signature:', signature);

// (Optional) Verify the signature (in a backend or using @solana/web3.js)
// PublicKey.verify is not available in latest web3.js, but you can use tweetnacl or similar libs.
`;

const SignVerifyGuide = () => (
  <div>
    <h1>Sign & Verify Message Playground Guide</h1>
    <p>
      This guide shows you how to sign and verify messages using a Solana wallet. Message signing is essential for authentication, proving wallet ownership, and off-chain authorization.
    </p>

    <h2>1. Prerequisites</h2>
    <ul>
      <li>Connect your wallet using the <b>Connect Wallet Playground</b> or WalletMultiButton.</li>
      <li>Ensure your wallet supports message signing (e.g., Phantom).</li>
    </ul>

    <h2>2. Install Dependencies</h2>
    <pre>
      <code>npm install @solana/wallet-adapter-react</code>
    </pre>

    <h2>3. Sign a Message</h2>
    <p>
      Use the <code>signMessage</code> function from the wallet adapter to sign an arbitrary message.
    </p>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
{`const { publicKey, signMessage, connected } = useWallet();
const message = 'Hello, Solana!';

const encodedMessage = new TextEncoder().encode(message);
const signature = await signMessage(encodedMessage);
console.log('Signature:', signature);`}
    </SyntaxHighlighter>

    <h2>4. Verify the Signature</h2>
    <p>
      To verify a signature, you can use <code>tweetnacl</code> or similar libraries. (Note: <code>PublicKey.verify</code> is not available in the latest web3.js.)
    </p>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
{`import nacl from 'tweetnacl';

const isValid = nacl.sign.detached.verify(
  encodedMessage,
  signature,
  publicKey.toBytes()
);
console.log('Is signature valid?', isValid);`}
    </SyntaxHighlighter>

    <h2>5. Full Example</h2>
    <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14 }}>
      {signVerifyCode}
    </SyntaxHighlighter>

    <h2>6. Next Steps</h2>
    <ul>
      <li>Try signing and verifying messages in the <b>Sign & Verify Message Playground</b>!</li>
      <li>Use message signing for login/auth flows or to prove wallet ownership.</li>
      <li>Explore off-chain authorization and secure dApp interactions.</li>
    </ul>
  </div>
);

export default SignVerifyGuide; 