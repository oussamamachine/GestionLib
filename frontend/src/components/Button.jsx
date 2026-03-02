import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export default function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  className = '',
  icon = null,
  loading = false,
  fullWidth = false,
}) {
  const baseClasses = `
    relative inline-flex items-center justify-center gap-2
    font-semibold rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100
    active:scale-95
  `.trim().replace(/\s+/g, ' ');
  
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-primary-600 to-primary-500
      hover:from-primary-700 hover:to-primary-600
      text-white shadow-md hover:shadow-lg
      focus:ring-primary-500
      glow-primary
    `,
    secondary: `
      bg-white border-2 border-gray-200
      hover:bg-gray-50 hover:border-gray-300
      text-gray-700 shadow-sm hover:shadow-md
      focus:ring-gray-500
    `,
    success: `
      bg-gradient-to-r from-success-600 to-success-500
      hover:from-success-700 hover:to-success-600
      text-white shadow-md hover:shadow-lg
      focus:ring-success-500
    `,
    danger: `
      bg-gradient-to-r from-danger-600 to-danger-500
      hover:from-danger-700 hover:to-danger-600
      text-white shadow-md hover:shadow-lg
      focus:ring-danger-500
    `,
    outline: `
      border-2 border-primary-300 bg-transparent
      hover:border-primary-500 hover:bg-primary-50
      text-primary-700 hover:text-primary-800
      focus:ring-primary-500
    `,
    ghost: `
      bg-transparent hover:bg-gray-100
      text-gray-700 hover:text-gray-900
      focus:ring-gray-500
    `,
    link: `
      bg-transparent hover:bg-transparent
      text-primary-600 hover:text-primary-700
      underline-offset-4 hover:underline
      shadow-none
      focus:ring-primary-500
    `
  };
  
  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const combinedClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${widthClass}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={combinedClasses}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
    >
      {/* Loading Spinner */}
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {/* Icon */}
      {icon && !loading && (
        <span className="inline-flex items-center">{icon}</span>
      )}
      
      {/* Content */}
      <span className="truncate">{children}</span>
    </motion.button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'outline', 'ghost', 'link']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  fullWidth: PropTypes.bool,
  icon: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

Button.defaultProps = {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false,
  type: 'button',
};
