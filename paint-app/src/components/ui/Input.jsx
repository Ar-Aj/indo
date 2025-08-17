import { forwardRef } from 'react';

const Input = forwardRef(({ 
  label,
  error,
  className = '',
  type = 'text',
  id,
  ...props 
}, ref) => {
  const inputClasses = `
    block w-full px-3 py-2 min-h-[44px] text-primary-text bg-secondary-bg border rounded-lg
    transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-bg
    ${error 
      ? 'border-red-500 focus:ring-red-500' 
      : 'border-border-color focus:ring-accent-color hover:border-gray-400'
    }
    disabled:opacity-50 disabled:cursor-not-allowed
    ${className}
  `;

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-primary-text mb-2"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        id={id}
        className={inputClasses.trim()}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;