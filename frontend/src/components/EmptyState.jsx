import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { 
  FileQuestion, 
  BookOpen, 
  Users, 
  Calendar,
  Search,
  Plus,
  Inbox,
  PackageOpen,
  AlertCircle
} from 'lucide-react';
import Button from './Button';

/**
 * Empty State Component with CTAs
 * Enterprise-grade empty states with proper accessibility
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'Get started by creating a new item.',
  action,
  actionLabel = 'Create New',
  secondaryAction,
  secondaryActionLabel,
  illustration,
  className = ''
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Icon or Illustration */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="relative mb-6"
      >
        {illustration ? (
          <div className="w-48 h-48">{illustration}</div>
        ) : (
          <div className="relative">
            <div className="absolute inset-0 bg-primary-100 rounded-full blur-2xl opacity-30" />
            <div className="relative bg-gradient-to-br from-primary-50 to-primary-100 rounded-full p-6">
              <Icon className="w-16 h-16 text-primary-600" strokeWidth={1.5} />
            </div>
          </div>
        )}
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-md space-y-3"
      >
        <h3 className="text-xl font-bold text-gray-900">
          {title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          {description}
        </p>
      </motion.div>

      {/* Actions */}
      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-3 mt-8 justify-center"
        >
          {action && (
            <Button
              onClick={action}
              className="shadow-lg shadow-primary-500/20"
              icon={<Plus className="w-4 h-4" />}
              aria-label={actionLabel}
            >
              {actionLabel}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction}
              variant="outline"
              aria-label={secondaryActionLabel}
            >
              {secondaryActionLabel}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.func,
  actionLabel: PropTypes.string,
  secondaryAction: PropTypes.func,
  secondaryActionLabel: PropTypes.string,
  illustration: PropTypes.node,
  className: PropTypes.string,
};

EmptyState.defaultProps = {
  icon: Inbox,
  title: 'No items found',
  description: 'Get started by creating a new item.',
  actionLabel: 'Create New',
  className: '',
};

/**
 * Specific Empty States for different contexts
 */

export function EmptyBooksState({ onAddBook }) {
  return (
    <EmptyState
      icon={BookOpen}
      title="No books in the library"
      description="Start building your collection by adding your first book. You can add details like title, author, ISBN, and available copies."
      action={onAddBook}
      actionLabel="Add First Book"
      secondaryActionLabel="Import from File"
    />
  );
}

export function EmptyLoansState({ onCreateLoan }) {
  return (
    <EmptyState
      icon={Calendar}
      title="No active loans"
      description="There are currently no books checked out. Issue a new loan to get started with circulation tracking."
      action={onCreateLoan}
      actionLabel="Issue New Loan"
    />
  );
}

export function EmptyUsersState({ onAddUser }) {
  return (
    <EmptyState
      icon={Users}
      title="No users registered"
      description="Add library members and staff to manage access and track book circulation. Start by creating your first user account."
      action={onAddUser}
      actionLabel="Add First User"
      secondaryActionLabel="Invite Members"
    />
  );
}

export function EmptySearchState({ searchTerm, onClearSearch }) {
  return (
    <EmptyState
      icon={Search}
      title={`No results for "${searchTerm}"`}
      description="We couldn't find any matches. Try adjusting your search terms or clear the search to see all items."
      action={onClearSearch}
      actionLabel="Clear Search"
    />
  );
}

export function EmptyMyLoansState() {
  return (
    <EmptyState
      icon={PackageOpen}
      title="No books borrowed"
      description="You haven't borrowed any books yet. Browse the library catalogue to find your next great read."
      actionLabel="Browse Books"
    />
  );
}

/**
 * Error State Component with retry functionality
 */
export function ErrorState({
  title = 'Something went wrong',
  description = 'We encountered an error while loading this content. Please try again.',
  onRetry,
  error,
  showDetails = false,
  className = ''
}) {
  const [showErrorDetails, setShowErrorDetails] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}
      role="alert"
      aria-live="assertive"
    >
      {/* Error Icon */}
      <motion.div
        initial={{ scale: 0.8, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="relative mb-6"
      >
        <div className="absolute inset-0 bg-red-100 rounded-full blur-2xl opacity-30" />
        <div className="relative bg-gradient-to-br from-red-50 to-red-100 rounded-full p-6">
          <AlertCircle className="w-16 h-16 text-red-600" strokeWidth={1.5} />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="max-w-md space-y-3"
      >
        <h3 className="text-xl font-bold text-gray-900">
          {title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          {description}
        </p>
      </motion.div>

      {/* Retry Button */}
      {onRetry && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <Button
            onClick={onRetry}
            className="shadow-lg"
            aria-label="Retry loading content"
          >
            Try Again
          </Button>
        </motion.div>
      )}

      {/* Error Details (for development) */}
      {showDetails && error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 w-full max-w-lg"
        >
          <button
            onClick={() => setShowErrorDetails(!showErrorDetails)}
            className="text-sm text-gray-500 hover:text-gray-700 underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
            aria-expanded={showErrorDetails}
            aria-controls="error-details"
          >
            {showErrorDetails ? 'Hide' : 'Show'} Error Details
          </button>
          
          {showErrorDetails && (
            <motion.pre
              id="error-details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 p-4 bg-gray-50 rounded-lg text-left text-xs text-red-600 overflow-auto max-h-48"
              role="status"
            >
              {error?.message || JSON.stringify(error, null, 2)}
            </motion.pre>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Network Error State
 */
export function NetworkErrorState({ onRetry }) {
  return (
    <ErrorState
      title="Connection Error"
      description="Unable to connect to the server. Please check your internet connection and try again."
      onRetry={onRetry}
    />
  );
}

/**
 * Permission Error State
 */
export function PermissionErrorState() {
  return (
    <ErrorState
      title="Access Denied"
      description="You don't have permission to view this content. Please contact your administrator if you believe this is an error."
      onRetry={null}
    />
  );
}
