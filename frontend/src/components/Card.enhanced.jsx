import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  TrendingUp, 
  Clock,
  BarChart3,
  Activity
} from 'lucide-react';

/**
 * Enhanced Card component with better accessibility and animations
 * Features:
 * - Hover effects
 * - Click interactions
 * - ARIA labels
 * - Loading states
 * - Multiple variants
 */
export default function Card({
  children,
  onClick,
  hoverable = false,
  clickable = false,
  className = '',
  ariaLabel,
  ...props
}) {
  const isInteractive = onClick || clickable || hoverable;

  return (
    <motion.div
      onClick={onClick}
      whileHover={isInteractive ? { y: -2, scale: 1.01 } : {}}
      whileTap={clickable || onClick ? { scale: 0.98 } : {}}
      className={`
        bg-white rounded-2xl shadow-sm border border-gray-100
        transition-all duration-200
        ${isInteractive ? 'cursor-pointer hover:shadow-lg hover:border-gray-200' : ''}
        ${className}
      `}
      role={onClick ? 'button' : 'article'}
      aria-label={ariaLabel}
      tabIndex={onClick ? 0 : undefined}
      onKeyPress={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stats Card for dashboard metrics
 */
export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = 'primary',
  loading = false,
  onClick,
  className = '',
  ...props
}) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    danger: 'bg-rose-50 text-rose-600',
    info: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  const trendColor = trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-rose-600' : 'text-gray-600';

  if (loading) {
    return (
      <Card className={className}>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-12 w-12 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      onClick={onClick}
      hoverable={!!onClick}
      clickable={!!onClick}
      className={className}
      ariaLabel={`${title}: ${value}${trendLabel ? `, ${trendLabel}` : ''}`}
      {...props}
    >
      <div className="p-6">
        {/* Icon and Trend */}
        <div className="flex items-start justify-between mb-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`p-3 rounded-xl ${colorClasses[color]}`}
          >
            <Icon className="w-6 h-6" strokeWidth={2} />
          </motion.div>

          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${trendColor}`}>
              <TrendingUp className="w-4 h-4" />
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>

        {/* Title and Value */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {title}
          </p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 tabular-nums"
          >
            {value}
          </motion.p>
          {trendLabel && (
            <p className="text-xs text-gray-400 mt-1">
              {trendLabel}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * Feature Card with icon and description
 */
export function FeatureCard({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  className = '',
  ...props
}) {
  return (
    <Card hoverable className={className} {...props}>
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 bg-primary-50 rounded-xl">
            <Icon className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        
        {action && (
          <Button
            onClick={action}
            variant="outline"
            size="sm"
            fullWidth
          >
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}

/**
 * Item Card for lists
 */
export function ItemCard({
  title,
  subtitle,
  description,
  image,
  badge,
  actions,
  onClick,
  className = '',
  ...props
}) {
  return (
    <Card
      onClick={onClick}
      hoverable
      clickable={!!onClick}
      className={className}
      {...props}
    >
      <div className="p-5">
        <div className="flex gap-4">
          {/* Image/Avatar */}
          {image && (
            <div className="flex-shrink-0">
              {typeof image === 'string' ? (
                <img
                  src={image}
                  alt={title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  {image}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 truncate">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-sm text-gray-500 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
              {badge && (
                <div className="flex-shrink-0">
                  {badge}
                </div>
              )}
            </div>

            {description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {description}
              </p>
            )}

            {/* Actions */}
            {actions && (
              <div className="flex gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * Expandable Card
 */
export function CollapsibleCard({
  title,
  children,
  defaultExpanded = false,
  icon: Icon,
  badge,
  className = '',
  ...props
}) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  return (
    <Card className={className} {...props}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors rounded-t-2xl"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 bg-primary-50 rounded-lg">
              <Icon className="w-5 h-5 text-primary-600" />
            </div>
          )}
          <h3 className="text-lg font-bold text-gray-900">
            {title}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {badge}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 border-t border-gray-100">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// Import dependencies
import Button from './Button.enhanced';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
