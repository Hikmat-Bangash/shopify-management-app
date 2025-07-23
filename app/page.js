// app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const shop = document.cookie.split('; ').find(row => row.startsWith('shop='))?.split('=')[1];
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    if (!shop || !token) {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100 px-4">
      <h1 className="text-3xl md:text-4xl font-extrabold text-green-700 mb-4 tracking-tight text-center">
        WELCOME TO THE SHOPIFY SELLER APP MANAGEMENT
      </h1>
      <p className="text-base md:text-lg text-green-900 mt-2 text-center">
        Manage your products, settings, and more with ease.
      </p>
    </div>
  );
}
