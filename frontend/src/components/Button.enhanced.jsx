import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * Enhanced Button component with accessibility and loading states
 * Supports keyboard navigation, ARIA labels, and proper focus management
 */
export default function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  ariaLabel,
  ...props
}) {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center gap-2 relative overflow-hidden group';
  
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white focus:ring-primary-500 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white focus:ring-gray-500 shadow-sm hover:shadow-md',
    success: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white focus:ring-emerald-500 shadow-sm hover:shadow-md',
    danger: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white focus:ring-rose-500 shadow-sm hover:shadow-md',
    outline: 'border-2 border-gray-300 hover:border-gray-400 active:border-gray-500 text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-500',
    link: 'text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline focus:ring-primary-500'
  };
  
  const sizeClasses = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };
  
  const disabledClasses = (disabled || loading) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]';
  const widthClass = fullWidth ? 'w-full' : '';

  const buttonContent = (
    <>
      {/* Loading spinner or icon (left) */}
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className="transition-transform group-hover:scale-110" aria-hidden="true">
          {icon}
        </span>
      )}
      
      {/* Text content */}
      <span className={loading ? 'opacity-70' : ''}>
        {children}
      </span>
      
      {/* Icon (right) */}
      {!loading && icon && iconPosition === 'right' && (
        <span className="transition-transform group-hover:scale-110" aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Ripple effect on click */}
      <span 
        className="absolute inset-0 bg-white opacity-0 group-active:opacity-20 transition-opacity pointer-events-none"
        aria-hidden="true"
      />
    </>
  );

  return (
    <motion.button
      type={type}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      whileHover={!(disabled || loading) ? { scale: 1.02 } : {}}
      whileTap={!(disabled || loading) ? { scale: 0.98 } : {}}
      className={`
        ${baseClasses} 
        ${variantClasses[variant]} 
        ${sizeClasses[size]} 
        ${disabledClasses}
        ${widthClass}
        ${className}
      `}
      aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {buttonContent}
    </motion.button>
  );
}

/**
 * Button Group for related actions
 */
export function ButtonGroup({ children, className = '', vertical = false, ariaLabel }) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`
        inline-flex 
        ${vertical ? 'flex-col' : 'flex-row'}
        ${vertical ? '' : '[&>button]:rounded-none [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg'}
        ${vertical ? '[&>button]:rounded-none [&>button:first-child]:rounded-t-lg [&>button:last-child]:rounded-b-lg' : ''}
        ${vertical ? '' : '[&>button:not(:last-child)]:border-r-0'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * Icon Button for icon-only actions
 */
export function IconButton({
  icon,
  onClick,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  loading = false,
  ariaLabel,
  tooltip,
  className = '',
  ...props
}) {
  const sizeClasses = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
    xl: 'p-4'
  };

  return (
    <Button
      onClick={onClick}
      variant={variant}
      disabled={disabled}
      loading={loading}
      ariaLabel={ariaLabel}
      title={tooltip}
      className={`${sizeClasses[size]} ${className}`}
      icon={icon}
      {...props}
    >
      <span className="sr-only">{ariaLabel}</span>
    </Button>
  );
}

/**
 * Floating Action Button (FAB)
 */
export function FloatingActionButton({
  icon,
  onClick,
  position = 'bottom-right',
  ariaLabel = 'Floating action button',
  className = '',
  ...props
}) {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`fixed ${positionClasses[position]} z-50 ${className}`}
    >
      <Button
        onClick={onClick}
        size="lg"
        ariaLabel={ariaLabel}
        className="rounded-full shadow-2xl shadow-primary-500/30 w-14 h-14"
        icon={icon}
        {...props}
      />
    </motion.div>
  );
}
