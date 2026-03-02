import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { IconButton } from './Button.enhanced';

/**
 * Enhanced Modal with accessibility and keyboard navigation
 * Features:
 * - Focus trap
 * - ESC to close
 * - Click outside to close
 * - ARIA labels and roles
 * - Smooth animations
 * - Mobile responsive
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnClickOutside = true,
  closeOnEsc = true,
  className = '',
  ariaLabel,
  footer,
  ...props
}) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Size variants
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl mx-4'
  };

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the element that was focused before opening
      previousActiveElement.current = document.activeElement;
      
      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus when closing
      previousActiveElement.current?.focus();
      
      // Restore body scroll
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, closeOnEsc, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener('keydown', handleTab);
    return () => window.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={closeOnClickOutside ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
              <motion.div
                ref={modalRef}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className={`
                  relative w-full ${sizeClasses[size]}
                  bg-white rounded-2xl shadow-2xl
                  ${className}
                `}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                aria-describedby={description ? "modal-description" : undefined}
                aria-label={ariaLabel}
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
                {...props}
              >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-gray-100">
                  <div className="flex-1 pr-8">
                    {title && (
                      <h2 
                        id="modal-title"
                        className="text-xl font-bold text-gray-900"
                      >
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p 
                        id="modal-description"
                        className="mt-1 text-sm text-gray-500"
                      >
                        {description}
                      </p>
                    )}
                  </div>

                  {/* Close Button */}
                  {showCloseButton && (
                    <IconButton
                      icon={<X className="w-5 h-5" />}
                      onClick={onClose}
                      variant="ghost"
                      ariaLabel="Close modal"
                      className="text-gray-400 hover:text-gray-600 -mr-2 -mt-2"
                    />
                  )}
                </div>

                {/* Content */}
                <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
                  {children}
                </div>

                {/* Footer */}
                {footer && (
                  <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    {footer}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Confirmation Modal
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  ...props
}) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button
            onClick={onClose}
            variant="outline"
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            variant={variant}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
      {...props}
    />
  );
}

/**
 * Drawer Modal (slides from side)
 */
export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  size = 'md',
  showCloseButton = true,
  className = '',
  ...props
}) {
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.body.style.overflow = 'hidden';
    } else {
      previousActiveElement.current?.focus();
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: position === 'top' || position === 'bottom' ? 'h-1/3' : 'w-80',
    md: position === 'top' || position === 'bottom' ? 'h-1/2' : 'w-96',
    lg: position === 'top' || position === 'bottom' ? 'h-2/3' : 'w-[32rem]',
    full: position === 'top' || position === 'bottom' ? 'h-full' : 'w-full'
  };

  const positionClasses = {
    left: 'left-0 top-0 bottom-0',
    right: 'right-0 top-0 bottom-0',
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0'
  };

  const slideVariants = {
    left: { x: '-100%' },
    right: { x: '100%' },
    top: { y: '-100%' },
    bottom: { y: '100%' }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={slideVariants[position]}
            animate={{ x: 0, y: 0 }}
            exit={slideVariants[position]}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
              fixed ${positionClasses[position]} ${sizeClasses[size]}
              bg-white shadow-2xl z-50
              flex flex-col
              ${className}
            `}
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            {...props}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 id="drawer-title" className="text-xl font-bold text-gray-900">
                {title}
              </h2>
              {showCloseButton && (
                <IconButton
                  icon={<X className="w-5 h-5" />}
                  onClick={onClose}
                  variant="ghost"
                  ariaLabel="Close drawer"
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Import Button separately to avoid circular dependency
import Button from './Button.enhanced';
