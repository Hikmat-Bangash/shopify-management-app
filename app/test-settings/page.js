'use client';

import { useState } from 'react';
import useAuthStore from '../../store/authStore';

export default function TestSettingsPage() {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);
  const { shop, token, getSettings, saveSettings } = useAuthStore();

  const testGetSettings = async () => {
    if (!shop) {
      setTestResult('No shop available. Please login first.');
      return;
    }

    setLoading(true);
    try {
      const result = await getSettings(shop);
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSaveSettings = async () => {
    if (!shop) {
      setTestResult('No shop available. Please login first.');
      return;
    }

    setLoading(true);
    try {
      const testSettings = {
        topValue: 'product',
        xAxis: 'level1',
        yAxis: 'level2',
        xAxisCollections: [
          {
            id: 'gid://shopify/Collection/123456789',
            title: 'Test Collection 1',
            handle: 'test-collection-1',
            level: 1,
            products: []
          }
        ],
        yAxisCollections: [
          {
            id: 'gid://shopify/Collection/987654321',
            title: 'Test Collection 2',
            handle: 'test-collection-2',
            level: 2,
            products: []
          }
        ]
      };

      const result = await saveSettings(shop, testSettings);
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
        <h1 className="text-3xl font-bold mb-6">Settings Test Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
          <div className="space-y-2">
            <p><strong>Shop:</strong> {shop || 'Not set'}</p>
            <p><strong>Token:</strong> {token ? 'Available' : 'Not set'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Settings Operations</h2>
          <div className="space-y-4">
            <button
              onClick={testGetSettings}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-4 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Get Settings'}
            </button>
            
            <button
              onClick={testSaveSettings}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Save Test Settings'}
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