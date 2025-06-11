import React, { useState, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const endpoint = 'https://rpc.helius.xyz/?api-key=YOUR_API_KEY';

const initialBids = [
  { price: 23.45, size: 10 },
  { price: 23.40, size: 8 },
  { price: 23.35, size: 5 },
];
const initialAsks = [
  { price: 23.55, size: 7 },
  { price: 23.60, size: 12 },
  { price: 23.65, size: 9 },
];

const codeExample = `import React, { useState, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

const endpoint = 'https://rpc.helius.xyz/?api-key=YOUR_API_KEY';

const initialBids = [
  { price: 23.45, size: 10 },
  { price: 23.40, size: 8 },
  { price: 23.35, size: 5 },
];
const initialAsks = [
  { price: 23.55, size: 7 },
  { price: 23.60, size: 12 },
  { price: 23.65, size: 9 },
];

const OrderBookPlayground = () => {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  const [bids, setBids] = useState(initialBids);
  const [asks, setAsks] = useState(initialAsks);
  const [side, setSide] = useState('buy');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('');
  const [orderHistory, setOrderHistory] = useState([]);

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    const order = { side, price: parseFloat(price), size: parseFloat(size), time: new Date().toLocaleTimeString() };
    setOrderHistory([order, ...orderHistory]);
    if (side === 'buy') {
      setBids([{ price: order.price, size: order.size }, ...bids]);
    } else {
      setAsks([{ price: order.price, size: order.size }, ...asks]);
    }
    setPrice('');
    setSize('');
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="playground-container">
            <div className="side left" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{ textAlign: 'center', width: '100%', marginBottom: 24 }}>Order Book Playground (Simulated)</h2>
              <WalletMultiButton />
              <div className="card" style={{ marginTop: 24, width: '100%', maxWidth: 400 }}>
                <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => setSide('buy')} style={{ background: side === 'buy' ? '#60efff' : '#222', color: '#fff', borderRadius: 4, padding: '6px 16px', border: 'none' }}>Buy</button>
                    <button type="button" onClick={() => setSide('sell')} style={{ background: side === 'sell' ? '#ff5e5e' : '#222', color: '#fff', borderRadius: 4, padding: '6px 16px', border: 'none' }}>Sell</button>
                  </div>
                  <input type="number" step="0.01" min="0" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} required style={{ padding: 8, borderRadius: 4 }} />
                  <input type="number" step="0.01" min="0" placeholder="Size" value={size} onChange={e => setSize(e.target.value)} required style={{ padding: 8, borderRadius: 4 }} />
                  <button type="submit" style={{ marginTop: 8 }}>Place Order</button>
                </form>
              </div>
              <div className="card" style={{ marginTop: 24, width: '100%', maxWidth: 400 }}>
                <h3>Order Book</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span>Bids</span>
                  <span>Asks</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    {bids.map((b, i) => (
                      <div key={i} style={{ color: '#60efff' }}>{b.price} / {b.size}</div>
                    ))}
                  </div>
                  <div style={{ flex: 1 }}>
                    {asks.map((a, i) => (
                      <div key={i} style={{ color: '#ff5e5e' }}>{a.price} / {a.size}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card" style={{ marginTop: 24, width: '100%', maxWidth: 400 }}>
                <h3>Order History</h3>
                <ul style={{ fontSize: 14 }}>
                  {orderHistory.map((o, i) => (
                    <li key={i}>{o.time}: {o.side.toUpperCase()} {o.size} @ {o.price}</li>
                  ))}
                </ul>
              </div>
              <div className="card" style={{marginTop: 24}}>
                <h3>How it Works</h3>
                <ol>
                  <li>Connect your wallet.</li>
                  <li>Choose Buy or Sell, enter price and size.</li>
                  <li>Click <b>Place Order</b> to add to the order book.</li>
                  <li>View order book and order history.</li>
                </ol>
              </div>
            </div>
            <div className="side" style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 24px', marginTop: 28 }}>
                <h2 style={{ textAlign: 'left', margin: 0 }}>Code</h2>
                <a href="/docs?guide=order-book" style={{ color: '#60efff', fontWeight: 500, fontSize: 15 }}>Detailed Guide</a>
              </div>
              {/* The code panel will show this exact code */}
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default OrderBookPlayground;
`;

const OrderBookPlayground = () => {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  const [bids, setBids] = useState(initialBids);
  const [asks, setAsks] = useState(initialAsks);
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('');
  const [orderHistory, setOrderHistory] = useState<any[]>([]);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const order = { side, price: parseFloat(price), size: parseFloat(size), time: new Date().toLocaleTimeString() };
    setOrderHistory([order, ...orderHistory]);
    if (side === 'buy') {
      setBids([{ price: order.price, size: order.size }, ...bids]);
    } else {
      setAsks([{ price: order.price, size: order.size }, ...asks]);
    }
    setPrice('');
    setSize('');
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="playground-container" style={{ display: 'flex' }}>
            <div className="side left" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{ textAlign: 'center', width: '100%', marginBottom: 24 }}>Order Book Playground (Simulated)</h2>
              <WalletMultiButton />
              <div className="card" style={{ marginTop: 24, width: '100%', maxWidth: 400 }}>
                <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={() => setSide('buy')} style={{ background: side === 'buy' ? '#60efff' : '#222', color: '#fff', borderRadius: 4, padding: '6px 16px', border: 'none' }}>Buy</button>
                    <button type="button" onClick={() => setSide('sell')} style={{ background: side === 'sell' ? '#ff5e5e' : '#222', color: '#fff', borderRadius: 4, padding: '6px 16px', border: 'none' }}>Sell</button>
                  </div>
                  <input type="number" step="0.01" min="0" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} required style={{ padding: 8, borderRadius: 4 }} />
                  <input type="number" step="0.01" min="0" placeholder="Size" value={size} onChange={e => setSize(e.target.value)} required style={{ padding: 8, borderRadius: 4 }} />
                  <button type="submit" style={{ marginTop: 8 }}>Place Order</button>
                </form>
              </div>
              <div className="card" style={{ marginTop: 24, width: '100%', maxWidth: 400 }}>
                <h3>Order Book</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span>Bids</span>
                  <span>Asks</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    {bids.map((b, i) => (
                      <div key={i} style={{ color: '#60efff' }}>{b.price} / {b.size}</div>
                    ))}
                  </div>
                  <div style={{ flex: 1 }}>
                    {asks.map((a, i) => (
                      <div key={i} style={{ color: '#ff5e5e' }}>{a.price} / {a.size}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card" style={{ marginTop: 24, width: '100%', maxWidth: 400 }}>
                <h3>Order History</h3>
                <ul style={{ fontSize: 14 }}>
                  {orderHistory.map((o, i) => (
                    <li key={i}>{o.time}: {o.side.toUpperCase()} {o.size} @ {o.price}</li>
                  ))}
                </ul>
              </div>
              <div className="card" style={{marginTop: 24}}>
                <h3>How it Works</h3>
                <ol>
                  <li>Connect your wallet.</li>
                  <li>Choose Buy or Sell, enter price and size.</li>
                  <li>Click <b>Place Order</b> to add to the order book.</li>
                  <li>View order book and order history.</li>
                </ol>
              </div>
            </div>
            <div className="side" style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 24px', marginTop: 28 }}>
                <h2 style={{ textAlign: 'left', margin: 0 }}>Code</h2>
                <a href="/docs?guide=order-book" style={{ color: '#60efff', fontWeight: 500, fontSize: 15 }}>Detailed Guide</a>
              </div>
              <SyntaxHighlighter language="tsx" style={vscDarkPlus} customStyle={{ borderRadius: 8, fontSize: 14, width: '100%' }}>
                {codeExample}
              </SyntaxHighlighter>
            </div>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default OrderBookPlayground;