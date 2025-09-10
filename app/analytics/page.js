'use client';

import { useState, useEffect } from 'react';
import { FaEye, FaMousePointer, FaShoppingCart, FaTrendingUp, FaFilter, FaSort, FaSync, FaDownload, FaChartLine, FaUsers, FaBox } from 'react-icons/fa';
import useAuthStore from '../../store/authStore';
import AnalyticsChart from '../components/AnalyticsChart';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [productsData, setProductsData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [sortBy, setSortBy] = useState('totalViews');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [recentActivity, setRecentActivity] = useState([]);
  const { shop } = useAuthStore();

  useEffect(() => {
    if (shop) {
      fetchAnalyticsData();
    }
  }, [shop, sortBy, sortOrder, filterType, dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch summary data
      const summaryResponse = await fetch(`/api/analytics/summary?shop=${shop}&limit=10`);
      const summaryResult = await summaryResponse.json();
      
      if (summaryResult.success) {
        console.log('Summary data:', summaryResult.data);
        setSummaryData(summaryResult.data);
        setRecentActivity(summaryResult.data.recentActivity || []);
      } else {
        console.error('Summary API error:', summaryResult.error);
      }

      // Fetch products data
      const productsResponse = await fetch(`/api/analytics/products?shop=${shop}&sortBy=${sortBy}&order=${sortOrder}&limit=50`);
      const productsResult = await productsResponse.json();
      
      if (productsResult.success) {
        console.log('Products data:', productsResult.data);
        setProductsData(productsResult.data.products);
      } else {
        console.error('Products API error:', productsResult.error);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = async (productId) => {
    try {
      const response = await fetch(`/api/analytics/product-views/${productId}?shop=${shop}`);
      const result = await response.json();
      
      if (result.success) {
        setSelectedProduct(result.data);
        setShowProductModal(true);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getConversionRate = (from, to) => {
    if (from === 0) return 0;
    return ((to / from) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Track product interactions and user behavior</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchAnalyticsData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <FaSync />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
              <FaDownload />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summaryData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{summaryData.summary.totalProducts}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaBox className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Center Views</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(summaryData.summary.totalCenterViews)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaEye className="text-green-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Variation Views</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(summaryData.summary.totalVariationViews)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaMousePointer className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Add to Cart</p>
                <p className="text-3xl font-bold text-gray-900">{formatNumber(summaryData.summary.totalAddToCart)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FaShoppingCart className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Rates */}
      {summaryData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rates</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Center → Variation</span>
                <span className="text-lg font-bold text-blue-600">
                  {getConversionRate(summaryData.summary.totalCenterViews, summaryData.summary.totalVariationViews)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Variation → Cart</span>
                <span className="text-lg font-bold text-green-600">
                  {getConversionRate(summaryData.summary.totalVariationViews, summaryData.summary.totalAddToCart)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Center → Cart</span>
                <span className="text-lg font-bold text-purple-600">
                  {getConversionRate(summaryData.summary.totalCenterViews, summaryData.summary.totalAddToCart)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products by Views</h3>
            <div className="space-y-3">
              {summaryData.topProducts.byCenterViews.slice(0, 3).map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 truncate max-w-32">
                      {product.productName}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-600">{product.centerViews}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products by Cart</h3>
            <div className="space-y-3">
              {summaryData.topProducts.byAddToCart.slice(0, 3).map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600">{index + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 truncate max-w-32">
                      {product.productName}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-600">{product.addToCart}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      {summaryData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AnalyticsChart
            title="Interaction Distribution"
            type="doughnut"
            data={[
              { label: 'Center Views', value: summaryData.summary.totalCenterViews },
              { label: 'Variation Views', value: summaryData.summary.totalVariationViews },
              { label: 'Add to Cart', value: summaryData.summary.totalAddToCart }
            ]}
          />
          
          <AnalyticsChart
            title="Top Products by Total Views"
            type="bar"
            data={summaryData.topProducts.byTotalViews.slice(0, 5).map((product, index) => ({
              label: product.productName.substring(0, 15) + (product.productName.length > 15 ? '...' : ''),
              value: product.totalInteractions
            }))}
          />
        </div>
      )}

      {/* Recent Activity Feed */}
      {recentActivity.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live
            </div>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentActivity.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.interactionType === 'center_view' ? 'bg-blue-100' :
                  activity.interactionType === 'variation_view' ? 'bg-yellow-100' :
                  'bg-purple-100'
                }`}>
                  {activity.interactionType === 'center_view' ? <FaEye className="text-blue-600" /> :
                   activity.interactionType === 'variation_view' ? <FaMousePointer className="text-yellow-600" /> :
                   <FaShoppingCart className="text-purple-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.productName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {activity.interactionType.replace('_', ' ')} interaction
                  </p>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Products</option>
              <option value="centerViews">High Center Views</option>
              <option value="variationViews">High Variation Views</option>
              <option value="addToCart">High Add to Cart</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <FaSort className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="totalViews">Total Views</option>
              <option value="centerViews">Center Views</option>
              <option value="variationViews">Variation Views</option>
              <option value="addToCart">Add to Cart</option>
              <option value="lastUpdated">Last Updated</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Product Analytics</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Center Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variation Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Add to Cart</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productsData.map((product) => (
                <tr key={product.productId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={product.productImage || '/placeholder-product.jpg'}
                          alt={product.productName}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-48">
                          {product.productName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.productId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaEye className="text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{product.viewCounts.centerViews}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaMousePointer className="text-yellow-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{product.viewCounts.variationViews}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaShoppingCart className="text-purple-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{product.viewCounts.addToCart}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FaChartLine className="text-green-500 mr-2" />
                      <span className="text-sm font-bold text-gray-900">{product.viewCounts.totalViews}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleProductClick(product.productId)}
                      className="text-blue-600 hover:text-blue-900 transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Details Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Product Analytics Details</h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl cursor-pointer"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <img
                  className="h-20 w-20 rounded-lg object-cover"
                  src={selectedProduct.productImage || '/placeholder-product.jpg'}
                  alt={selectedProduct.productName}
                />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{selectedProduct.productName}</h4>
                  <p className="text-sm text-gray-500">{selectedProduct.productId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600">Center Views</span>
                    <span className="text-2xl font-bold text-blue-900">{selectedProduct.viewCounts.centerViews}</span>
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-yellow-600">Variation Views</span>
                    <span className="text-2xl font-bold text-yellow-900">{selectedProduct.viewCounts.variationViews}</span>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-600">Add to Cart</span>
                    <span className="text-2xl font-bold text-purple-900">{selectedProduct.viewCounts.addToCart}</span>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600">Total Views</span>
                    <span className="text-2xl font-bold text-green-900">{selectedProduct.viewCounts.totalViews}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h5 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rates</h5>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Center → Variation</span>
                    <span className="text-lg font-bold text-blue-600">
                      {selectedProduct.interactionRates.centerViewRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Variation → Cart</span>
                    <span className="text-lg font-bold text-green-600">
                      {selectedProduct.interactionRates.variationViewRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Center → Cart</span>
                    <span className="text-lg font-bold text-purple-600">
                      {selectedProduct.interactionRates.addToCartRate}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h5>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedProduct.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {activity.interactionType.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
