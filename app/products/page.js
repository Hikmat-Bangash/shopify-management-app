'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useAuthStore from '../../store/authStore';

export default function DashboardPage() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const [products, setProducts] = useState([]);
  const [productStatuses, setProductStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const shop = useAuthStore((state) => state.shop);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (shop && token) {
      setAuth(shop, token);
    }
  }, [shop, token, setAuth]);

  useEffect(() => {
    if (shop && token) {
      fetchProducts();
      fetchProductStatuses();
    }
  }, [shop, token]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/products?shop=${shop}&token=${token}`);
      const data = await response.json();
      setProducts(data.products || []);
      console.log('Products fetched:', data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductStatuses = async () => {
    try {
      const response = await fetch(`/api/product-status?shop=${shop}`);
      const data = await response.json();
      if (data.success) {
        const statusMap = {};
        data.statuses.forEach(status => {
          statusMap[status.productId] = status.isActive;
        });
        setProductStatuses(statusMap);
      }
    } catch (error) {
      console.error('Error fetching product statuses:', error);
    }
  };

  const handleStatusToggle = async (productId) => {
    if (updatingStatus[productId]) return; // Prevent multiple clicks
    
    setUpdatingStatus(prev => ({ ...prev, [productId]: true }));
    
    try {
      const currentStatus = productStatuses[productId] !== false; // Default to true if not set
      const newStatus = !currentStatus;
      
      const response = await fetch('/api/product-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop,
          productId: productId.toString(),
          isActive: newStatus
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setProductStatuses(prev => ({
          ...prev,
          [productId]: newStatus
        }));
      } else {
        console.error('Failed to update product status:', data);
      }
    } catch (error) {
      console.error('Error updating product status:', error);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [productId]: false }));
    }
  };

  const getStatusButton = (productId) => {
    const isActive = productStatuses[productId] !== false; // Default to true if not set
    const isLoading = updatingStatus[productId];
    
    return (
      <div className="flex items-center justify-center">
        <div className="relative inline-block w-12 mr-2 align-middle select-none">
          <input
            type="checkbox"
            name={`toggle-${productId}`}
            id={`toggle-${productId}`}
            checked={isActive}
            onChange={() => handleStatusToggle(productId)}
            disabled={isLoading}
            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out"
          />
          <label
            htmlFor={`toggle-${productId}`}
            className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
              isActive ? 'bg-green-500' : 'bg-gray-300'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
        </div>
        <span className={`text-sm font-medium ${isActive ? 'text-green-600' : 'text-red-500'}`}>
          {isLoading ? 'Updating...' : (isActive ? 'Active' : 'Inactive')}
        </span>
      </div>
    );
  };

  if (loading) return <div className="text-center flex justify-center items-center mt-10 text-blue-400">Loading...</div>;

  return (
    <div className="p-6 mx-auto w-full">
      <h1 className="text-3xl font-bold mb-6 text-center">Products</h1>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Title</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Vendor</th>
            <th className="border px-4 py-2">Created At</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-4">No products found.</td>
            </tr>
          )}
          {products.map(product => (
            <tr key={product.id}>
              <td className="border px-4 py-2">{product.id}</td>
              <td className="border px-4 py-2">{product.title}</td>
              <td className="border px-4 py-2">{product.status}</td>
              <td className="border px-4 py-2">{product.vendor}</td>
              <td className="border px-4 py-2">{new Date(product.created_at).toLocaleString()}</td>
              <td className="border px-4 py-2 text-center">
                {getStatusButton(product.id)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}