import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

export default function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  icon = null,
  hint = null,
  size = 'md'
}) {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const inputClasses = `
    w-full ${sizeClasses[size]}
    bg-white border rounded-lg
    transition-all duration-200 ease-in-out
    placeholder:text-gray-400
    focus:outline-none focus:ring-4
    ${error 
      ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-50' 
      : 'border-gray-200 hover:border-gray-300 focus:border-primary-500 focus:ring-primary-50'
    }
    ${disabled 
      ? 'bg-gray-50 cursor-not-allowed opacity-60' 
      : ''
    }
    ${icon ? 'pl-11' : ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          {label} 
          {required && (
            <span className="text-danger-500 ml-1" aria-label="required">*</span>
          )}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
        />
      </div>
      
      <AnimatePresence mode="wait">
        {error && (
          <motion.p 
            id={`${name}-error`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-danger-600 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      
      {hint && !error && (
        <p id={`${name}-hint`} className="mt-2 text-sm text-gray-500">
          {hint}
        </p>
      )}
    </div>
  );
}

Input.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  success: PropTypes.bool,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  icon: PropTypes.node,
  hint: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

Input.defaultProps = {
  type: 'text',
  size: 'md',
  disabled: false,
  required: false,
  success: false,
};
