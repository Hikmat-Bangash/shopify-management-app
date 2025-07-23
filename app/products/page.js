'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useAuthStore from '../../store/authStore';



export default function DashboardPage() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const shop = useAuthStore((state) => state.shop);
const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (shop && token) {
      setAuth(shop, token);
    }
  }, [shop, token, setAuth]);

  useEffect(() => {
    if (shop && token) {
      fetch(`/api/products?shop=${shop}&token=${token}`)
        .then(res => res.json())
        .then(data => {
          setProducts(data.products || []);
          setLoading(false);
          console.log('Products fetched:', data.products);
        });
    }
  }, [shop, token]);

  if (loading) return <div className="text-center flex justify-center items-center mt-10 text-blue-400">Loading...</div>;

  return (
    <div className="p-6  mx-auto w-full ">
      <h1 className="text-3xl font-bold mb-6 text-center">Products</h1>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Title</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Vendor</th>
            <th className="border px-4 py-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-4">No products found.</td>
            </tr>
          )}
          {products.map(product => (
            <tr key={product.id}>
              <td className="border px-4 py-2">{product.id}</td>
              <td className="border px-4 py-2">{product.title}</td>
              <td className="border px-4 py-2">{product.status}</td>
              <td className="border px-4 py-2">{product.vendor}</td>
              <td className="border px-4 py-2">{new Date(product.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}