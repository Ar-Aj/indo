import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Form data:', data);
    setIsSubmitting(false);
    setIsSubmitted(true);
    reset();

    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6 text-accent-color" />,
      title: 'Email',
      content: 'hello@paintviz.com',
      description: 'Send us an email anytime!'
    },
    {
      icon: <Phone className="w-6 h-6 text-accent-color" />,
      title: 'Phone',
      content: '1-800-PAINT-VIZ',
      description: 'Mon-Fri from 8am to 6pm EST'
    },
    {
      icon: <MapPin className="w-6 h-6 text-accent-color" />,
      title: 'Office',
      content: '123 Color Street, Paint City, PC 12345',
      description: 'Come visit our showroom!'
    },
    {
      icon: <Clock className="w-6 h-6 text-accent-color" />,
      title: 'Hours',
      content: 'Mon-Fri: 8am-6pm EST',
      description: 'Weekend support available'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-bg via-secondary-bg to-accent-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-primary-text mb-6">
            Get in Touch
          </h1>
          <p className="text-xl text-secondary-text">
            Have questions about PaintViz? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-20 bg-primary-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card variant="elevated">
                <Card.Header>
                  <Card.Title>Send us a Message</Card.Title>
                </Card.Header>
                
                {isSubmitted && (
                  <div className="mb-6 p-4 bg-success-color/10 border border-success-color/20 rounded-lg">
                    <div className="flex items-center text-success-color">
                      <Send className="w-5 h-5 mr-2" />
                      <span className="font-medium">Message sent successfully!</span>
                    </div>
                    <p className="text-sm text-secondary-text mt-1">
                      We'll get back to you within 24 hours.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="First Name"
                      id="firstName"
                      {...register('firstName', {
                        required: 'First name is required',
                        minLength: {
                          value: 2,
                          message: 'First name must be at least 2 characters'
                        }
                      })}
                      error={errors.firstName?.message}
                      placeholder="John"
                    />
                    
                    <Input
                      label="Last Name"
                      id="lastName"
                      {...register('lastName', {
                        required: 'Last name is required',
                        minLength: {
                          value: 2,
                          message: 'Last name must be at least 2 characters'
                        }
                      })}
                      error={errors.lastName?.message}
                      placeholder="Doe"
                    />
                  </div>

                  <Input
                    label="Email Address"
                    id="email"
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    error={errors.email?.message}
                    placeholder="john@example.com"
                  />

                  <Input
                    label="Phone Number (Optional)"
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    placeholder="(555) 123-4567"
                  />

                  <div className="w-full">
                    <label htmlFor="subject" className="block text-sm font-medium text-primary-text mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      {...register('subject', { required: 'Please select a subject' })}
                      className="block w-full px-3 py-2 min-h-[44px] text-primary-text bg-secondary-bg border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent transition-colors duration-200"
                    >
                      <option value="">Choose a subject...</option>
                      <option value="general">General Question</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing Question</option>
                      <option value="feature">Feature Request</option>
                      <option value="partnership">Partnership Inquiry</option>
                    </select>
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-500" role="alert">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>

                  <div className="w-full">
                    <label htmlFor="message" className="block text-sm font-medium text-primary-text mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={6}
                      {...register('message', {
                        required: 'Message is required',
                        minLength: {
                          value: 10,
                          message: 'Message must be at least 10 characters'
                        }
                      })}
                      className="block w-full px-3 py-2 text-primary-text bg-secondary-bg border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-color focus:border-transparent transition-colors duration-200 resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-500" role="alert">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-primary-text mb-6">
                  Contact Information
                </h2>
                <p className="text-secondary-text mb-8">
                  We're here to help! Reach out to us through any of these channels and we'll get back to you as soon as possible.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                {contactInfo.map((info, index) => (
                  <Card key={index} className="hover:scale-105 transition-transform">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary-text mb-1">
                          {info.title}
                        </h3>
                        <p className="text-accent-color font-medium mb-1">
                          {info.content}
                        </p>
                        <p className="text-sm text-secondary-text">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Map Placeholder */}
              <Card>
                <Card.Header>
                  <Card.Title>Find Us</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="bg-gradient-to-br from-accent-color/20 to-success-color/20 rounded-lg h-48 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-accent-color mx-auto mb-2" />
                      <p className="text-secondary-text">Interactive map coming soon</p>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-secondary-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary-text mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-secondary-text">
              Quick answers to common questions about PaintViz.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "How accurate is the paint visualization?",
                answer: "Our AI technology provides 99% accuracy by analyzing lighting, texture, and shadows in your photos."
              },
              {
                question: "Can I save my projects?",
                answer: "Yes! Create a free account to save unlimited projects and access them from any device."
              },
              {
                question: "Do you offer mobile apps?",
                answer: "We're currently developing native mobile apps for iOS and Android. They'll be available soon!"
              },
              {
                question: "How do I get the best results?",
                answer: "Upload high-quality photos with good lighting and clear wall surfaces for the most accurate visualization."
              }
            ].map((faq, index) => (
              <Card key={index}>
                <Card.Header>
                  <Card.Title className="text-lg">{faq.question}</Card.Title>
                </Card.Header>
                <Card.Content>
                  <p>{faq.answer}</p>
                </Card.Content>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;