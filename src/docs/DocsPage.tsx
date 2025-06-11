import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SendSolGuide from './guides/SendSolGuide';
import SignVerifyGuide from './guides/SignVerifyGuide';
import StakeSolGuide from './guides/StakeSolGuide';
import RentExemptionGuide from './guides/RentExemptionGuide';
import SolanaPayCheckoutGuide from './guides/SolanaPayCheckoutGuide';
import USDCGatedContentGuide from './guides/USDCGatedContentGuide';
import OnchainFileHashRegisterGuide from './guides/OnchainFileHashRegisterGuide';
import ConnectWalletGuide from './guides/ConnectWalletGuide';
import TroubleshootingGuide from './guides/TroubleshootingGuide';
import SecurityBestPracticesGuide from './guides/SecurityBestPracticesGuide';
import GettingStartedGuide from './guides/GettingStartedGuide';
import OrderBookGuide from './guides/OrderBookGuide';
import LiquidityPoolGuide from './guides/LiquidityPoolGuide';
import LoanGuide from './guides/LoanGuide';

const guides = [
  { key: 'connect-wallet', label: 'Connect Wallet', component: <ConnectWalletGuide />, link: '/playground/connect-wallet' },
  { key: 'send-sol', label: 'Send SOL', component: <SendSolGuide />, link: '/playground/send-sol' },
  { key: 'sign-verify', label: 'Sign & Verify Message', component: <SignVerifyGuide />, link: '/playground/sign-verify' },
  { key: 'usdc-gated', label: 'USDC Gated Content', component: <USDCGatedContentGuide />, link: '/playground/usdc-gated-content' },
  { key: 'solana-pay-checkout', label: 'Solana Pay Checkout', component: <SolanaPayCheckoutGuide />, link: '/playground/solana-pay-checkout' },
  { key: 'file-hash-register', label: 'Onchain File Hash Register', component: <OnchainFileHashRegisterGuide />, link: '/playground/file-hash-register' },
  { key: 'rent-exemption', label: 'Rent Exemption', component: <RentExemptionGuide />, link: '/playground/rent-exemption' },
  { key: 'stake-sol', label: 'Stake SOL', component: <StakeSolGuide />, link: '/playground/stake-sol' },
  { key: 'order-book', label: 'Order Book', component: <OrderBookGuide />, link: '/playground/order-book' },
  { key: 'liquidity-pool', label: 'Liquidity Pool', component: <LiquidityPoolGuide />, link: '/playground/liquidity-pool' },
  { key: 'loan', label: 'Loan', component: <LoanGuide />, link: '/playground/loan' },
  { key: 'troubleshooting', label: 'Troubleshooting', component: <TroubleshootingGuide />, link: '/docs/troubleshooting' },
  { key: 'security-best-practices', label: 'Security Best Practices', component: <SecurityBestPracticesGuide />, link: '/docs/security-best-practices' },
  { key: 'getting-started', label: 'Getting Started', component: <GettingStartedGuide />, link: '/docs?guide=getting-started' },
];

export default function DocsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const selected = params.get('guide') || 'send-sol';
  const guide = guides.find(g => g.key === selected) || guides[1];

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      <aside style={{ minWidth: 220, background: '#181a2a', color: '#fff', padding: 24 }}>
        <h2 style={{ fontSize: 20, marginBottom: 16 }}>Docs & Tutorials</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {guides.map(g => (
            <li key={g.key} style={{ marginBottom: 8 }}>
              <button
                style={{
                  background: selected === g.key ? '#222' : 'transparent',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 0',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: selected === g.key ? 'bold' : 'normal',
                  fontSize: 16,
                }}
                onClick={() => navigate(`/docs?guide=${g.key}`)}
              >
                {g.label}
              </button>
              <Link to={g.link} style={{ color: '#60efff', fontSize: 13, marginLeft: 8 }}>
                Try it out →
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <main style={{ flex: 1, padding: 32, background: '#22223b', color: '#fff', paddingBottom: 56 }}>
        <h1 className="text-3xl font-bold mb-8">{guide?.label}</h1>
        {guide?.component}
        <div style={{ width: '100%', height: 16, background: '#22223b' }} />
      </main>
    </div>
  );
} 