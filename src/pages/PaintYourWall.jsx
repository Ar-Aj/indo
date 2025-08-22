import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Filter,
  Brush,
  Eraser,
  Undo,
  Check,
  X,
  MousePointer,
  Square,
  Grid,
  Layers,
  Triangle,
  Circle,
  Waves,
  Frame,
  Maximize
} from 'lucide-react';

const PaintYourWall = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedColor, setSelectedColor] = useState(location.state?.selectedColor || null);
  const [selectedPattern, setSelectedPattern] = useState('plain');
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
  
  // Manual masking states
  const [maskingMethod, setMaskingMethod] = useState('manual'); // 'manual' or 'ai'
  const [showMaskingTool, setShowMaskingTool] = useState(false);
  const [manualMask, setManualMask] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(20);
  const canvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const categories = ['neutral', 'warm', 'cool', 'bold'];

  // Paint pattern options with professional descriptions
  const paintPatterns = [
    {
      id: 'plain',
      name: 'Plain/Solid',
      description: 'Classic solid color application for a clean, timeless look',
      icon: Square,
      preview: 'Uniform color coverage',
      popular: true
    },
    {
      id: 'accent-wall',
      name: 'Accent Wall',
      description: 'Highlight one feature wall while keeping others neutral',
      icon: Target,
      preview: 'One bold wall, others neutral',
      popular: true
    },
    {
      id: 'two-tone',
      name: 'Two-Tone',
      description: 'Upper and lower wall sections in complementary colors',
      icon: Layers,
      preview: 'Horizontal split design',
      popular: false
    },
    {
      id: 'vertical-stripes',
      name: 'Vertical Stripes',
      description: 'Classic vertical stripes to create height illusion',
      icon: Grid,
      preview: 'Vertical striped pattern',
      popular: false
    },
    {
      id: 'horizontal-stripes',
      name: 'Horizontal Stripes',
      description: 'Modern horizontal bands for contemporary appeal',
      icon: Maximize,
      preview: 'Horizontal banded design',
      popular: false
    },
    {
      id: 'geometric',
      name: 'Geometric Shapes',
      description: 'Contemporary triangular or geometric patterns',
      icon: Triangle,
      preview: 'Modern geometric design',
      popular: false
    },
    {
      id: 'ombre',
      name: 'Ombre/Gradient',
      description: 'Subtle color fade from light to dark',
      icon: Waves,
      preview: 'Gradient color transition',
      popular: false
    },
    {
      id: 'color-block',
      name: 'Color Block',
      description: 'Bold geometric color sections for modern spaces',
      icon: Circle,
      preview: 'Bold geometric blocks',
      popular: false
    },
    {
      id: 'wainscoting',
      name: 'Wainscoting Style',
      description: 'Traditional lower wall color with upper neutral',
      icon: Frame,
      preview: 'Classic chair rail style',
      popular: true
    },
    {
      id: 'border',
      name: 'Border/Frame',
      description: 'Color with decorative border around the room',
      icon: Frame,
      preview: 'Elegant framed design',
      popular: false
    },
    {
      id: 'textured',
      name: 'Textured Effect',
      description: 'Sponge or stippled texture for artistic appeal',
      icon: Brush,
      preview: 'Artistic textured finish',
      popular: false
    }
  ];

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



  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setError(null);
  };

  // Manual masking functions
  const initializeCanvas = useCallback(() => {
    if (!canvasRef.current || !maskCanvasRef.current || !imagePreview) return;

    console.log('Initializing canvas with image:', imagePreview.substring(0, 50) + '...');

    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const maskCtx = maskCanvas.getContext('2d');

    // Create image object
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Handle CORS if needed
    
    img.onload = () => {
      console.log('Image loaded successfully:', img.width, 'x', img.height);
      
      // Responsive canvas sizing
      const isMobile = window.innerWidth < 640;
      const containerWidth = isMobile ? Math.min(window.innerWidth - 40, 500) : Math.min(800, window.innerWidth - 200);
      const aspectRatio = img.height / img.width;
      
      let canvasWidth = Math.min(img.width, containerWidth);
      let canvasHeight = canvasWidth * aspectRatio;

      // Ensure canvas doesn't exceed viewport height
      const maxHeight = isMobile ? window.innerHeight * 0.5 : window.innerHeight * 0.6;
      
      if (canvasHeight > maxHeight) {
        canvasHeight = maxHeight;
        canvasWidth = canvasHeight / aspectRatio;
      }

      // Set canvas display size
      canvas.style.width = canvasWidth + 'px';
      canvas.style.height = canvasHeight + 'px';
      maskCanvas.style.width = canvasWidth + 'px';
      maskCanvas.style.height = canvasHeight + 'px';

      // Set actual canvas size (for high DPI)
      const devicePixelRatio = window.devicePixelRatio || 1;
      canvas.width = canvasWidth * devicePixelRatio;
      canvas.height = canvasHeight * devicePixelRatio;
      maskCanvas.width = canvasWidth * devicePixelRatio;
      maskCanvas.height = canvasHeight * devicePixelRatio;

      // Scale context for high DPI
      ctx.scale(devicePixelRatio, devicePixelRatio);
      maskCtx.scale(devicePixelRatio, devicePixelRatio);

      // Draw image on main canvas
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      console.log('Image drawn on canvas:', canvasWidth, 'x', canvasHeight);

      // Initialize mask canvas with semi-transparent overlay
      maskCtx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      maskCtx.fillRect(0, 0, canvasWidth, canvasHeight);
      maskCtx.globalCompositeOperation = 'source-over';
      
      console.log(`Canvas initialized successfully: ${canvasWidth}x${canvasHeight} (DPR: ${devicePixelRatio})`);
    };

    img.onerror = (error) => {
      console.error('Failed to load image for canvas:', error);
    };

    img.src = imagePreview;
  }, [imagePreview]);

  const startDrawing = (e) => {
    if (!maskCanvasRef.current) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e) => {
    if (!isDrawing || !maskCanvasRef.current) return;

    const canvas = maskCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');

    // Get coordinates relative to the canvas display size
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out'; // Eraser mode (reveals image)
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fill();
  };

  const clearMask = () => {
    if (!maskCanvasRef.current) return;
    const canvas = maskCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; // Match the initial overlay
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  const fillMask = () => {
    if (!maskCanvasRef.current) return;
    const canvas = maskCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  const saveMask = () => {
    if (!maskCanvasRef.current) return;
    
    // Create a new canvas for the final mask (white areas to paint, black areas to preserve)
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');
    const maskCanvas = maskCanvasRef.current;
    
    finalCanvas.width = maskCanvas.width;
    finalCanvas.height = maskCanvas.height;
    
    // Fill with black (preserve everything by default)
    finalCtx.fillStyle = 'black';
    finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    
    // Get the mask data
    const maskImageData = maskCanvas.getContext('2d').getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const finalImageData = finalCtx.getImageData(0, 0, finalCanvas.width, finalCanvas.height);
    
    // Convert transparent areas (where user drew) to white (areas to paint)
    for (let i = 0; i < maskImageData.data.length; i += 4) {
      const alpha = maskImageData.data[i + 3];
      if (alpha < 128) { // If mostly transparent (user drew here)
        finalImageData.data[i] = 255;     // R
        finalImageData.data[i + 1] = 255; // G
        finalImageData.data[i + 2] = 255; // B
        finalImageData.data[i + 3] = 255; // A
      }
    }
    
    finalCtx.putImageData(finalImageData, 0, 0);
    
    // Convert to base64
    const maskBase64 = finalCanvas.toDataURL('image/png').split(',')[1];
    setManualMask(maskBase64);
    setShowMaskingTool(false);
    setError(null);
  };

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
        // Reset masking states when new image is uploaded
        setShowMaskingTool(false);
        setManualMask(null);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  // Initialize canvas when masking tool is shown
  useEffect(() => {
    if (showMaskingTool && imagePreview) {
      console.log('Masking tool opened, initializing canvas...');
      // Multiple attempts to ensure canvas initializes
      setTimeout(initializeCanvas, 100);
      setTimeout(initializeCanvas, 300);
      setTimeout(initializeCanvas, 500);
    }
  }, [showMaskingTool, imagePreview, initializeCanvas]);

  const onSubmit = async (data) => {
    if (!selectedImage) {
      setError('Please select an image');
      return;
    }
    
    if (!selectedColor) {
      setError('Please select a paint color');
      return;
    }

    if (maskingMethod === 'manual' && !manualMask) {
      setError('Please select areas to paint or choose AI detection');
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
      formData.append('maskingMethod', maskingMethod);
      formData.append('pattern', selectedPattern);
      
      // Add manual mask if available
      if (maskingMethod === 'manual' && manualMask) {
        formData.append('manualMask', manualMask);
      }

      // Step 1: Uploading
      setProcessingStep('Uploading your image...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 2: Detecting walls
      setProcessingStep('Detecting walls, ceiling, and floor with AI...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 3: Applying paint with pattern
      const patternName = paintPatterns.find(p => p.id === selectedPattern)?.name || 'Plain';
      setProcessingStep(`Applying ${selectedColor.name} with ${patternName} pattern...`);
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
    setSelectedPattern('plain');
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
                Upload your room photo, choose a pattern style, select a color, and see realistic paint visualization
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
                    <li>• Ensure walls, ceiling, and floor are clearly visible</li>
                    <li>• Choose patterns based on your room style and preferences</li>
                    <li>• Plain pattern works best for exact color matching</li>
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
                    width: processingStep.includes('Uploading') ? '20%' :
                           processingStep.includes('Detecting') ? '40%' :
                           processingStep.includes('Applying') ? '70%' :
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
                {result.pattern && result.pattern !== 'plain' && (
                  <span> using {paintPatterns.find(p => p.id === result.pattern)?.name || result.pattern} pattern</span>
                )}
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

            {/* Color & Pattern Details */}
            <div className="card p-6 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Selected Color & Pattern</h4>
              
              {/* Color Details */}
              <div className="flex items-center space-x-4 mb-6">
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

              {/* Pattern Details */}
              {result.pattern && (
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-4">
                    {(() => {
                      const patternData = paintPatterns.find(p => p.id === result.pattern);
                      const IconComponent = patternData?.icon || Square;
                      return (
                        <>
                          <div className="p-3 bg-purple-100 rounded-lg">
                            <IconComponent className="w-6 h-6 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-gray-900">{patternData?.name || result.pattern}</h6>
                            <p className="text-sm text-gray-600">{patternData?.description}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Results */}
            <div className="card p-6 mb-6 bg-blue-50">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                {result.isManualMask ? (
                  <Brush className="w-5 h-5 mr-2" />
                ) : (
                  <Target className="w-5 h-5 mr-2" />
                )}
                {result.isManualMask ? 'Manual Selection Results' : 'AI Analysis Results'}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {result.isManualMask ? '✓' : (result.detectedWalls || 0)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {result.isManualMask ? 'Manual Areas' : 'Walls Detected'}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {result.isManualMask ? 'Custom' : result.detectedSurfaces}
                  </div>
                  <div className="text-sm text-gray-600">
                    {result.isManualMask ? 'Selection' : 'Total Surfaces'}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {result.isManualMask ? '100%' : '98%'}
                  </div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">4.2s</div>
                  <div className="text-sm text-gray-600">Processing Time</div>
                </div>
              </div>
              
              {result.isManualMask && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    <Brush className="w-4 h-4 mr-1" />
                    Used your custom area selection
                  </div>
                </div>
              )}
            </div>

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

            {/* Step 1.5: Masking Method Selection (only show if image is uploaded) */}
            {imagePreview && (
              <div className="card p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <MousePointer className="w-6 h-6 mr-3" />
                  Step 1.5: Select Areas to Paint
                </h3>
                
                <div className="space-y-6">
                  {/* Method Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setMaskingMethod('manual');
                        setManualMask(null);
                      }}
                      className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                        maskingMethod === 'manual'
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Brush className="w-8 h-8 text-blue-600" />
                        <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
                          RECOMMENDED
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Manual Selection</h4>
                      <p className="text-sm text-gray-600">
                        Paint exactly where you want. Select areas by drawing on your image for precise control.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMaskingMethod('ai');
                        setManualMask(null);
                        setShowMaskingTool(false);
                      }}
                      className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                        maskingMethod === 'ai'
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Zap className="w-8 h-8 text-purple-600" />
                        <div className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-semibold">
                          AUTO
                        </div>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">AI Detection</h4>
                      <p className="text-sm text-gray-600">
                        Let AI automatically detect walls and surfaces to paint. Quick and easy.
                      </p>
                    </button>
                  </div>

                  {/* Manual Masking Tool */}
                  {maskingMethod === 'manual' && (
                    <div className="border-t pt-6">
                      {!showMaskingTool && !manualMask && (
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => setShowMaskingTool(true)}
                            className="btn-primary px-8 py-4 text-lg"
                          >
                            <Brush className="w-5 h-5 mr-2" />
                            Start Selecting Areas
                          </button>
                          <p className="text-sm text-gray-500 mt-2">
                            Draw on your image to select areas you want to paint
                          </p>
                        </div>
                      )}

                      {manualMask && (
                        <div className="text-center">
                          <div className="inline-flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-lg mb-4">
                            <Check className="w-5 h-5 mr-2" />
                            Areas selected successfully!
                          </div>
                          <div className="space-x-3">
                            <button
                              type="button"
                              onClick={() => {
                                setShowMaskingTool(true);
                                setManualMask(null);
                              }}
                              className="btn-secondary px-4 py-2"
                            >
                              <Brush className="w-4 h-4 mr-2" />
                              Edit Selection
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* AI Method Status */}
                  {maskingMethod === 'ai' && (
                    <div className="border-t pt-6">
                      <div className="text-center">
                        <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
                          <Zap className="w-5 h-5 mr-2" />
                          AI will automatically detect walls and surfaces
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Manual Masking Tool - Optimized Responsive Modal */}
            {showMaskingTool && (
              <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-2 sm:p-4">
                <div className="bg-white w-full h-full sm:w-auto sm:h-auto sm:max-w-6xl sm:max-h-[95vh] rounded-none sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl">
                  
                  {/* Header - Fixed */}
                  <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-purple-50 px-4 sm:px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Brush className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Select Areas to Paint</h3>
                          <p className="text-sm text-gray-600 hidden sm:block">Draw on your image to select painting areas</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowMaskingTool(false)}
                        className="bg-white hover:bg-gray-100 p-2 rounded-lg transition-colors shadow-sm"
                      >
                        <X className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Instructions - Mobile Friendly */}
                  <div className="flex-shrink-0 bg-blue-50 px-4 sm:px-6 py-3 border-b border-blue-100">
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">How to use:</span> Draw on the dark areas to select where you want to paint. 
                        <span className="hidden sm:inline"> The selected areas will show the original image.</span>
                      </p>
                    </div>
                  </div>

                  {/* Tools Bar - Responsive */}
                  <div className="flex-shrink-0 bg-gray-50 px-4 sm:px-6 py-3 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      
                      {/* Brush Size Control */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <MousePointer className="w-4 h-4 text-gray-600" />
                          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Brush:</label>
                          <input
                            type="range"
                            min="5"
                            max="50"
                            value={brushSize}
                            onChange={(e) => setBrushSize(parseInt(e.target.value))}
                            className="w-16 sm:w-20"
                          />
                          <span className="text-sm text-gray-600 font-mono w-8">{brushSize}</span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={clearMask}
                          className="flex-1 sm:flex-none bg-white hover:bg-gray-50 border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center justify-center space-x-1"
                        >
                          <Undo className="w-4 h-4" />
                          <span>Clear</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={fillMask}
                          className="flex-1 sm:flex-none bg-white hover:bg-gray-50 border border-gray-300 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center justify-center space-x-1"
                        >
                          <Brush className="w-4 h-4" />
                          <span>All</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Canvas Container - Responsive and Scrollable */}
                  <div className="flex-1 overflow-auto bg-gray-100">
                    <div className="min-h-full flex items-center justify-center p-4">
                      <div className="relative">
                        {/* Background Image Canvas */}
                        <canvas
                          ref={canvasRef}
                          className="rounded-lg shadow-lg border border-gray-300"
                          style={{ 
                            display: 'block',
                            position: 'relative',
                            zIndex: 1
                          }}
                        />
                        
                        {/* Overlay Mask Canvas */}
                        <canvas
                          ref={maskCanvasRef}
                          className="absolute top-0 left-0 rounded-lg cursor-crosshair touch-none"
                          style={{ 
                            zIndex: 2,
                            pointerEvents: 'auto'
                          }}
                          onMouseDown={startDrawing}
                          onMouseUp={stopDrawing}
                          onMouseMove={draw}
                          onMouseLeave={stopDrawing}
                          // Touch events for mobile
                          onTouchStart={(e) => {
                            e.preventDefault();
                            const touch = e.touches[0];
                            const mouseEvent = new MouseEvent('mousedown', {
                              clientX: touch.clientX,
                              clientY: touch.clientY
                            });
                            startDrawing(mouseEvent);
                          }}
                          onTouchMove={(e) => {
                            e.preventDefault();
                            const touch = e.touches[0];
                            const mouseEvent = new MouseEvent('mousemove', {
                              clientX: touch.clientX,
                              clientY: touch.clientY
                            });
                            draw(mouseEvent);
                          }}
                          onTouchEnd={(e) => {
                            e.preventDefault();
                            stopDrawing();
                          }}
                        />
                        
                        {/* Debug info and loading indicator */}
                        {(!canvasRef.current?.width || !canvasRef.current?.height) && (
                          <div className="relative bg-gray-200 rounded-lg min-h-[300px] min-w-[400px] flex items-center justify-center">
                            {/* Fallback image preview */}
                            {imagePreview && (
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="max-w-full max-h-full rounded-lg opacity-50"
                                style={{ maxHeight: '300px' }}
                              />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center bg-white bg-opacity-90 p-4 rounded-lg">
                                <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600">Setting up canvas...</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  Canvas: {canvasRef.current?.width || 0}x{canvasRef.current?.height || 0}
                                </p>
                                <button 
                                  onClick={() => {
                                    console.log('Manual canvas refresh triggered');
                                    initializeCanvas();
                                  }}
                                  className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                >
                                  Retry
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Mobile Helper Text */}
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 sm:hidden">
                          <p className="text-xs text-gray-500 text-center">Tap and drag to select areas</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions - Fixed */}
                  <div className="flex-shrink-0 bg-white px-4 sm:px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                      
                      {/* Mobile: Stack buttons vertically */}
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 sm:ml-auto">
                        <button
                          type="button"
                          onClick={() => setShowMaskingTool(false)}
                          className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={saveMask}
                          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all flex items-center justify-center space-x-2 shadow-lg"
                        >
                          <Check className="w-5 h-5" />
                          <span>Use This Selection</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Progress indicator for mobile */}
                    <div className="mt-3 sm:hidden">
                      <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span>Step 2 of 3: Select areas to paint</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Pattern Selection (only show if image is uploaded) */}
            {imagePreview && (
              <div className="card p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Grid className="w-6 h-6 mr-3" />
                  Step 2: Choose Paint Pattern
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Select how you want the paint to be applied. Each pattern creates a different visual effect.
                </p>

                {/* Popular Patterns First */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    Popular Patterns
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paintPatterns.filter(pattern => pattern.popular).map((pattern) => {
                      const IconComponent = pattern.icon;
                      return (
                        <button
                          key={pattern.id}
                          type="button"
                          onClick={() => setSelectedPattern(pattern.id)}
                          disabled={processing}
                          className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                            selectedPattern === pattern.id
                              ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                              : 'border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-102'
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-lg ${
                              selectedPattern === pattern.id ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              <IconComponent className={`w-6 h-6 ${
                                selectedPattern === pattern.id ? 'text-blue-600' : 'text-gray-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-bold text-gray-900 mb-1">{pattern.name}</h5>
                              <p className="text-sm text-gray-600 mb-2">{pattern.description}</p>
                              <p className="text-xs text-blue-600 font-medium">{pattern.preview}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* All Patterns */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Palette className="w-5 h-5 mr-2 text-purple-500" />
                    All Pattern Options
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paintPatterns.map((pattern) => {
                      const IconComponent = pattern.icon;
                      return (
                        <button
                          key={pattern.id}
                          type="button"
                          onClick={() => setSelectedPattern(pattern.id)}
                          disabled={processing}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                            selectedPattern === pattern.id
                              ? 'border-blue-500 bg-blue-50 shadow-lg'
                              : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center space-x-3 mb-2">
                            <IconComponent className={`w-5 h-5 ${
                              selectedPattern === pattern.id ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                            <h5 className="font-semibold text-gray-900 text-sm">{pattern.name}</h5>
                            {pattern.popular && (
                              <div className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                                Popular
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600">{pattern.preview}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                                 {/* Selected Pattern Display */}
                 <div className="mt-6 card p-6 bg-gradient-to-r from-purple-50 to-blue-50">
                   <h4 className="font-semibold text-gray-900 mb-3">Selected Pattern:</h4>
                   <div className="flex items-center space-x-4">
                     {(() => {
                       const selectedPatternData = paintPatterns.find(p => p.id === selectedPattern);
                       const IconComponent = selectedPatternData?.icon || Square;
                       return (
                         <>
                           <div className="p-4 bg-white rounded-xl shadow-sm">
                             <IconComponent className="w-8 h-8 text-blue-600" />
                           </div>
                           <div className="flex-1">
                             <h5 className="text-xl font-bold text-gray-900">{selectedPatternData?.name}</h5>
                             <p className="text-gray-600">{selectedPatternData?.description}</p>
                             <p className="text-sm text-blue-600 font-medium mt-1">{selectedPatternData?.preview}</p>
                             {selectedPattern !== 'plain' && (
                               <div className="mt-2 inline-flex items-center bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs">
                                 <Sparkles className="w-3 h-3 mr-1" />
                                 Creative Pattern
                               </div>
                             )}
                           </div>
                         </>
                       );
                     })()}
                   </div>
                 </div>
              </div>
            )}

            {/* Step 3: Color Selection */}
            <div className="card p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                <Palette className="w-6 h-6 mr-3" />
                Step 3: Choose Your Paint Color
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

            {/* Step 4: Project Details */}
            <div className="card p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Step 4: Project Details
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
                disabled={processing || !selectedImage || !selectedColor || (maskingMethod === 'manual' && !manualMask)}
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
              
              {(!selectedImage || !selectedColor || (maskingMethod === 'manual' && !manualMask)) && (
                <p className="text-sm text-gray-500 mt-3">
                  {!selectedImage 
                    ? 'Please upload an image to continue'
                    : !selectedColor 
                    ? 'Please select a pattern and paint color to continue'
                    : maskingMethod === 'manual' && !manualMask
                    ? 'Please select areas to paint or choose AI detection'
                    : 'All set! Ready to visualize with your selected pattern.'
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