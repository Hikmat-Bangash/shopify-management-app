import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      shop: null,
      token: null,
      setAuth: (shop, token) => set({ shop, token }),
      clearAuth: () => set({ shop: null, token: null }),
    }),
    {
      name: 'shopify-auth',
    }
  )
);

export default useAuthStore;