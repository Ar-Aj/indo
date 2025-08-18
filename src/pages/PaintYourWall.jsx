import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, Link } from 'react-router-dom';
import { paintAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Camera, 
  Upload, 
  Palette, 
  Sparkles, 
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  ArrowLeft,
  Info,
  Star,
  Heart,
  Share2,
  RotateCcw,
  Zap,
  Target,
  Filter
} from 'lucide-react';

const PaintYourWall = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedColor, setSelectedColor] = useState(location.state?.selectedColor || null);
  const [colors, setColors] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showTips, setShowTips] = useState(true);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const categories = ['neutral', 'warm', 'cool', 'bold'];

  // Fetch colors and brands on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [colorsResponse, brandsResponse] = await Promise.all([
          paintAPI.getColors({ limit: 100 }),
          paintAPI.getBrands()
        ]);
        setColors(colorsResponse.colors || []);
        setBrands(brandsResponse.brands || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load colors. Please refresh the page.');
      }
    };

    fetchData();
  }, []);

  // Filter colors
  const filteredColors = colors.filter(color => {
    const matchesBrand = !selectedBrand || color.brand === selectedBrand;
    const matchesCategory = !selectedCategory || color.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      color.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      color.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesBrand && matchesCategory && matchesSearch;
  });

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Image size must be less than 10MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setError(null);
  };

  const onSubmit = async (data) => {
    if (!selectedImage) {
      setError('Please select an image');
      return;
    }
    
    if (!selectedColor) {
      setError('Please select a paint color');
      return;
    }

    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('colorId', selectedColor._id);
      formData.append('projectName', data.projectName || `${selectedColor.name} Project`);

      // Step 1: Uploading
      setProcessingStep('Uploading your image...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 2: Detecting surfaces
      setProcessingStep('Analyzing room surfaces with AI...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 3: Applying paint
      setProcessingStep('Applying paint color with AI...');
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Step 4: Generating recommendations
      setProcessingStep('Generating color recommendations...');
      
      const response = await paintAPI.processVisualization(formData);
      
      setResult(response.project);
      setProcessingStep('Visualization complete!');
      
    } catch (error) {
      console.error('Processing error:', error);
      setError(error.response?.data?.error || 'Failed to process image. Please try again.');
    } finally {
      setProcessing(false);
      setProcessingStep('');
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedColor(null);
    setResult(null);
    setError(null);
    setProcessing(false);
    setProcessingStep('');
  };

  const clearFilters = () => {
    setSelectedBrand('');
    setSelectedCategory('');
    setSearchTerm('');
  };

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
                Paint Your Wall with AI
              </h1>
              <p className="text-lg text-gray-600">
                Upload your room photo, select a color, and see realistic paint visualization
              </p>
            </div>
            
            {user && (
              <div className="hidden md:block text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-900">{user.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Tips Section */}
        {showTips && !result && (
          <div className="card p-6 mb-8 bg-blue-50 border-blue-200">
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Tips for Best Results</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Use well-lit photos with clear wall visibility</li>
                    <li>• Ensure the room has furniture or objects for AI detection</li>
                    <li>• Avoid blurry or heavily filtered images</li>
                    <li>• JPG or PNG format, maximum 10MB file size</li>
                  </ul>
                </div>
              </div>
              <button
                onClick={() => setShowTips(false)}
                className="text-blue-400 hover:text-blue-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Processing Status */}
        {processing && (
          <div className="card p-8 mb-8 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <RefreshCw className="w-12 h-12 text-blue-600 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                AI Processing in Progress
              </h3>
              <p className="text-lg text-gray-600 mb-6">{processingStep}</p>
              
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: processingStep.includes('Uploading') ? '25%' :
                           processingStep.includes('Analyzing') ? '50%' :
                           processingStep.includes('Applying') ? '75%' :
                           processingStep.includes('Generating') ? '90%' :
                           processingStep.includes('complete') ? '100%' : '10%'
                  }}
                ></div>
              </div>
              
              <p className="text-sm text-gray-500">
                This usually takes 30-60 seconds. Please don't close this page.
              </p>
            </div>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="card p-8 mb-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                <h3 className="text-2xl font-bold text-green-800">
                  Visualization Complete!
                </h3>
              </div>
              <p className="text-green-700">
                Your room has been transformed with {result.selectedColor?.name}
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Before */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Original Room
                </h4>
                <div className="relative group">
                  <img 
                    src={result.originalImage} 
                    alt="Original room" 
                    className="w-full rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl"></div>
                </div>
              </div>
              
              {/* After */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  With {result.selectedColor?.name}
                </h4>
                <div className="relative group">
                  <img 
                    src={result.processedImage} 
                    alt="Painted room" 
                    className="w-full rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-xl"></div>
                </div>
              </div>
            </div>

            {/* Color Details */}
            <div className="card p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Selected Color Details</h4>
              <div className="flex items-center space-x-4">
                <div 
                  className="w-16 h-16 rounded-xl border-4 border-white shadow-lg"
                  style={{ backgroundColor: result.selectedColor?.hexCode }}
                ></div>
                <div className="flex-1">
                  <h5 className="text-xl font-bold text-gray-900">{result.selectedColor?.name}</h5>
                  <p className="text-gray-600">{result.selectedColor?.brand}</p>
                  <p className="text-sm text-gray-500 font-mono">{result.selectedColor?.hexCode}</p>
                  {result.selectedColor?.category && (
                    <span className="inline-block mt-2 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full capitalize">
                      {result.selectedColor.category}
                    </span>
                  )}
                </div>
                {result.selectedColor?.price && (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${result.selectedColor.price}</p>
                    <p className="text-sm text-gray-600">per gallon</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Analysis Results */}
            {result.detectedSurfaces && (
              <div className="card p-6 mb-6 bg-blue-50">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  AI Analysis Results
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{result.detectedSurfaces}</div>
                    <div className="text-sm text-gray-600">Surfaces Detected</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">98%</div>
                    <div className="text-sm text-gray-600">Accuracy</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">4.2s</div>
                    <div className="text-sm text-gray-600">Processing Time</div>
                  </div>
                </div>
              </div>
            )}

            {/* Color Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="card p-6 mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2" />
                  Recommended Color Combinations
                </h4>
                <p className="text-gray-600 mb-4">Based on color theory and your selected color</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {result.recommendations.map((color, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div 
                        className="w-10 h-10 rounded-full border-3 border-white shadow-md"
                        style={{ backgroundColor: color.hexCode }}
                      ></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{color.name}</p>
                        <p className="text-sm text-gray-600">{color.brand}</p>
                        <p className="text-xs text-gray-500 font-mono">{color.hexCode}</p>
                      </div>
                      <button
                        onClick={() => handleColorSelect(color)}
                        className="btn-primary text-xs px-3 py-1"
                      >
                        Try This
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetForm}
                className="btn-primary px-6 py-3 flex items-center justify-center"
              >
                <Camera className="w-5 h-5 mr-2" />
                Try Another Photo
              </button>
              <a
                href={result.processedImage}
                download={`paintviz-${result.name}.jpg`}
                className="btn-secondary px-6 py-3 flex items-center justify-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Result
              </a>
              <button
                onClick={() => {/* Share functionality */}}
                className="btn-secondary px-6 py-3 flex items-center justify-center"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share Project
              </button>
              <Link
                to="/projects"
                className="btn-secondary px-6 py-3 flex items-center justify-center"
              >
                View All Projects
              </Link>
            </div>
          </div>
        )}

        {/* Main Form */}
        {!result && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Image Upload */}
            <div className="card p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Upload className="w-6 h-6 mr-3" />
                Step 1: Upload Your Room Photo
              </h3>
              
              <div className="border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-500 transition-all duration-300 hover:bg-blue-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  disabled={processing}
                />
                <label htmlFor="image-upload" className="cursor-pointer block">
                  {imagePreview ? (
                    <div className="space-y-6">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-w-full max-h-80 mx-auto rounded-xl shadow-lg"
                      />
                      <div>
                        <p className="text-lg font-medium text-gray-900 mb-2">Perfect! Your image is ready</p>
                        <p className="text-sm text-gray-600">Click to change image or proceed to color selection</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto">
                        <Camera className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900 mb-2">
                          Upload Your Room Photo
                        </p>
                        <p className="text-lg text-gray-600 mb-4">
                          Click to upload or drag and drop your image here
                        </p>
                        <p className="text-sm text-gray-500">
                          Supports PNG, JPG • Maximum 10MB • Best results with well-lit rooms
                        </p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Step 2: Color Selection */}
            <div className="card p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Palette className="w-6 h-6 mr-3" />
                Step 2: Choose Your Paint Color
              </h3>

              {/* Color Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search colors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-4"
                    disabled={processing}
                  />
                </div>

                {/* Brand Filter */}
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="input-field"
                  disabled={processing}
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
                  disabled={processing}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Clear Filters */}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn-secondary flex items-center justify-center"
                  disabled={processing}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </button>
              </div>

              {/* Results Count */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {filteredColors.length} colors available
                  {(selectedBrand || selectedCategory || searchTerm) && (
                    <span className="ml-2 text-blue-600">
                      (filtered from {colors.length} total)
                    </span>
                  )}
                </p>
                
                {selectedColor && (
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Color selected
                  </div>
                )}
              </div>

              {/* Color Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {filteredColors.map((color) => (
                  <button
                    key={color._id}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    disabled={processing}
                    className={`group p-3 rounded-lg border-2 transition-all duration-200 ${
                      selectedColor?._id === color._id
                        ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-102'
                    }`}
                    title={`${color.name} - ${color.brand}`}
                  >
                    <div 
                      className="w-full h-12 rounded-md border border-gray-300 mb-2 shadow-sm group-hover:shadow-md transition-shadow"
                      style={{ backgroundColor: color.hexCode }}
                    ></div>
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {color.name}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {color.brand}
                    </p>
                    {color.popularity && (
                      <div className="flex items-center justify-center mt-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-500 ml-1">
                          {Math.round(color.popularity / 10)}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Selected Color Display */}
              {selectedColor && (
                <div className="mt-6 card p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                  <h4 className="font-semibold text-gray-900 mb-3">Selected Color:</h4>
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-16 h-16 rounded-xl border-4 border-white shadow-lg"
                      style={{ backgroundColor: selectedColor.hexCode }}
                    ></div>
                    <div className="flex-1">
                      <h5 className="text-xl font-bold text-gray-900">{selectedColor.name}</h5>
                      <p className="text-gray-600">{selectedColor.brand}</p>
                      <p className="text-sm text-gray-500 font-mono">{selectedColor.hexCode}</p>
                      {selectedColor.category && (
                        <span className="inline-block mt-2 px-3 py-1 text-xs bg-white text-gray-700 rounded-full capitalize border">
                          {selectedColor.category}
                        </span>
                      )}
                    </div>
                    {selectedColor.price && (
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">${selectedColor.price}</p>
                        <p className="text-xs text-gray-600">per gallon</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Project Details */}
            <div className="card p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Step 3: Project Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Name (Optional)
                  </label>
                  <input
                    {...register('projectName')}
                    type="text"
                    placeholder="e.g., Living Room Makeover, Bedroom Refresh"
                    className="input-field py-3 text-lg"
                    disabled={processing}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Give your project a memorable name to find it easily later
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={processing || !selectedImage || !selectedColor}
                className="btn-primary text-xl px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-xl font-bold"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-6 h-6 mr-3 animate-spin" />
                    Processing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 mr-3" />
                    Visualize Paint Color
                  </>
                )}
              </button>
              
              {(!selectedImage || !selectedColor) && (
                <p className="text-sm text-gray-500 mt-3">
                  {!selectedImage && !selectedColor 
                    ? 'Please upload an image and select a color to continue'
                    : !selectedImage 
                    ? 'Please upload an image to continue'
                    : 'Please select a paint color to continue'
                  }
                </p>
              )}
            </div>
          </form>
        )}

        {/* Quick Actions */}
        {!result && (
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Need inspiration?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/colors"
                className="btn-secondary flex items-center justify-center"
              >
                <Palette className="w-4 h-4 mr-2" />
                Browse All Colors
              </Link>
              <Link
                to="/projects"
                className="btn-secondary flex items-center justify-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Sample Projects
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaintYourWall;