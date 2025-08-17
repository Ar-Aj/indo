import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

const ImageUpload = ({ onImageUpload, uploadedImage, onRemoveImage }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPG, PNG, or WEBP)';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    return null;
  };

  const handleFile = (file) => {
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      return;
    }

    setUploadError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      onImageUpload({
        file,
        preview: e.target.result,
        name: file.name,
        size: file.size
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    onRemoveImage();
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (uploadedImage) {
    return (
      <Card className="relative">
        <div className="relative">
          <img
            src={uploadedImage.preview}
            alt="Uploaded wall"
            className="w-full h-64 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRemove}
              className="bg-white/90 text-gray-900 hover:bg-white"
            >
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-primary-text font-medium">{uploadedImage.name}</p>
          <p className="text-xs text-secondary-text">
            {(uploadedImage.size / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-accent-color bg-accent-color/5'
            : 'border-border-color hover:border-accent-color/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-3 rounded-full ${isDragOver ? 'bg-accent-color' : 'bg-accent-color/20'}`}>
            <Upload className={`w-8 h-8 ${isDragOver ? 'text-white' : 'text-accent-color'}`} />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-primary-text mb-2">
              Upload Your Wall Photo
            </h3>
            <p className="text-secondary-text mb-4">
              Drag and drop your image here, or click to browse
            </p>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="primary"
              size="md"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Choose File
            </Button>
          </div>
          
          <div className="text-xs text-secondary-text">
            <p>Supported formats: JPG, PNG, WEBP</p>
            <p>Maximum file size: 10MB</p>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center">
          <AlertCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-red-500">{uploadError}</p>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 p-4 bg-accent-color/5 rounded-lg">
        <h4 className="text-sm font-semibold text-primary-text mb-2">
          Tips for best results:
        </h4>
        <ul className="text-xs text-secondary-text space-y-1">
          <li>• Use good lighting and avoid shadows</li>
          <li>• Take photos straight-on, not at an angle</li>
          <li>• Ensure the wall surface is clearly visible</li>
          <li>• Higher resolution images give better results</li>
        </ul>
      </div>
    </Card>
  );
};

export default ImageUpload;