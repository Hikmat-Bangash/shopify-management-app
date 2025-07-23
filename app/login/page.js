'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [shop, setShop] = useState('1cb12f-54.myshopify.com');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidShop = (shop) => /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/.test(shop);

  const handleLogin = () => {
    setError('');
    if (!shop) {
      setError('Please enter your Shopify shop domain.');
      return;
    }
    if (!isValidShop(shop)) {
      setError('Invalid shop domain format. Example: your-store.myshopify.com');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      router.push(`/api/auth?shop=${shop}`);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10">
      <h1 className="text-3xl mb-4 font-bold">Login with Shopify</h1>
      <input
        type="text"
        placeholder="your-store.myshopify.com"
        value={shop}
        onChange={e => setShop(e.target.value)}
        className="border px-3 py-2 mb-2 rounded"
        disabled={loading}
      />
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <button
        onClick={handleLogin}
        className={`bg-black text-white px-6 py-2 rounded ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Login with Shopify'}
      </button>
    </div>
  );
}