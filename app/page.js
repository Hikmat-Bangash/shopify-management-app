// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../store/authStore';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const { setAuth, checkStoreStatus, saveStoreToDB } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const shop = document.cookie.split('; ').find(row => row.startsWith('shop='))?.split('=')[1];
        const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

        if (!shop || !token) {
          router.replace('/login');
          return;
        }

        // Check if store is already logged in the database
        const storeStatus = await checkStoreStatus(shop);
        
        if (storeStatus.success && storeStatus.isLoggedIn) {
          // Store already exists in database, just set auth
          setAuth(shop, token, storeStatus.store?.storeId);
          console.log('Store already logged in:', shop);
        } else {
          // Store not in database, save it
          const saveResult = await saveStoreToDB(shop, token);
          if (saveResult.success) {
            setAuth(shop, token);
            console.log('Store saved to database:', shop);
          } else {
            console.error('Failed to save store to database:', saveResult.error);
            // Still set auth even if database save fails
            setAuth(shop, token);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [router, setAuth, checkStoreStatus, saveStoreToDB]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-100 px-4">
        <div className="text-lg text-green-700">Loading...</div>
      </div>
    );
  }

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
