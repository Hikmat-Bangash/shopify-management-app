'use client';

import { useEffect, useState } from 'react';
import useAuthStore from '../../store/authStore';

// Helper function to extract collections from menu items
function extractCollections(items, level = 1) {
  const collections = [];
  
  items.forEach(item => {
    // Check if this is a collection link (has collection URL pattern)
    if (item.type === 'collection_link' && item.url && item.url.includes('/collections/')) {
      // Extract handle from URL (e.g., /collections/women -> women)
      const handle = item.url.split('/collections/')[1];
      
      collections.push({
        id: `gid://shopify/Collection/${handle}`, // Generate a pseudo ID
        title: item.title,
        handle: handle,
        description: '', // No description in menu data
        image: null, // No image in menu data
        level: level,
        products: [], // No products in menu data
        url: item.url,
        type: item.type
      });
    }
    
    // Recursively process children
    if (item.children && item.children.length > 0) {
      collections.push(...extractCollections(item.children, level + 1));
    }
  });
  
  return collections;
}

// Helper function to get collections by level
function getCollectionsByLevel(collections, level) {
  return collections.filter(collection => collection.level === level);
}

export default function SettingsPage() {
  const { shop, token, getSettings, saveSettings } = useAuthStore();
  const [menu, setMenu] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Settings state
  const [topValue, setTopValue] = useState('');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [xAxisCollections, setXAxisCollections] = useState([]);
  const [yAxisCollections, setYAxisCollections] = useState([]);

  // UI state for toast visibility
  const [showToast, setShowToast] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    if (shop) {
      loadSettings();
    }
  }, [shop]);

  // Load menu data
  useEffect(() => {
    if (!shop || !token) return;
    
    setLoading(true);
    fetchMenuData();
  }, [shop, token]);

  // Show toast when message changes and is not empty
  useEffect(() => {
    if (message) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadSettings = async () => {
    try {
      const result = await getSettings(shop);
      if (result.success && result.settings) {
        const settings = result.settings;
        setTopValue(settings.topValue || '');
        setXAxis(settings.xAxis || '');
        setYAxis(settings.yAxis || '');
        setXAxisCollections(settings.xAxisCollections || []);
        setYAxisCollections(settings.yAxisCollections || []);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const fetchMenuData = async () => {
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shop, token }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch menu data');
      }

      const data = await response.json();
      console.log('Raw menu data:', data);
      
      if (data.menu) {
        console.log('Menu items:', data.menu);
        const extractedCollections = extractCollections(data.menu);
        setCollections(extractedCollections);
        console.log('Extracted collections:', extractedCollections);
      }
      
      setMenu(data.menu);
    } catch (error) {
      console.error('Error fetching menu:', error);
      setMessage('Error loading menu data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!shop) {
      setMessage('No shop available');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const settingsData = {
        topValue,
        xAxis,
        yAxis: yAxis || '', // Ensure yAxis is empty string if not set
        xAxisCollections,
        yAxisCollections: yAxis ? yAxisCollections : [] // Save empty array if yAxis is empty
      };

      const result = await saveSettings(shop, settingsData);
      
      if (result.success) {
        setMessage('Settings saved successfully!');
      } else {
        setMessage('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  // Get collections by level for dropdowns
  const layer1Collections = getCollectionsByLevel(collections, 1);
  const layer2Collections = getCollectionsByLevel(collections, 2);
  const layer3Collections = getCollectionsByLevel(collections, 3);

  // X-Axis options
  const xAxisOptions = [
    ...(layer1Collections.length > 0 ? [{ 
      label: layer1Collections.map(c => c.title).join(', '), 
      value: "layer1" 
    }] : []),
    ...(layer2Collections.length > 0 ? [{ 
      label: layer2Collections.map(c => c.title).join(', '), 
      value: "layer2" 
    }] : []),
    ...(layer3Collections.length > 0 ? [{ 
      label: layer3Collections.map(c => c.title).join(', '), 
      value: "layer3" 
    }] : [])
  ];

  // Y-Axis options based on X-Axis selection
  const getYAxisOptions = () => {
    if (topValue !== "product" || xAxis === "") {
      return [];
    }
    const options = [];
    
    if (xAxis === "layer1") {
      if (layer2Collections.length > 0) {
        options.push({ label: layer2Collections.map(c => c.title).join(', '), value: "layer2" });
      }
      if (layer3Collections.length > 0) {
        options.push({ label: layer3Collections.map(c => c.title).join(', '), value: "layer3" });
      }
      // Add variation option at the bottom
      options.push({ label: "Variation", value: "variation" });
    } else if (xAxis === "layer2") {
      if (layer3Collections.length > 0) {
        options.push({ label: layer3Collections.map(c => c.title).join(', '), value: "layer3" });
      }
      // Add variation option at the bottom
      options.push({ label: "Variation", value: "variation" });
    } else if (xAxis === "layer3") {
      // Last layer: only variation option available
      options.push({ label: "Variation", value: "variation" });
    }
    
    return options;
  };

  const yAxisOptions = getYAxisOptions();

  // Handle X-Axis collection selection
  const handleXAxisChange = (value) => {
    setXAxis(value);
    setYAxis(''); // Always clear Y-Axis selection, do not auto-select any value
    setYAxisCollections([]); // Always clear Y-Axis collections
    
    // Update X-Axis collections based on selection
    if (value === "layer1") {
      setXAxisCollections(layer1Collections);
    } else if (value === "layer2") {
      setXAxisCollections(layer2Collections);
    } else if (value === "layer3") {
      setXAxisCollections(layer3Collections);
      // For layer3 (last layer), auto-select variation
      setTimeout(() => {
        handleYAxisChange('variation');
      }, 0);
    } else {
      setXAxisCollections([]);
    }
  };

  // Handle Y-Axis collection selection
  const handleYAxisChange = (value) => {
    setYAxis(value);
    
    // Update Y-Axis collections based on selection
    if (value === "variation") {
      // For variation, add a string to yAxisCollections
      setYAxisCollections([{ variation: "variation" }]);
    } else if (value === "layer2") {
      setYAxisCollections(layer2Collections);
    } else if (value === "layer3") {
      setYAxisCollections(layer3Collections);
    } else {
      setYAxisCollections([]);
    }
  };

  // Reset settings when topValue changes
  useEffect(() => {
    if (topValue !== "product") {
      setXAxis("");
      setYAxis("");
      setXAxisCollections([]);
      setYAxisCollections([]);
    }
  }, [topValue]);



  return (
    <div className="w-full p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      {showToast && message && (
        <div className={`mb-4 p-3 rounded relative flex items-center justify-between ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}> 
          <span>{message}</span>
          <button
            onClick={() => setShowToast(false)}
            className="ml-4 text-xl font-bold leading-none focus:outline-none"
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      <div className="mb-6 grid gap-6">
        <div>
          <label className="block mb-2 font-semibold">Product Root</label>
          <select
            className="border px-3 py-2 rounded w-full"
            value={topValue}
            onChange={e => setTopValue(e.target.value)}
            disabled={loading}
          >
            <option value="">Select root option</option>
            <option value="home">Home</option>
            <option value="catalog">Catalog</option>
            <option value="contact">Contact</option>
            <option value="product">Product</option>
          </select>
        </div>

        {/* X-Axis always visible, only enabled if topValue === 'product' */}
        <div>
          <label className="block mb-2 font-semibold">X-Axis Display Mode</label>
          <select
            className="border px-3 py-2 rounded w-full"
            value={xAxis}
            onChange={e => handleXAxisChange(e.target.value)}
            disabled={topValue !== "product" || loading}
            style={{ opacity: (topValue !== "product" || loading) ? 0.5 : 1 }}
          >
            {xAxis === '' && <option value="" disabled>Select X-Axis</option>}
            {xAxisOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Y-Axis always visible, only enabled if X-Axis is selected */}
        <div>
          <label className="block mb-2 font-semibold">Y-Axis Display Mode</label>
          <select
            className="border px-3 py-2 rounded w-full"
            value={yAxis}
            onChange={e => handleYAxisChange(e.target.value)}
            disabled={topValue !== 'product' || xAxis === '' || loading}
            style={{ opacity: (topValue !== 'product' || xAxis === '' || loading) ? 0.5 : 1 }}
          >
            {yAxis === '' && <option value="" disabled>Select Y-Axis</option>}
            {yAxisOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

       
      </div>

    

      <div className="flex gap-4">
        <button
          onClick={handleSaveSettings}
          disabled={saving || loading}
          className="bg-blue-500 text-white cursor-pointer px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
        
        {/* <button
          onClick={loadSettings}
          disabled={loading}
          className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Reset to Saved
        </button> */}

      </div>

      {loading && (
        <div className="mt-4 text-center text-gray-600">
          Loading menu data...
        </div>
      )}
    </div>
  );
}