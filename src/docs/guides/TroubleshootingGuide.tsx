import React from 'react';

const TroubleshootingGuide = () => (
  <div>
    <h1>Common Pitfalls & Troubleshooting</h1>
    <p>This guide covers common issues and solutions for all Solana playgrounds in this app.</p>
    <h2>Wallet Connection Issues</h2>
    <ul>
      <li><b>Phantom not found:</b> Make sure the Phantom extension is installed and enabled in your browser.</li>
      <li><b>Wallet not connecting:</b> Refresh the page, ensure your wallet is unlocked, and try again.</li>
      <li><b>Wallet not showing up:</b> Some wallets only appear on supported browsers (e.g., Phantom on Chrome/Firefox).</li>
    </ul>
    <h2>Transaction Issues</h2>
    <ul>
      <li><b>Transaction failed:</b> Ensure your wallet has enough SOL or tokens for the transfer and fees.</li>
      <li><b>Recipient address invalid:</b> Double-check the recipient's public key or token mint address.</li>
      <li><b>Network congestion:</b> If transactions are slow, try again later or use a different RPC endpoint.</li>
    </ul>
    <h2>Token & Account Issues</h2>
    <ul>
      <li><b>No USDC found:</b> Make sure your wallet has received USDC on the correct network.</li>
      <li><b>Token account not found:</b> The associated token account may not exist until you receive the token for the first time.</li>
      <li><b>Account not found:</b> Double-check the public key and network.</li>
      <li><b>Not rent-exempt:</b> The account may not have enough SOL. Fund it to reach the rent-exempt minimum.</li>
    </ul>
    <h2>Other Issues</h2>
    <ul>
      <li><b>File hash not found:</b> Only the last 1000 memos are searched. Save your transaction signature for robust verification.</li>
      <li><b>QR code not scanning:</b> Make sure the QR code is fully visible and your wallet app supports Solana Pay.</li>
      <li><b>Payment not detected:</b> Ensure the recipient address and reference are correct, and the payer has enough SOL.</li>
    </ul>
    <h2>Network & Environment</h2>
    <ul>
      <li><b>Network errors:</b> Check your internet connection and RPC endpoint. If using mainnet, ensure your API key is valid.</li>
    </ul>
  </div>
);

export default TroubleshootingGuide; 