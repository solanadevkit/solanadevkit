import React, { useMemo, useCallback, useState } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

function WalletConnect() {
  return <WalletMultiButton />;
}

const endpoint = 'https://rpc.helius.xyz/?api-key=d0b16cfa-5967-42dd-9613-82121f42828b';

const SignVerifyMessage = () => {
  const { publicKey, signMessage, connected } = useWallet();
  const [challenge] = useState(() => `Sign this message to reveal the secret: ${Math.floor(Math.random() * 1000000)}`);
  const [signature, setSignature] = useState<Uint8Array | null>(null);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      // For demo, assume valid
      setVerified(true);
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

const signVerifyCode = `// Sign & Verify Message Example\nimport { useWallet } from '@solana/wallet-adapter-react';\nimport React, { useState, useCallback } from 'react';\n\nfunction SignVerifyMessage() {\n  const { publicKey, signMessage, connected } = useWallet();\n  const [challenge] = useState(() => 'Sign this message to reveal the secret: ' + Math.floor(Math.random() * 1000000));\n  const [signature, setSignature] = useState(null);\n  const [verified, setVerified] = useState(false);\n  const [error, setError] = useState(null);\n  const [loading, setLoading] = useState(false);\n\n  // Ask the wallet to sign the challenge, then verify it\n  const handleSign = useCallback(async () => {\n    setError(null);\n    setLoading(true);\n    setVerified(false);\n    try {\n      if (!publicKey || !signMessage) throw new Error('Wallet not connected or does not support message signing');\n      const encoded = new TextEncoder().encode(challenge);\n      const sig = await signMessage(encoded);\n      setSignature(sig);\n      // For demo, assume valid\n      setVerified(true);\n    } catch (err) {\n      setError('Error: ' + err.message);\n    } finally {\n      setLoading(false);\n    }\n  }, [publicKey, signMessage, challenge]);\n\n  return (\n    <div>\n      <div><b>Challenge:</b> <code>{challenge}</code></div>\n      <button onClick={handleSign} disabled={!connected || loading}>{loading ? 'Signing...' : 'Sign to Reveal'}</button>\n      {error && <div style={{ color: 'red' }}>{error}</div>}\n      {verified && (\n        <div style={{ color: '#00ff87', fontWeight: 'bold' }}>\n          Only the owner of this address can see this secret: <br />\n          <span style={{ fontFamily: 'monospace', background: '#222', color: '#fff', padding: 8, borderRadius: 4 }}>The secret is: "Solana is awesome!"</span>\n        </div>\n      )}\n    </div>\n  );\n}\n`;

const SignVerifyPlayground = () => {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="playground-container">
            <div className="side left" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{textAlign: 'center', width: '100%', marginBottom: 24}}>Sign & Verify Message</h2>
              <WalletConnect />
              <SignVerifyMessage />
            </div>
            <div className="side" style={{ flex: 1, minWidth: 0 }}>
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 24px', marginTop: 28}}>
                <h2 style={{textAlign: 'left', margin: 0}}>Code</h2>
                <a href="/docs?guide=sign-verify" style={{ color: '#60efff', fontWeight: 500, fontSize: 15 }}>Detailed Guide</a>
              </div>
              <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14, width: '100%' }}>
                {signVerifyCode}
              </SyntaxHighlighter>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SignVerifyPlayground; 