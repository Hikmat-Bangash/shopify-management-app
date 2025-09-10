'use client';

import { useState } from 'react';
import useAuthStore from '../../store/authStore';

export default function TestDBPage() {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { shop, token, checkStoreStatus, saveStoreToDB } = useAuthStore();

  const testCheckStore = async () => {
    if (!shop) {
      setTestResult('No shop available. Please login first.');
      return;
    }

    setLoading(true);
    try {
      const result = await checkStoreStatus(shop);
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSaveStore = async () => {
    if (!shop || !token) {
      setTestResult('No shop or token available. Please login first.');
      return;
    }

    setLoading(true);
    try {
      const result = await saveStoreToDB(shop, token);
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Database Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
          <div className="space-y-2">
            <p><strong>Shop:</strong> {shop || 'Not set'}</p>
            <p><strong>Token:</strong> {token ? 'Available' : 'Not set'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Database Operations</h2>
          <div className="space-y-4">
            <button
              onClick={testCheckStore}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-4 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Testing...' : 'Check Store Status'}
            </button>
            
            <button
              onClick={testSaveStore}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Testing...' : 'Save Store to DB'}
            </button>
          </div>
        </div>

        {testResult && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Test Result</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {testResult}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 