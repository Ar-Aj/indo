import { useState } from 'react';
import { ArrowLeft, ArrowRight, Save, Share2, Download, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ImageUpload from '../components/paint/ImageUpload';
import ColorGrid from '../components/paint/ColorGrid';

const PaintYourWall = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedColors, setSelectedColors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { number: 1, title: 'Upload Photo', description: 'Upload a photo of your wall' },
    { number: 2, title: 'Select Colors', description: 'Choose up to 5 paint colors' },
    { number: 3, title: 'Preview Results', description: 'See your wall with the new colors' }
  ];

  const handleImageUpload = (imageData) => {
    setUploadedImage(imageData);
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setCurrentStep(1);
    setSelectedColors([]);
  };

  const handleColorSelect = (colors) => {
    setSelectedColors(colors);
    if (colors.length > 0 && currentStep === 2) {
      setCurrentStep(3);
    } else if (colors.length === 0 && currentStep === 3) {
      setCurrentStep(2);
    }
  };

  const handleVisualize = async () => {
    setIsProcessing(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsProcessing(false);
  };

  const canProceedToStep = (step) => {
    switch (step) {
      case 2:
        return uploadedImage !== null;
      case 3:
        return uploadedImage !== null && selectedColors.length > 0;
      default:
        return true;
    }
  };

  const StepIndicator = ({ step, isActive, isCompleted }) => (
    <div className={`flex items-center ${step < steps.length ? 'flex-1' : ''}`}>
      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 ${
        isCompleted
          ? 'bg-accent-color border-accent-color text-white'
          : isActive
          ? 'border-accent-color text-accent-color'
          : 'border-border-color text-secondary-text'
      }`}>
        {step}
      </div>
      <div className="ml-3 hidden sm:block">
        <p className={`text-sm font-medium ${isActive ? 'text-primary-text' : 'text-secondary-text'}`}>
          {steps[step - 1].title}
        </p>
        <p className="text-xs text-secondary-text">
          {steps[step - 1].description}
        </p>
      </div>
      {step < steps.length && (
        <div className={`flex-1 h-0.5 mx-4 ${
          currentStep > step ? 'bg-accent-color' : 'bg-border-color'
        }`} />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-primary-bg">
      {/* Header */}
      <section className="py-8 bg-secondary-bg border-b border-border-color">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-primary-text mb-2">
            Paint Your Wall
          </h1>
          <p className="text-secondary-text">
            Upload your wall photo and visualize it with different paint colors
          </p>
        </div>
      </section>

      {/* Step Indicator */}
      <section className="py-6 bg-secondary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            {steps.map((step) => (
              <StepIndicator
                key={step.number}
                step={step.number}
                isActive={currentStep === step.number}
                isCompleted={currentStep > step.number}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Step 1: Upload Image */}
          {currentStep === 1 && (
            <div className="max-w-2xl mx-auto">
              <Card>
                <Card.Header>
                  <Card.Title>Step 1: Upload Your Wall Photo</Card.Title>
                </Card.Header>
                <Card.Content>
                  <ImageUpload
                    onImageUpload={handleImageUpload}
                    uploadedImage={uploadedImage}
                    onRemoveImage={handleRemoveImage}
                  />
                </Card.Content>
                {uploadedImage && (
                  <Card.Footer>
                    <Button
                      onClick={() => setCurrentStep(2)}
                      className="w-full"
                    >
                      Continue to Color Selection
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Card.Footer>
                )}
              </Card>
            </div>
          )}

          {/* Step 2: Select Colors */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-primary-text">
                    Step 2: Choose Your Colors
                  </h2>
                  <p className="text-secondary-text">
                    Select up to 5 paint colors to visualize on your wall
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setCurrentStep(1)}
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back to Upload
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Image Preview */}
                <div className="lg:col-span-1">
                  <Card className="sticky top-6">
                    <Card.Header>
                      <Card.Title>Your Wall</Card.Title>
                    </Card.Header>
                    <Card.Content>
                      {uploadedImage && (
                        <img
                          src={uploadedImage.preview}
                          alt="Your wall"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      )}
                      {selectedColors.length > 0 && (
                        <Button
                          onClick={() => setCurrentStep(3)}
                          className="w-full mt-4"
                        >
                          Preview Results
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      )}
                    </Card.Content>
                  </Card>
                </div>

                {/* Color Grid */}
                <div className="lg:col-span-3">
                  <ColorGrid
                    selectedColors={selectedColors}
                    onColorSelect={handleColorSelect}
                    maxSelections={5}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preview Results */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-primary-text">
                    Step 3: Preview Your Results
                  </h2>
                  <p className="text-secondary-text">
                    See how your selected colors look on your wall
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentStep(2)}
                  >
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Change Colors
                  </Button>
                  <Button
                    onClick={handleVisualize}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 w-4 h-4" />
                        Regenerate
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Original Image */}
                <Card>
                  <Card.Header>
                    <Card.Title>Original</Card.Title>
                  </Card.Header>
                  <Card.Content>
                    {uploadedImage && (
                      <img
                        src={uploadedImage.preview}
                        alt="Original wall"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    )}
                  </Card.Content>
                </Card>

                {/* Visualized Results */}
                {selectedColors.slice(0, 2).map((color, index) => (
                  <Card key={color.id}>
                    <Card.Header>
                      <Card.Title>{color.name}</Card.Title>
                      <p className="text-sm text-secondary-text">{color.hexCode}</p>
                    </Card.Header>
                    <Card.Content>
                      <div className="relative">
                        {uploadedImage && (
                          <img
                            src={uploadedImage.preview}
                            alt={`Wall with ${color.name}`}
                            className="w-full h-64 object-cover rounded-lg"
                            style={{
                              filter: `hue-rotate(${index * 30}deg) saturate(1.2)`,
                            }}
                          />
                        )}
                        {/* Color overlay simulation */}
                        <div
                          className="absolute inset-0 rounded-lg opacity-30 mix-blend-multiply"
                          style={{ backgroundColor: color.hexCode }}
                        />
                      </div>
                    </Card.Content>
                  </Card>
                ))}
              </div>

              {/* Additional Color Previews */}
              {selectedColors.length > 2 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {selectedColors.slice(2).map((color, index) => (
                    <Card key={color.id}>
                      <Card.Header>
                        <Card.Title className="text-base">{color.name}</Card.Title>
                        <p className="text-sm text-secondary-text">{color.hexCode}</p>
                      </Card.Header>
                      <Card.Content>
                        <div className="relative">
                          {uploadedImage && (
                            <img
                              src={uploadedImage.preview}
                              alt={`Wall with ${color.name}`}
                              className="w-full h-48 object-cover rounded-lg"
                              style={{
                                filter: `hue-rotate(${(index + 2) * 30}deg) saturate(1.2)`,
                              }}
                            />
                          )}
                          <div
                            className="absolute inset-0 rounded-lg opacity-30 mix-blend-multiply"
                            style={{ backgroundColor: color.hexCode }}
                          />
                        </div>
                      </Card.Content>
                    </Card>
                  ))}
                </div>
              )}

              {/* Actions */}
              <Card>
                <Card.Header>
                  <Card.Title>Save & Share Your Results</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="success">
                      <Save className="mr-2 w-4 h-4" />
                      Save Project
                    </Button>
                    <Button variant="secondary">
                      <Share2 className="mr-2 w-4 h-4" />
                      Share Results
                    </Button>
                    <Button variant="secondary">
                      <Download className="mr-2 w-4 h-4" />
                      Download Images
                    </Button>
                  </div>
                  <p className="text-sm text-secondary-text mt-4">
                    Create an account to save your projects and access them from any device.
                  </p>
                </Card.Content>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="max-w-md mx-4">
            <Card.Content>
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent-color mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-primary-text mb-2">
                  Processing Your Image
                </h3>
                <p className="text-secondary-text">
                  Our AI is analyzing your photo and applying the selected colors. This may take a few moments.
                </p>
              </div>
            </Card.Content>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PaintYourWall;