import { Link } from 'react-router-dom';
import { Palette, Sparkles, Save, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const Home = () => {
  const features = [
    {
      icon: <Sparkles className="w-8 h-8 text-accent-color" />,
      title: 'AI Visualization',
      description: 'Upload your wall photo and see how different paint colors will look with our advanced AI technology.'
    },
    {
      icon: <Palette className="w-8 h-8 text-accent-color" />,
      title: '2500+ Colors',
      description: 'Choose from our extensive collection of premium paint colors, organized by category and finish type.'
    },
    {
      icon: <Save className="w-8 h-8 text-accent-color" />,
      title: 'Save Projects',
      description: 'Create an account to save your favorite color combinations and share them with friends and family.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-bg via-secondary-bg to-accent-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-primary-text mb-6">
                Visualize Your
                <span className="text-accent-color"> Perfect Paint</span>
              </h1>
              <p className="text-xl text-secondary-text mb-8 max-w-2xl">
                Transform any room with confidence. Upload a photo of your wall and see exactly how it will look with any of our 2500+ premium paint colors.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/paint-your-wall">
                  <Button size="xl" className="w-full sm:w-auto">
                    Paint Your Wall
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="secondary" size="xl" className="w-full sm:w-auto">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Hero Image Placeholder */}
            <div className="relative">
              <div className="bg-gradient-to-br from-accent-color/20 to-success-color/20 rounded-2xl p-8 lg:p-12">
                <div className="bg-secondary-bg rounded-xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-secondary-text text-sm">PaintViz</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"></div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="h-8 bg-red-500 rounded"></div>
                      <div className="h-8 bg-blue-500 rounded"></div>
                      <div className="h-8 bg-green-500 rounded"></div>
                      <div className="h-8 bg-yellow-500 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-text mb-4">
              Why Choose PaintViz?
            </h2>
            <p className="text-xl text-secondary-text max-w-3xl mx-auto">
              Our cutting-edge technology makes choosing the perfect paint color easier than ever before.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} variant="elevated" className="text-center hover:scale-105 transition-transform">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <Card.Title className="mb-4">{feature.title}</Card.Title>
                <Card.Content>
                  <p>{feature.description}</p>
                </Card.Content>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-accent-color to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Space?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of homeowners who have found their perfect paint color with PaintViz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/paint-your-wall">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-white text-accent-color hover:bg-gray-100">
                Start Visualizing
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto text-white border-white hover:bg-white/10">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;