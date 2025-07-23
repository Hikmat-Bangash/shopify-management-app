'use client';

import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

export default function SyncAuth() {
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    // Read from cookies (set by server after login)
    const shop = document.cookie.split('; ').find(row => row.startsWith('shop='))?.split('=')[1];
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (shop && token) {
      setAuth(shop, token);
    }
  }, [setAuth]);

  return null;
}