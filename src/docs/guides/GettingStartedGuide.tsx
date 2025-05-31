import React from 'react';

const GettingStartedGuide = () => (
  <div>
    <h1>Getting Started</h1>
    <h2>Requirements</h2>
    <ul>
      <li><b>Node.js</b> (v18 or newer recommended)</li>
      <li><b>npm</b> or <b>pnpm</b></li>
      <li>A modern web browser (Chrome, Firefox, Edge, Safari, etc.)</li>
      <li><b>Git</b> (optional, for cloning/contributing)</li>
    </ul>
    <h2>Troubleshooting</h2>
    <ul>
      <li><b>Node.js not found:</b> <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">Download Node.js here</a>.</li>
      <li><b>npm not found:</b> npm comes with Node.js. Try reinstalling Node.js.</li>
      <li><b>pnpm not found:</b> Install with <code>npm install -g pnpm</code> or use npm instead.</li>
      <li><b>Port already in use:</b> Stop other apps using the same port or change the port in <code>vite.config.ts</code>.</li>
      <li><b>Permission errors:</b> Try running your terminal as administrator or use <code>sudo</code> (Mac/Linux).</li>
      <li><b>Still stuck?</b> See the <a href="/docs/troubleshooting">Troubleshooting</a> section or open an issue on GitHub.</li>
    </ul>
  </div>
);

export default GettingStartedGuide; 