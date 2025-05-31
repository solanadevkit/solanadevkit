import React from 'react';

const SecurityBestPracticesGuide = () => (
  <div>
    <h1>Security Best Practices</h1>
    <p>Follow these security tips when using any Solana playground or developing your own dApps.</p>
    <ul>
      <li>Never expose or share your private keys or seed phrases.</li>
      <li>Only use test wallets for experimentation and development.</li>
      <li>Always verify transaction details (recipient, amount, token mint, etc.) before signing with your wallet.</li>
      <li>Never sign messages or transactions you do not understand or trust.</li>
      <li>Be cautious of phishing sites and browser extensions.</li>
      <li>Keep your wallet software and browser extensions up to date.</li>
      <li>For production, use hardware wallets and secure key management.</li>
      <li>Monitor your wallet activity regularly for unauthorized transactions.</li>
    </ul>
    <h2>For Developers</h2>
    <ul>
      <li>Never log or transmit private keys, mnemonics, or sensitive wallet data.</li>
      <li>Use environment variables for API keys and sensitive config.</li>
      <li>Validate all user input and handle errors gracefully.</li>
      <li>Review and audit dependencies for security risks.</li>
    </ul>
  </div>
);

export default SecurityBestPracticesGuide; 