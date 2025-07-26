import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      shop: null,
      token: null,
      storeId: null,
      isLoggedIn: false,
      setAuth: (shop, token, storeId = null) => set({ shop, token, storeId, isLoggedIn: true }),
      clearAuth: () => set({ shop: null, token: null, storeId: null, isLoggedIn: false }),
      checkStoreStatus: async (shop) => {
        try {
          const response = await fetch(`/api/store?shop=${shop}`);
          const data = await response.json();
          
          if (data.success && data.isLoggedIn) {
            set({ 
              shop: data.store.shop, 
              storeId: data.store.storeId, 
              isLoggedIn: true 
            });
            return data;
          }
          return data;
        } catch (error) {
          console.error('Error checking store status:', error);
          return { success: false, isLoggedIn: false };
        }
      },
      saveStoreToDB: async (shop, token, storeId = null) => {
        try {
          const response = await fetch('/api/store', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ shop, token, storeId }),
          });
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('Error saving store to database:', error);
          return { success: false, error: error.message };
        }
      },
      getSettings: async (shop) => {
        try {
          const response = await fetch(`/api/settings?shop=${shop}`);
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('Error getting settings:', error);
          return { success: false, error: error.message };
        }
      },
      saveSettings: async (shop, settings) => {
        try {
          const response = await fetch('/api/settings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ shop, ...settings }),
          });
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('Error saving settings:', error);
          return { success: false, error: error.message };
        }
      },
      saveProductStatus: async (shop, productId, isActive) => {
        try {
          const response = await fetch('/api/product-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ shop, productId, isActive }),
          });
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('Error saving product status:', error);
          return { success: false, error: error.message };
        }
      },
      getProductStatuses: async (shop) => {
        try {
          const response = await fetch(`/api/product-status?shop=${shop}`);
          const data = await response.json();
          return data;
        } catch (error) {
          console.error('Error getting product statuses:', error);
          return { success: false, error: error.message };
        }
      }
    }),
    {
      name: 'shopify-auth',
    }
  )
);

export default useAuthStore;