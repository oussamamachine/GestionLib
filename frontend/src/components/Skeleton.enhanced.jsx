import React from 'react';
import { motion } from 'framer-motion';

/**
 * Enhanced Skeleton loader with shimmer effect
 * Accessibility: Includes aria-label for screen readers
 */
export default function Skeleton({ className, ariaLabel = 'Loading content', ...props }) {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={`relative overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700 ${className}`}
      {...props}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{
          translateX: ['100%', '100%'],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'linear',
        }}
      />
    </div>
  );
}

/**
 * Enhanced Table Skeleton with staggered animation
 */
export function TableSkeleton({ rows = 5, cols = 4, className = '' }) {
  return (
    <div className={`w-full space-y-4 ${className}`} role="status" aria-label="Loading table data">
      {/* Header */}
      <div className="flex gap-4 mb-6">
        {[...Array(cols)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex-1"
          >
            <Skeleton className="h-8" ariaLabel={`Loading column ${i + 1} header`} />
          </motion.div>
        ))}
      </div>
      
      {/* Rows */}
      {[...Array(rows)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex gap-4"
        >
          {[...Array(cols)].map((_, j) => (
            <Skeleton key={j} className="h-16 flex-1" ariaLabel={`Loading row ${i + 1} cell ${j + 1}`} />
          ))}
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Enhanced Stats Cards Skeleton
 */
export function StatsSkeleton({ count = 4, className = '' }) {
  return (
    <div 
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
      role="status"
      aria-label="Loading statistics"
    >
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="relative"
        >
          <Skeleton className="h-32 w-full rounded-xl" ariaLabel={`Loading statistic ${i + 1}`} />
          {/* Icon placeholder */}
          <div className="absolute top-6 left-6">
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
          {/* Text placeholders */}
          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Card Content Skeleton
 */
export function CardSkeleton({ lines = 3, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`space-y-4 p-6 ${className}`}
      role="status"
      aria-label="Loading card content"
    >
      <Skeleton className="h-6 w-3/4" />
      {[...Array(lines)].map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" style={{ width: `${100 - i * 10}%` }} />
      ))}
    </motion.div>
  );
}

/**
 * List Skeleton for vertical lists
 */
export function ListSkeleton({ items = 5, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`} role="status" aria-label="Loading list items">
      {[...Array(items)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          className="flex items-center gap-4 p-4 bg-white rounded-lg"
        >
          <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Form Skeleton
 */
export function FormSkeleton({ fields = 4, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`space-y-6 ${className}`}
      role="status"
      aria-label="Loading form"
    >
      {[...Array(fields)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <div className="flex gap-3 justify-end pt-4">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </motion.div>
  );
}
