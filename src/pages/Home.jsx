import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { paintAPI } from '../services/api';
import { 
  Camera, 
  Palette, 
  Sparkles, 
  Shield, 
  Smartphone, 
  ArrowRight,
  Star,
  CheckCircle,
  Play,
  Users,
  Award,
  Zap,
  Heart,
  TrendingUp,
  Globe,
  MessageCircle
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [featuredColors, setFeaturedColors] = useState([]);
  const [stats, setStats] = useState({
    totalColors: '2500+',
    happyCustomers: '10,000+',
    projectsCompleted: '50,000+',
    avgRating: '4.9'
  });

  useEffect(() => {
    const fetchFeaturedColors = async () => {
      try {
        const response = await paintAPI.getColors({ limit: 8 });
        setFeaturedColors(response.colors || []);
      } catch (error) {
        console.error('Failed to fetch featured colors:', error);
      }
    };

    fetchFeaturedColors();
  }, []);

  const features = [
    {
      icon: Camera,
      title: 'AI-Powered Visualization',
      description: 'Upload your room photo and see realistic paint applications using advanced AI technology.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Palette,
      title: '2500+ Paint Colors',
      description: 'Browse colors from top brands like Sherwin-Williams, Benjamin Moore, and Behr.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Sparkles,
      title: 'Smart Recommendations',
      description: 'Get personalized color suggestions based on color theory and your preferences.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Perfect experience on any device - phone, tablet, or desktop.',
      color: 'from-green-500 to-teal-500'
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Interior Designer',
      rating: 5,
      comment: 'PaintViz helped me visualize my living room perfectly. The AI is incredibly accurate and saves me hours of work!',
      avatar: '👩‍💼'
    },
    {
      name: 'Mike Chen',
      role: 'Homeowner',
      rating: 5,
      comment: 'Love how easy it is to try different colors. Saved me so much time and money on paint samples.',
      avatar: '👨‍💻'
    },
    {
      name: 'Emma Davis',
      role: 'Contractor',
      rating: 5,
      comment: 'The mobile app is fantastic. I can show clients visualizations on the go and close deals faster.',
      avatar: '👷‍♀️'
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Upload Your Photo',
      description: 'Take a photo of your room or upload an existing image from your gallery',
      icon: Camera,
      color: 'bg-blue-500'
    },
    {
      number: '02',
      title: 'Choose Your Color',
      description: 'Browse our extensive collection of professional paint colors from top brands',
      icon: Palette,
      color: 'bg-purple-500'
    },
    {
      number: '03',
      title: 'See the Magic',
      description: 'Our AI applies the paint and shows you realistic results in seconds',
      icon: Sparkles,
      color: 'bg-pink-500'
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 py-20 sm:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium backdrop-blur-sm">
                🎨 AI-Powered Paint Visualization
              </span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-bold mb-8 leading-tight">
              Visualize Your
              <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                Perfect Paint Colors
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Transform any room with AI-powered paint visualization. Upload a photo, choose from 2500+ colors, and see realistic results instantly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/paint-your-wall"
                    className="btn-primary text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 flex items-center"
                  >
                    <Camera className="mr-3 w-6 h-6" />
                    Start Painting Now
                  </Link>
                  <Link
                    to="/projects"
                    className="btn-secondary text-lg px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600 rounded-full font-semibold transition-all duration-300"
                  >
                    View My Projects
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-primary text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/colors"
                    className="btn-secondary text-lg px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600 rounded-full font-semibold transition-all duration-300 flex items-center"
                  >
                    <Palette className="mr-3 w-5 h-5" />
                    Browse Colors
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.totalColors}</div>
                <div className="text-blue-200 text-sm">Paint Colors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.happyCustomers}</div>
                <div className="text-blue-200 text-sm">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.projectsCompleted}</div>
                <div className="text-blue-200 text-sm">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.avgRating}</div>
                <div className="text-blue-200 text-sm">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Colors Preview */}
      {featuredColors.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Popular Paint Colors
              </h2>
              <p className="text-gray-600">
                Trending colors from our extensive collection
              </p>
            </div>
            
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4 max-w-4xl mx-auto mb-8">
              {featuredColors.map((color, index) => (
                <Link
                  key={color._id || index}
                  to="/colors"
                  className="group"
                >
                  <div 
                    className="aspect-square rounded-2xl border-4 border-white shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110"
                    style={{ backgroundColor: color.hexCode }}
                    title={`${color.name} - ${color.brand}`}
                  ></div>
                  <div className="text-center mt-2">
                    <p className="text-xs font-medium text-gray-900 truncate">{color.name}</p>
                    <p className="text-xs text-gray-500">{color.brand}</p>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="text-center">
              <Link
                to="/colors"
                className="btn-primary inline-flex items-center"
              >
                View All Colors
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why Choose PaintViz?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of paint visualization with our cutting-edge AI technology and comprehensive color database.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className={`bg-gradient-to-br ${feature.color} w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get your perfect paint visualization in just 3 simple steps
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {steps.map((step, index) => (
                <div key={index} className="text-center relative">
                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 transform translate-x-1/2"></div>
                  )}
                  
                  <div className={`${step.color} text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg relative z-10`}>
                    {step.number}
                  </div>
                  
                  <div className="mb-4">
                    <step.icon className="w-12 h-12 text-gray-400 mx-auto" />
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            {isAuthenticated ? (
              <Link
                to="/paint-your-wall"
                className="btn-primary text-lg px-8 py-4 inline-flex items-center"
              >
                <Play className="mr-3 w-5 h-5" />
                Try It Now
              </Link>
            ) : (
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-4 inline-flex items-center"
              >
                <Play className="mr-3 w-5 h-5" />
                Get Started Free
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied customers who transformed their spaces
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-6 italic text-lg leading-relaxed">
                  "{testimonial.comment}"
                </p>
                
                <div className="flex items-center">
                  <div className="text-3xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">
                      {testimonial.name}
                    </p>
                    <p className="text-gray-500">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-bold mb-8">
              Ready to Transform Your Space?
            </h2>
            <p className="text-xl mb-12 text-blue-100 leading-relaxed">
              Join thousands of homeowners, designers, and contractors who have already discovered their perfect paint colors with PaintViz. Start your journey today!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/paint-your-wall"
                    className="btn-primary text-lg px-10 py-4 bg-white text-blue-600 hover:bg-gray-100 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center"
                  >
                    <Camera className="mr-3 w-6 h-6" />
                    Start Your Project
                  </Link>
                  <Link
                    to="/colors"
                    className="btn-secondary text-lg px-10 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600 rounded-full font-semibold transition-all duration-300 inline-flex items-center"
                  >
                    <Palette className="mr-3 w-5 h-5" />
                    Browse Colors
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-primary text-lg px-10 py-4 bg-white text-blue-600 hover:bg-gray-100 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center"
                  >
                    <ArrowRight className="mr-3 w-6 h-6" />
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    className="btn-secondary text-lg px-10 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600 rounded-full font-semibold transition-all duration-300"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-blue-200">
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                <span>Award Winning</span>
              </div>
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>10,000+ Happy Users</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;