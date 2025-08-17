const Card = ({ children, className = '', variant = 'default', ...props }) => {
  const variants = {
    default: 'bg-accent-bg border border-border-color',
    elevated: 'bg-accent-bg border border-border-color shadow-lg',
    outline: 'bg-transparent border-2 border-border-color',
  };

  const classes = `rounded-xl p-6 transition-all duration-200 ${variants[variant]} ${className}`;

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-xl font-semibold text-primary-text ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`text-secondary-text ${className}`}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-border-color ${className}`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;