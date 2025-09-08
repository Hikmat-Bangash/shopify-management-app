'use client';

import { useEffect, useState, useCallback } from 'react';
import useAuthStore from '../../store/authStore';
// import SpinningTool from '../components/SpinningTool';
import SpinningTool from '../components/SpinningTool2';

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
  const [spinningToolLoading, setSpinningToolLoading] = useState(false);
  const [spinningToolKey, setSpinningToolKey] = useState(0);
  const [message, setMessage] = useState('');

  // Settings state
  const [topValue, setTopValue] = useState('');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [xAxisCollections, setXAxisCollections] = useState([]);
  const [yAxisCollections, setYAxisCollections] = useState([]);

  // Shopify collections state
  const [shopifyCollections, setShopifyCollections] = useState([]);
  const [matchedXCollections, setMatchedXCollections] = useState([]);
  const [matchedYCollections, setMatchedYCollections] = useState([]);

  // UI state for toast visibility
  const [showToast, setShowToast] = useState(false);

  // Sample data for testing the spinning tool
  const sampleProducts = [
    {
      id: '1',
      title: 'Gold Watch',
      description: 'Luxury gold wristwatch with diamond bezel',
      featuredImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
      variants: [
        { id: 'v1', image: { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop' } },
        { id: 'v2', image: { url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop' } },
        { id: 'v3', image: { url: 'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=400&h=400&fit=crop' } }
      ]
    },
    {
      id: '2',
      title: 'Silver Watch',
      description: 'Elegant silver wristwatch with leather strap',
      featuredImage: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop',
      variants: [
        { id: 'v4', image: { url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop' } },
        { id: 'v5', image: { url: 'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=400&h=400&fit=crop' } }
      ]
    },
    {
      id: '3',
      title: 'Rose Gold Watch',
      description: 'Beautiful rose gold watch with mother of pearl dial',
      featuredImage: 'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=400&h=400&fit=crop',
      variants: [
        { id: 'v6', image: { url: 'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=400&h=400&fit=crop' } },
        { id: 'v7', image: { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop' } },
        { id: 'v8', image: { url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop' } }
      ]
    }
  ];

  const sampleCollections = [
    {
      id: 'c1',
      title: 'Luxury Collection',
      description: 'Premium luxury watches',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
      products: sampleProducts
    },
    {
      id: 'c2',
      title: 'Classic Collection',
      description: 'Timeless classic designs',
      image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop',
      products: sampleProducts.slice(0, 2)
    }
  ];

  // Function to fetch all collections from Shopify
  const fetchAllCollections = useCallback(async () => {
    try {
      console.log('Fetching all collections for shop:', shop);
      
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          shop, 
          token
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('Collections fetched successfully:', data.collections);
        return data.collections;
      } else {
        console.error('Error fetching collections:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      return null;
    }
  }, [shop, token]);

  // Define functions before using them in useEffect
  const loadSettings = useCallback(async () => {
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
  }, [shop, getSettings]);

  // Function to load settings and match collections
  const loadSettingsAndMatchCollections = useCallback(async () => {
    try {
      // Load settings first
      await loadSettings();
      
      // Fetch all collections from Shopify
      const collections = await fetchAllCollections();
      if (collections) {
        setShopifyCollections(collections);
        console.log('Shopify collections loaded:', collections.length);
      }
    } catch (error) {
      console.error('Error loading settings and collections:', error);
    }
  }, [loadSettings, fetchAllCollections]);

  const fetchMenuData = useCallback(async () => {
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
  }, [shop, token]);

  // Load settings and collections on component mount
  useEffect(() => {
    if (shop && token) {
      loadSettingsAndMatchCollections();
    }
  }, [shop, token, loadSettingsAndMatchCollections]);

  // Match collections whenever settings or Shopify collections change
  useEffect(() => {
    if (shopifyCollections.length > 0 && (xAxisCollections.length > 0 || yAxisCollections.length > 0)) {
      console.log('Matching collections...');
      
      // Match X-axis collections
      const matchedX = matchCollections(shopifyCollections, xAxisCollections);
      setMatchedXCollections(matchedX);
      
      // Match Y-axis collections (only if not variations)
      if (yAxisCollections.length > 0 && !yAxisCollections[0]?.variation) {
        // const matchedY = matchCollections(shopifyCollections, yAxisCollections);
        // setMatchedYCollections(matchedY);
      } else {
        setMatchedYCollections([]);
      }
      
      // console.log('Matched X collections:', matchedX.length);
      // console.log('Matched Y collections:', yAxisCollections[0]?.variation ? 'variations' : matchedY.length);
    }
  }, [shopifyCollections, xAxisCollections, yAxisCollections]);

  // Load menu data
  useEffect(() => {
    if (!shop || !token) return;
    
    setLoading(true);
    fetchMenuData();
  }, [shop, token, fetchMenuData]);

  // Show toast when message changes and is not empty
  useEffect(() => {
    if (message) {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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

      console.log('Saving settings with data:', settingsData);
      console.log('Shop:', shop);

      const result = await saveSettings(shop, settingsData);
      
      console.log('Save result:', result);
      
      if (result.success) {
        setMessage('Settings saved successfully!');
      } else {
        setMessage('Failed to save settings: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings: ' + error.message);
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

  // Function to match Shopify collections with DB collections by title
  const matchCollections = (shopifyCollections, dbCollections) => {
    if (!shopifyCollections || !dbCollections) return [];
    
    const matchedCollections = [];
    
    dbCollections.forEach(dbCollection => {
      const matchedCollection = shopifyCollections.find(shopifyCollection => 
        shopifyCollection.title.toLowerCase() === dbCollection.title.toLowerCase()
      );
      
      if (matchedCollection) {
        matchedCollections.push({
          ...matchedCollection,
          dbData: dbCollection // Keep original DB data for reference
        });
      }
    });
    
    console.log(`Matched ${matchedCollections.length} collections out of ${dbCollections.length} DB collections`);
    return matchedCollections;
  };

  // Function to extract all products from collections for Scenario 1
  const getAllProductsFromCollections = (collections) => {
    if (!collections || collections.length === 0) return [];
    
    const allProducts = [];
    collections.forEach(collection => {
      if (collection.products && collection.products.length > 0) {
        allProducts.push(...collection.products);
      }
    });
    
    console.log(`Extracted ${allProducts.length} products from ${collections.length} collections`);
    return allProducts;
  };

  // Handle X-Axis collection selection
  const handleXAxisChange = (value) => {
    setXAxis(value);
    setYAxis(''); // Always clear Y-Axis selection, do not auto-select any value
    setYAxisCollections([]); // Always clear Y-Axis collections
    
    // Show loading and reset spinning tool indices
    setSpinningToolLoading(true);
    setSpinningToolKey(prev => prev + 1); // Force re-render of spinning tool
    
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
    
    // Hide loading after 2 seconds
    setTimeout(() => {
      setSpinningToolLoading(false);
    }, 2000);
  };

  // Handle Y-Axis collection selection
  const handleYAxisChange = (value) => {
    setYAxis(value);
    
    // Show loading and reset spinning tool indices
    setSpinningToolLoading(true);
    setSpinningToolKey(prev => prev + 1); // Force re-render of spinning tool
    
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
    
    // Hide loading after 2 seconds
    setTimeout(() => {
      setSpinningToolLoading(false);
    }, 2000);
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

     

      {/* Spinning Tool Demo */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">
          {matchedXCollections.length > 0 ? "Spinning Tool Preview" : "Spinning Tool Demo"}
        </h2>
        {matchedXCollections.length > 0 ? (
          <div className="w-full h-[600px] bg-transparent rounded-lg overflow-hidden">
            {spinningToolLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-gray-600">
                  Preparing spinning tool...
                </div>
              </div>
            ) : (
              (() => {
                const productsForTool = yAxis === 'variation' ? getAllProductsFromCollections(matchedXCollections) : [];
                const collectionsForTool = yAxis === 'variation' ? [] : matchedXCollections;
                
                console.log('SpinningTool Data:', {
                  yAxis,
                  productsCount: productsForTool.length,
                  collectionsCount: collectionsForTool.length,
                  yAxisDisplayMode: yAxis === 'variation' ? 'variants' : 'categoryProducts',
                  sampleProduct: productsForTool[0],
                  sampleCollection: collectionsForTool[0]
                });
                
                // Debug product image structure
                if (productsForTool.length > 0) {
                  console.log('Sample Product Image Structure:', {
                    featuredImage: productsForTool[0]?.featuredImage,
                    variants: productsForTool[0]?.variants?.slice(0, 2),
                    title: productsForTool[0]?.title
                  });
                }
                
                return (
                  <SpinningTool
                    key={spinningToolKey}
                    productsList={productsForTool}
                    collectionsData={collectionsForTool}
                    yAxisDisplayMode={yAxis === 'variation' ? 'variants' : 'categoryProducts'}
                  />
                );
              })()
            )}
          </div>
        ) : (
          loading && (
            <div className="mt-4 text-center text-gray-600">
              Preparing spinning tool...
            </div>
          )
        )}
      </div>
    </div>
  );
}