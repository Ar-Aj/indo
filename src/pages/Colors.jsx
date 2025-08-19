import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paintAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  Filter, 
  Palette, 
  Camera, 
  Heart,
  Star,
  Grid,
  List,
  ArrowLeft,
  Info,
  TrendingUp,
  Award,
  Eye,
  ShoppingCart,
  Bookmark,
  MoreVertical,
  SortAsc,
  Zap,
  AlertCircle
} from 'lucide-react';

const Colors = () => {
  const { isAuthenticated, user } = useAuth();
  const [colors, setColors] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFinish, setSelectedFinish] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popularity');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const colorsPerPage = 48;

  const categories = ['neutral', 'warm', 'cool', 'bold'];
  const finishes = ['flat', 'eggshell', 'satin', 'semi-gloss', 'gloss'];
  const priceRanges = [
    { label: 'Budget ($30-50)', value: '30-50' },
    { label: 'Mid-range ($51-80)', value: '51-80' },
    { label: 'Premium ($81-120)', value: '81-120' },
  ];

  useEffect(() => {
    fetchColors();
    fetchBrands();
  }, [selectedBrand, selectedCategory, selectedFinish, searchTerm, sortBy, priceRange]);

  const fetchColors = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const params = {
        limit: colorsPerPage * currentPage,
        ...(selectedBrand && { brand: selectedBrand }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm }),
      };
      
      const response = await paintAPI.getColors(params);
      
      // Handle both successful responses and empty responses
      if (response && response.colors) {
        setColors(response.colors);
        setHasMore(response.colors.length === colorsPerPage * currentPage);
      } else {
        // If no colors returned, set empty array
        setColors([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching colors:', error);
      setError('Failed to load colors. Please try again.');
      // Set empty colors array to prevent blank page
      setColors([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await paintAPI.getBrands();
      if (response && response.brands) {
        setBrands(response.brands);
      } else {
        setBrands([]);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      // Set empty brands array to prevent issues
      setBrands([]);
    }
  };

  const loadMoreColors = () => {
    setCurrentPage(prev => prev + 1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedBrand('');
    setSelectedCategory('');
    setSelectedFinish('');
    setPriceRange('');
    setCurrentPage(1);
  };

  const getFilteredColors = () => {
    let filtered = [...colors];

    // Apply price filter
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(color => 
        color.price && color.price >= min && color.price <= max
      );
    }

    // Apply finish filter
    if (selectedFinish) {
      filtered = filtered.filter(color => 
        color.finish && color.finish.toLowerCase() === selectedFinish.toLowerCase()
      );
    }

    // Sort colors
    return filtered.sort((a, b) => {
      if (sortBy === 'popularity') return (b.popularity || 0) - (a.popularity || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'brand') return a.brand.localeCompare(b.brand);
      if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
      return 0;
    });
  };

  const ColorCard = ({ color }) => (
    <div className="card hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group">
      <div className="aspect-square relative">
        <div 
          className="w-full h-full transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: color.hexCode }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="absolute bottom-3 left-3 right-3">
              {isAuthenticated ? (
                <Link
                  to="/paint-your-wall"
                  state={{ selectedColor: color }}
                  className="btn-primary text-sm w-full py-2 bg-white text-gray-900 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex items-center justify-center"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Try This Color
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="btn-primary text-sm w-full py-2 bg-white text-gray-900 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex items-center justify-center"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Sign in to Try
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Popularity Badge */}
        {color.popularity && color.popularity > 85 && (
          <div className="absolute top-3 left-3">
            <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              Popular
            </span>
          </div>
        )}

        {/* Price Badge */}
        {color.price && (
          <div className="absolute top-3 right-3">
            <span className="bg-white bg-opacity-90 text-gray-900 text-xs px-2 py-1 rounded-full font-semibold">
              ${color.price}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
            {color.name}
          </h3>
          <p className="text-sm text-gray-600 font-medium">{color.brand}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {color.hexCode}
          </span>
          {color.popularity && (
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1 font-medium">
                {Math.round(color.popularity / 10)}/10
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          {color.category && (
            <span className="inline-block px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full capitalize font-medium">
              {color.category}
            </span>
          )}
          {color.finish && (
            <span className="text-xs text-gray-500 capitalize">
              {color.finish} finish
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2 pt-2">
          <button className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center">
            <Heart className="w-3 h-3 mr-1" />
            Save
          </button>
          <button className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center">
            <Share2 className="w-3 h-3 mr-1" />
            Share
          </button>
        </div>
      </div>
    </div>
  );

  const ColorListItem = ({ color }) => (
    <div className="card p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center space-x-6">
        <div className="flex-shrink-0 relative group">
          <div 
            className="w-20 h-20 rounded-xl border-4 border-white shadow-lg group-hover:shadow-xl transition-all duration-300"
            style={{ backgroundColor: color.hexCode }}
          ></div>
          {color.popularity && color.popularity > 85 && (
            <div className="absolute -top-2 -right-2">
              <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold flex items-center">
                <Award className="w-3 h-3" />
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-gray-900 text-xl mb-1">
                {color.name}
              </h3>
              <p className="text-gray-600 font-medium">{color.brand}</p>
            </div>
            
            {color.price && (
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">${color.price}</p>
                <p className="text-sm text-gray-500">per gallon</p>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4 mb-3">
            <span className="text-sm font-mono text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
              {color.hexCode}
            </span>
            {color.category && (
              <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full capitalize font-medium">
                {color.category}
              </span>
            )}
            {color.finish && (
              <span className="text-sm text-gray-500 capitalize">
                {color.finish} finish
              </span>
            )}
            {color.popularity && (
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600 ml-1 font-medium">
                  {Math.round(color.popularity / 10)}/10
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <Link
                to="/paint-your-wall"
                state={{ selectedColor: color }}
                className="btn-primary px-4 py-2 flex items-center"
              >
                <Camera className="w-4 h-4 mr-2" />
                Visualize This Color
              </Link>
            ) : (
              <Link
                to="/login"
                className="btn-primary px-4 py-2 flex items-center"
              >
                <Zap className="w-4 h-4 mr-2" />
                Sign in to Try
              </Link>
            )}
            <button className="btn-secondary px-4 py-2 flex items-center">
              <Heart className="w-4 h-4 mr-2" />
              Save
            </button>
            <button className="btn-secondary px-4 py-2 flex items-center">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to="/"
                className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200 mb-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Explore Paint Colors
              </h1>
              <p className="text-lg text-gray-600">
                Browse our collection of 2500+ professional paint colors from top brands
              </p>
            </div>
            
            {isAuthenticated && (
              <div className="text-right">
                <Link
                  to="/paint-your-wall"
                  className="btn-primary text-lg px-6 py-3 flex items-center"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Visualize Colors
                </Link>
                <p className="text-sm text-gray-600 mt-2">
                  Ready to see them on your walls?
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Featured Brands */}
        <div className="card p-6 mb-8 bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Award className="w-6 h-6 mr-3" />
            Featured Brands
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {brands.slice(0, 4).map((brand) => (
              <button
                key={brand}
                onClick={() => setSelectedBrand(selectedBrand === brand ? '' : brand)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                  selectedBrand === brand
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-blue-300 text-gray-700 hover:bg-white'
                }`}
              >
                <p className="font-semibold">{brand}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {colors.filter(c => c.brand === brand).length} colors
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filter & Sort Colors
            </h3>
            <button
              onClick={resetFilters}
              className="btn-secondary text-sm px-4 py-2"
            >
              Clear All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search colors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12"
              />
            </div>

            {/* Brand Filter */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="input-field"
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            {/* Finish Filter */}
            <select
              value={selectedFinish}
              onChange={(e) => setSelectedFinish(e.target.value)}
              className="input-field"
            >
              <option value="">All Finishes</option>
              {finishes.map((finish) => (
                <option key={finish} value={finish}>
                  {finish.charAt(0).toUpperCase() + finish.slice(1)}
                </option>
              ))}
            </select>

            {/* Price Range */}
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="input-field"
            >
              <option value="">All Prices</option>
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <SortAsc className="w-5 h-5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field py-2"
                >
                  <option value="popularity">Most Popular</option>
                  <option value="name">Name A-Z</option>
                  <option value="brand">Brand A-Z</option>
                  <option value="price">Price Low to High</option>
                </select>
              </div>
              
              <span className="text-sm text-gray-600 font-medium">
                {getFilteredColors().length} colors found
              </span>
            </div>

            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="card p-12 text-center">
            <div className="text-red-500 mb-4">
              <AlertCircle className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to load colors
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => {
                setError(null);
                fetchColors();
              }}
              className="btn-primary px-6 py-3"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && colors.length === 0 && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Loading paint colors...
            </h3>
            <p className="text-gray-600">Fetching the latest collection from our database</p>
          </div>
        )}

        {/* Colors Display */}
        {!loading && !error && (
          <>
            {getFilteredColors().length > 0 ? (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mb-8">
                    {getFilteredColors().map((color) => (
                      <ColorCard key={color._id} color={color} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 mb-8">
                    {getFilteredColors().map((color) => (
                      <ColorListItem key={color._id} color={color} />
                    ))}
                  </div>
                )}

                {/* Load More */}
                {hasMore && (
                  <div className="text-center">
                    <button
                      onClick={loadMoreColors}
                      className="btn-secondary px-8 py-3"
                      disabled={loading}
                    >
                      {loading ? 'Loading...' : 'Load More Colors'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* No Results */
              <div className="text-center py-16">
                <Palette className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  No colors found
                </h3>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                  No colors match your current filters. Try adjusting your search criteria.
                </p>
                <button
                  onClick={resetFilters}
                  className="btn-primary px-6 py-3"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </>
        )}

        {/* CTA for unauthenticated users */}
        {!isAuthenticated && colors.length > 0 && (
          <div className="card p-8 text-center mt-12 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Visualize These Colors?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Sign up for free to use our AI paint visualization tool and see how these colors look in your actual room!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-lg px-8 py-3 flex items-center justify-center">
                <Camera className="w-5 h-5 mr-2" />
                Get Started Free
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-3">
                Sign In
              </Link>
            </div>
            
            {/* Features */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="flex items-center justify-center text-gray-600">
                <Camera className="w-4 h-4 mr-2" />
                AI Paint Visualization
              </div>
              <div className="flex items-center justify-center text-gray-600">
                <Heart className="w-4 h-4 mr-2" />
                Save Favorite Colors
              </div>
              <div className="flex items-center justify-center text-gray-600">
                <FolderOpen className="w-4 h-4 mr-2" />
                Project Management
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Colors;