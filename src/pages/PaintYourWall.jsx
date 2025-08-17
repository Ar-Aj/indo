import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { paintAPI } from '../services/api';
import { 
  Camera, 
  Upload, 
  Palette, 
  Sparkles, 
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye
} from 'lucide-react';

const PaintYourWall = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [colors, setColors] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Fetch colors and brands on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [colorsResponse, brandsResponse] = await Promise.all([
          paintAPI.getColors({ limit: 50 }),
          paintAPI.getBrands()
        ]);
        setColors(colorsResponse.colors);
        setBrands(brandsResponse.brands);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load colors. Please refresh the page.');
      }
    };

    fetchData();
  }, []);

  // Filter colors by brand
  const filteredColors = selectedBrand 
    ? colors.filter(color => color.brand === selectedBrand)
    : colors;

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Image size must be less than 10MB');
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
      formData.append('projectName', data.projectName || `Project ${Date.now()}`);

      // Step 1: Uploading
      setProcessingStep('Uploading image...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Detecting surfaces
      setProcessingStep('Detecting surfaces with AI...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Applying paint
      setProcessingStep('Applying paint color...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 4: Generating recommendations
      setProcessingStep('Generating color recommendations...');
      
      const response = await paintAPI.processVisualization(formData);
      
      setResult(response.project);
      setProcessingStep('Complete!');
      
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Paint Your Wall with AI
        </h1>
        <p className="text-lg text-gray-600">
          Upload your room photo, select a color, and see realistic paint visualization
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Processing Status */}
      {processing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mr-3" />
            <p className="text-blue-800 font-medium">{processingStep}</p>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: processingStep.includes('Uploading') ? '25%' :
                       processingStep.includes('Detecting') ? '50%' :
                       processingStep.includes('Applying') ? '75%' :
                       processingStep.includes('Generating') ? '90%' :
                       processingStep.includes('Complete') ? '100%' : '10%'
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-green-800">
              Visualization Complete!
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original vs Processed */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Original</h4>
              <img 
                src={result.originalImage} 
                alt="Original room" 
                className="w-full rounded-lg shadow-md"
              />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">With {result.selectedColor?.name}</h4>
              <img 
                src={result.processedImage} 
                alt="Painted room" 
                className="w-full rounded-lg shadow-md"
              />
            </div>
          </div>

          {/* Color Info */}
          <div className="mt-6 p-4 bg-white rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Selected Color</h4>
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: result.selectedColor?.hexCode }}
              ></div>
              <div>
                <p className="font-medium">{result.selectedColor?.name}</p>
                <p className="text-sm text-gray-600">{result.selectedColor?.brand}</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {result.recommendations && result.recommendations.length > 0 && (
            <div className="mt-6 p-4 bg-white rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Recommended Colors</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {result.recommendations.map((color, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: color.hexCode }}
                    ></div>
                    <div>
                      <p className="text-sm font-medium">{color.name}</p>
                      <p className="text-xs text-gray-600">{color.brand}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={resetForm}
              className="btn-primary flex items-center justify-center"
            >
              <Camera className="w-4 h-4 mr-2" />
              Try Another Photo
            </button>
            <a
              href={result.processedImage}
              download={`paintviz-${result.name}.jpg`}
              className="btn-secondary flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Result
            </a>
          </div>
        </div>
      )}

      {/* Main Form */}
      {!result && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Image Upload */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Step 1: Upload Your Room Photo
            </h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
                disabled={processing}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                    />
                    <p className="text-sm text-gray-600">Click to change image</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-600">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Color Selection */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Step 2: Choose Your Paint Color
            </h3>

            {/* Brand Filter */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Brand
              </label>
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
            </div>

            {/* Color Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto">
              {filteredColors.map((color) => (
                <button
                  key={color._id}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  disabled={processing}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedColor?._id === color._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div 
                    className="w-full h-12 rounded-md border border-gray-300 mb-2"
                    style={{ backgroundColor: color.hexCode }}
                  ></div>
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {color.name}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {color.brand}
                  </p>
                </button>
              ))}
            </div>

            {selectedColor && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Selected Color:</p>
                <div className="flex items-center space-x-3 mt-2">
                  <div 
                    className="w-8 h-8 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: selectedColor.hexCode }}
                  ></div>
                  <div>
                    <p className="font-medium">{selectedColor.name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedColor.brand} • {selectedColor.hexCode}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Project Name */}
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Step 3: Name Your Project (Optional)
            </h3>
            <input
              {...register('projectName')}
              type="text"
              placeholder="e.g., Living Room Makeover"
              className="input-field"
              disabled={processing}
            />
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={processing || !selectedImage || !selectedColor}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {processing ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Visualize Paint Color
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PaintYourWall;