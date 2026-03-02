import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export default function Card({ 
  title, 
  children, 
  actions, 
  className = '',
  variant = 'default',
  interactive = false,
  padding = 'normal',
  subtitle = null,
  icon = null,
}) {
  const variantClasses = {
    default: 'bg-white shadow-soft hover:shadow-md border border-gray-100',
    elevated: 'bg-white shadow-lg hover:shadow-xl border border-gray-100',
    glass: 'glass shadow-md hover:shadow-lg',
    gradient: 'bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg border border-gray-100',
    bordered: 'bg-white border-2 border-gray-200 hover:border-primary-300',
  };

  const paddingClasses = {
    none: '',
    compact: 'p-4',
    normal: 'p-6',
    spacious: 'p-8',
  };

  const interactiveClass = interactive 
    ? 'cursor-pointer hover:scale-[1.01] hover:-translate-y-0.5 active:scale-[0.99]' 
    : '';

  const cardClasses = `
    ${variantClasses[variant]}
    rounded-xl
    overflow-hidden
    transition-all duration-300 ease-in-out
    ${interactiveClass}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const CardWrapper = interactive ? motion.div : 'div';
  const motionProps = interactive ? {
    whileHover: { scale: 1.01, y: -2 },
    whileTap: { scale: 0.99 }
  } : {};

  return (
    <CardWrapper className={cardClasses} {...motionProps}>
      {(title || subtitle || actions) && (
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-transparent">
          <div className="flex justify-between items-start gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {icon && (
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                  {icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                {title && (
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-500 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex gap-2 flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className={paddingClasses[padding]}>
        {children}
      </div>
    </CardWrapper>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  icon: PropTypes.node,
  actions: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'elevated', 'glass', 'gradient', 'bordered']),
  interactive: PropTypes.bool,
  padding: PropTypes.oneOf(['none', 'compact', 'normal', 'spacious']),
  className: PropTypes.string,
};

Card.defaultProps = {
  variant: 'default',
  interactive: false,
  padding: 'normal',
};
