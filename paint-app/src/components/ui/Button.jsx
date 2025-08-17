import { forwardRef } from 'react';

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  className = '', 
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-bg disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-accent-color hover:bg-indigo-600 text-white focus:ring-accent-color',
    secondary: 'bg-secondary-bg hover:bg-hover-bg text-primary-text border border-border-color focus:ring-accent-color',
    success: 'bg-success-color hover:bg-green-600 text-white focus:ring-success-color',
    warning: 'bg-warning-color hover:bg-amber-600 text-white focus:ring-warning-color',
    ghost: 'hover:bg-hover-bg text-primary-text focus:ring-accent-color',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-4 py-2 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]',
    xl: 'px-8 py-4 text-xl min-h-[52px]',
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;