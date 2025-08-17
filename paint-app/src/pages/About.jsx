import { Users, Award, Leaf, Target } from 'lucide-react';
import Card from '../components/ui/Card';

const About = () => {
  const values = [
    {
      icon: <Target className="w-8 h-8 text-accent-color" />,
      title: 'Innovation',
      description: 'We leverage cutting-edge AI technology to revolutionize how people choose paint colors for their homes.'
    },
    {
      icon: <Award className="w-8 h-8 text-accent-color" />,
      title: 'Quality',
      description: 'Our curated collection features only premium paint colors from trusted manufacturers worldwide.'
    },
    {
      icon: <Users className="w-8 h-8 text-accent-color" />,
      title: 'Community',
      description: 'We believe in empowering homeowners with the tools and confidence to transform their living spaces.'
    },
    {
      icon: <Leaf className="w-8 h-8 text-accent-color" />,
      title: 'Sustainability',
      description: 'We partner with eco-conscious paint manufacturers and promote sustainable home improvement practices.'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      bio: 'Former interior designer with 15 years of experience helping homeowners find their perfect colors.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      bio: 'AI specialist and former Google engineer passionate about making technology accessible to everyone.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Design',
      bio: 'Award-winning UX designer focused on creating intuitive and beautiful user experiences.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-bg via-secondary-bg to-accent-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-primary-text mb-6">
            About PaintViz
          </h1>
          <p className="text-xl text-secondary-text">
            We're on a mission to make choosing the perfect paint color as easy as taking a photo.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-primary-text mb-6">Our Story</h2>
              <div className="space-y-4 text-secondary-text">
                <p>
                  PaintViz was born from a simple frustration: choosing paint colors shouldn't be so difficult. 
                  After years of watching customers struggle with paint swatches and guesswork, our founder Sarah 
                  decided there had to be a better way.
                </p>
                <p>
                  Combining her expertise in interior design with cutting-edge AI technology, we created the first 
                  truly accurate paint visualization platform. Today, we've helped over 100,000 homeowners 
                  confidently transform their spaces.
                </p>
                <p>
                  Our platform uses advanced computer vision to analyze your photos and apply paint colors with 
                  stunning realism, taking into account lighting, texture, and shadows for the most accurate 
                  preview possible.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-accent-color/20 to-success-color/20 rounded-2xl p-8">
                <div className="bg-secondary-bg rounded-xl p-6 shadow-xl">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent-color">100K+</div>
                      <div className="text-sm text-secondary-text">Happy Customers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent-color">2500+</div>
                      <div className="text-sm text-secondary-text">Paint Colors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent-color">50+</div>
                      <div className="text-sm text-secondary-text">Paint Brands</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-accent-color">99%</div>
                      <div className="text-sm text-secondary-text">Accuracy Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-secondary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-text mb-4">
              Our Values
            </h2>
            <p className="text-xl text-secondary-text max-w-3xl mx-auto">
              These core principles guide everything we do, from product development to customer service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:scale-105 transition-transform">
                <div className="flex justify-center mb-4">
                  {value.icon}
                </div>
                <Card.Title className="mb-4">{value.title}</Card.Title>
                <Card.Content>
                  <p>{value.description}</p>
                </Card.Content>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-text mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-secondary-text max-w-3xl mx-auto">
              The passionate individuals behind PaintViz who are dedicated to helping you find your perfect color.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} variant="elevated" className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-accent-color to-success-color rounded-full flex items-center justify-center">
                    <div className="w-20 h-20 bg-secondary-bg rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-accent-color" />
                    </div>
                  </div>
                </div>
                <Card.Title className="mb-2">{member.name}</Card.Title>
                <div className="text-accent-color font-medium mb-4">{member.role}</div>
                <Card.Content>
                  <p>{member.bio}</p>
                </Card.Content>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="py-20 bg-gradient-to-r from-success-color to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <Leaf className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Commitment to Sustainability
          </h2>
          <p className="text-xl text-green-100 mb-8">
            We believe beautiful homes shouldn't come at the expense of our planet. That's why we partner 
            exclusively with paint manufacturers who prioritize eco-friendly formulations and sustainable practices.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-green-100">Low-VOC Paints</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">Carbon</div>
              <div className="text-green-100">Neutral Shipping</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">Recycled</div>
              <div className="text-green-100">Packaging</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;