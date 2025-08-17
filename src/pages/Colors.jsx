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
  List
} from 'lucide-react';

const Colors = () => {
  const { isAuthenticated } = useAuth();
  const [colors, setColors] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popularity');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const colorsPerPage = 24;

  const categories = ['neutral', 'warm', 'cool', 'bold'];

  useEffect(() => {
    fetchColors();
    fetchBrands();
  }, [selectedBrand, selectedCategory, searchTerm, sortBy]);

  const fetchColors = async () => {
    try {
      setLoading(true);
      const params = {
        limit: colorsPerPage * currentPage,
        ...(selectedBrand && { brand: selectedBrand }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm }),
      };
      
      const response = await paintAPI.getColors(params);
      setColors(response.colors);
      setHasMore(response.colors.length === colorsPerPage * currentPage);
    } catch (error) {
      console.error('Error fetching colors:', error);
      setError('Failed to load colors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await paintAPI.getBrands();
      setBrands(response.brands);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const loadMoreColors = () => {
    setCurrentPage(prev => prev + 1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedBrand('');
    setSelectedCategory('');
    setCurrentPage(1);
  };

  const getColorsByPopularity = () => {
    return [...colors].sort((a, b) => {
      if (sortBy === 'popularity') return (b.popularity || 0) - (a.popularity || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'brand') return a.brand.localeCompare(b.brand);
      return 0;
    });
  };

  const ColorCard = ({ color }) => (
    <div className="card p-4 hover:shadow-lg transition-shadow">
      <div className="aspect-square mb-3 relative group">
        <div 
          className="w-full h-full rounded-lg border border-gray-200"
          style={{ backgroundColor: color.hexCode }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
            {isAuthenticated && (
              <Link
                to="/paint-your-wall"
                state={{ selectedColor: color }}
                className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center"
              >
                <Camera className="w-4 h-4 mr-2" />
                Try This Color
              </Link>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">
          {color.name}
        </h3>
        <p className="text-xs text-gray-600">{color.brand}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-gray-500">
            {color.hexCode}
          </span>
          {color.popularity && (
            <div className="flex items-center">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600 ml-1">
                {Math.round(color.popularity / 10)}
              </span>
            </div>
          )}
        </div>
        {color.category && (
          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full capitalize">
            {color.category}
          </span>
        )}
      </div>
    </div>
  );

  const ColorListItem = ({ color }) => (
    <div className="card p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center space-x-4">
        <div 
          className="w-16 h-16 rounded-lg border border-gray-200 flex-shrink-0"
          style={{ backgroundColor: color.hexCode }}
        ></div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {color.name}
          </h3>
          <p className="text-sm text-gray-600">{color.brand}</p>
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-sm font-mono text-gray-500">
              {color.hexCode}
            </span>
            {color.category && (
              <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full capitalize">
                {color.category}
              </span>
            )}
            {color.popularity && (
              <div className="flex items-center">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600 ml-1">
                  {Math.round(color.popularity / 10)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {isAuthenticated && (
          <Link
            to="/paint-your-wall"
            state={{ selectedColor: color }}
            className="btn-primary flex items-center"
          >
            <Camera className="w-4 h-4 mr-2" />
            Try Color
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Explore Paint Colors
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Browse our collection of professional paint colors from top brands
        </p>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search colors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
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

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
          >
            <option value="popularity">Most Popular</option>
            <option value="name">Name A-Z</option>
            <option value="brand">Brand A-Z</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={resetFilters}
              className="btn-secondary text-sm"
            >
              Clear Filters
            </button>
            <span className="text-sm text-gray-600">
              {colors.length} colors found
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchColors();
            }}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && colors.length === 0 && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading colors...</p>
        </div>
      )}

      {/* Colors Grid/List */}
      {!loading && colors.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              {getColorsByPopularity().map((color) => (
                <ColorCard key={color._id} color={color} />
              ))}
            </div>
          ) : (
            <div className="space-y-4 mb-8">
              {getColorsByPopularity().map((color) => (
                <ColorListItem key={color._id} color={color} />
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <div className="text-center">
              <button
                onClick={loadMoreColors}
                className="btn-secondary"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More Colors'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && colors.length === 0 && !error && (
        <div className="text-center py-12">
          <Palette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No colors found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters to see more colors
          </p>
          <button
            onClick={resetFilters}
            className="btn-primary"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* CTA for unauthenticated users */}
      {!isAuthenticated && colors.length > 0 && (
        <div className="card p-8 text-center mt-12 bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Visualize These Colors?
          </h3>
          <p className="text-gray-600 mb-6">
            Sign up for free to use our AI paint visualization tool
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary">
              Get Started Free
            </Link>
            <Link to="/login" className="btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Colors;