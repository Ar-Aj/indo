import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, UserPlus, Check } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Registration successful:', data);
      // Redirect to login or dashboard
    } catch (error) {
      setError('root', { message: 'Something went wrong. Please try again.' });
    }
    
    setIsSubmitting(false);
  };

  const handleSocialLogin = (provider) => {
    console.log(`Register with ${provider}`);
    // Implement social registration
  };

  const passwordRequirements = [
    { label: 'At least 8 characters', test: (pwd) => pwd && pwd.length >= 8 },
    { label: 'Contains uppercase letter', test: (pwd) => pwd && /[A-Z]/.test(pwd) },
    { label: 'Contains lowercase letter', test: (pwd) => pwd && /[a-z]/.test(pwd) },
    { label: 'Contains number', test: (pwd) => pwd && /\d/.test(pwd) },
  ];

  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-text">
            Create Account
          </h1>
          <p className="mt-2 text-secondary-text">
            Join PaintViz and start visualizing your perfect paint colors
          </p>
        </div>

        <Card variant="elevated">
          <Card.Content>
            {/* Social Registration Buttons */}
            <div className="space-y-3 mb-6">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => handleSocialLogin('Google')}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign up with Google
              </Button>
              
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => handleSocialLogin('Facebook')}
              >
                <svg className="w-5 h-5 mr-3" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Sign up with Facebook
              </Button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-color" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-accent-bg text-secondary-text">Or sign up with email</span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {errors.root && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-500">{errors.root.message}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="relative">
                <Input
                  label="Password"
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain uppercase, lowercase, and number'
                    }
                  })}
                  error={errors.password?.message}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-secondary-text hover:text-primary-text transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Requirements */}
              {password && (
                <div className="p-3 bg-accent-color/5 border border-accent-color/20 rounded-lg">
                  <h4 className="text-sm font-semibold text-primary-text mb-2">
                    Password Requirements
                  </h4>
                  <div className="space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center text-xs">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${
                          req.test(password) ? 'bg-success-color' : 'bg-border-color'
                        }`}>
                          {req.test(password) && <Check className="w-2 h-2 text-white" />}
                        </div>
                        <span className={req.test(password) ? 'text-success-color' : 'text-secondary-text'}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="relative">
                <Input
                  label="Confirm Password"
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  error={errors.confirmPassword?.message}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-secondary-text hover:text-primary-text transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="flex items-start">
                <input
                  id="agree-terms"
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="h-4 w-4 text-accent-color focus:ring-accent-color border-border-color rounded mt-0.5"
                />
                <label htmlFor="agree-terms" className="ml-3 block text-sm text-primary-text">
                  I agree to the{' '}
                  <Link to="/terms" className="text-accent-color hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-accent-color hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !agreeToTerms}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 w-4 h-4" />
                    Create Account
                  </>
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-secondary-text">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-accent-color hover:text-indigo-500 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </Card.Content>
        </Card>

        {/* Benefits */}
        <Card>
          <Card.Header>
            <Card.Title className="text-center">What you'll get with your free account:</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-2 text-sm text-secondary-text">
              <div className="flex items-center">
                <Check className="w-4 h-4 text-success-color mr-2 flex-shrink-0" />
                <span>Save unlimited paint visualization projects</span>
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-success-color mr-2 flex-shrink-0" />
                <span>Create and manage favorite color collections</span>
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-success-color mr-2 flex-shrink-0" />
                <span>Share your projects with friends and family</span>
              </div>
              <div className="flex items-center">
                <Check className="w-4 h-4 text-success-color mr-2 flex-shrink-0" />
                <span>Access to premium paint color collections</span>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default Register;