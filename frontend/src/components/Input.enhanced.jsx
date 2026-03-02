import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle, Info } from 'lucide-react';

/**
 * Enhanced Input component with accessibility and validation
 * Features:
 * - ARIA labels and descriptions
 * - Keyboard navigation
 * - Visual feedback for states (error, success, disabled)
 * - Password visibility toggle
 * - Character counter
 * - Smooth animations
 */
const Input = forwardRef(({ 
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  success,
  hint,
  disabled = false,
  required = false,
  maxLength,
  showCharCount = false,
  icon,
  iconPosition = 'left',
  className = '',
  inputClassName = '',
  labelClassName = '',
  containerClassName = '',
  autoComplete,
  ariaLabel,
  ariaDescribedBy,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const inputId = name || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const charCountId = `${inputId}-count`;
  
  const isPassword = type === 'password';
  const actualType = isPassword && showPassword ? 'text' : type;
  
  const hasError = !!error;
  const hasSuccess = !!success && !hasError;
  
  // Determine border color and ring
  const borderColor = hasError 
    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' 
    : hasSuccess
    ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500';

  const iconColor = hasError
    ? 'text-rose-400'
    : hasSuccess
    ? 'text-emerald-400'
    : 'text-gray-400';

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className={`block text-sm font-semibold text-gray-700 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-rose-500 ml-1" aria-label="required">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${iconColor} pointer-events-none`}>
            {icon}
          </div>
        )}

        {/* Input Field */}
        <motion.input
          ref={ref}
          id={inputId}
          name={name}
          type={actualType}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          autoComplete={autoComplete}
          aria-label={ariaLabel || label}
          aria-invalid={hasError}
          aria-describedby={[
            error && errorId,
            hint && hintId,
            showCharCount && charCountId,
            ariaDescribedBy
          ].filter(Boolean).join(' ') || undefined}
          className={`
            w-full px-4 py-2.5 text-sm
            border rounded-lg
            transition-all duration-200
            ${borderColor}
            ${icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${icon && iconPosition === 'right' || isPassword ? 'pr-10' : ''}
            ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}
            focus:outline-none focus:ring-2 focus:ring-offset-0
            placeholder:text-gray-400
            ${inputClassName}
          `}
          animate={{
            scale: isFocused ? 1.01 : 1,
          }}
          transition={{ duration: 0.2 }}
          {...props}
        />

        {/* Right Icon or Password Toggle */}
        {(icon && iconPosition === 'right' && !isPassword) && (
          <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${iconColor} pointer-events-none`}>
            {icon}
          </div>
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}

        {/* Status Icon */}
        {(hasError || hasSuccess) && !isPassword && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {hasError && <AlertCircle className="w-5 h-5 text-rose-500" />}
            {hasSuccess && <CheckCircle className="w-5 h-5 text-emerald-500" />}
          </div>
        )}
      </div>

      {/* Helper Text Row */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                id={errorId}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-xs font-medium text-rose-600 flex items-center gap-1"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{error}</span>
              </motion.p>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence mode="wait">
            {success && !error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-xs font-medium text-emerald-600 flex items-center gap-1"
                role="status"
                aria-live="polite"
              >
                <CheckCircle className="w-3 h-3 flex-shrink-0" />
                <span>{success}</span>
              </motion.p>
            )}
          </AnimatePresence>

          {/* Hint Text */}
          {hint && !error && !success && (
            <p
              id={hintId}
              className="text-xs text-gray-500 flex items-center gap-1"
            >
              <Info className="w-3 h-3 flex-shrink-0" />
              <span>{hint}</span>
            </p>
          )}
        </div>

        {/* Character Counter */}
        {showCharCount && maxLength && (
          <p
            id={charCountId}
            className={`text-xs tabular-nums ${
              value?.length >= maxLength ? 'text-rose-600 font-semibold' : 'text-gray-400'
            }`}
            aria-live="polite"
          >
            {value?.length || 0}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

/**
 * Textarea component with character counter
 */
export const Textarea = forwardRef(({ 
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  hint,
  disabled = false,
  required = false,
  rows = 4,
  maxLength,
  showCharCount = true,
  className = '',
  ...props
}, ref) => {
  const textareaId = name || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${textareaId}-error`;
  const hintId = `${textareaId}-hint`;
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={[error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined}
        className={`
          w-full px-4 py-2.5 text-sm
          border rounded-lg
          transition-all duration-200
          ${error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}
          ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}
          focus:outline-none focus:ring-2 focus:ring-offset-0
          placeholder:text-gray-400
          resize-none
        `}
        {...props}
      />

      <div className="flex justify-between items-start">
        <div className="flex-1">
          {error && (
            <motion.p
              id={errorId}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-medium text-rose-600 flex items-center gap-1"
              role="alert"
            >
              <AlertCircle className="w-3 h-3" />
              {error}
            </motion.p>
          )}
          {hint && !error && (
            <p id={hintId} className="text-xs text-gray-500">{hint}</p>
          )}
        </div>

        {showCharCount && maxLength && (
          <p className={`text-xs tabular-nums ${value?.length >= maxLength ? 'text-rose-600 font-semibold' : 'text-gray-400'}`}>
            {value?.length || 0}/{maxLength}
          </p>
        )}
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea';

/**
 * Select component with enhanced styling
 */
export const Select = forwardRef(({ 
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  hint,
  disabled = false,
  required = false,
  placeholder = 'Select an option',
  className = '',
  ...props
}, ref) => {
  const selectId = name || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      <select
        ref={ref}
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`
          w-full px-4 py-2.5 text-sm
          border rounded-lg
          transition-all duration-200
          ${error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'}
          ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}
          focus:outline-none focus:ring-2
          appearance-none cursor-pointer
        `}
        {...props}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-xs text-rose-600 flex items-center gap-1" role="alert">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

/**
 * Checkbox component
 */
export const Checkbox = forwardRef(({ 
  label,
  name,
  checked,
  onChange,
  disabled = false,
  error,
  className = '',
  ...props
}, ref) => {
  const checkboxId = name || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        {label && (
          <label 
            htmlFor={checkboxId} 
            className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'} cursor-pointer`}
          >
            {label}
          </label>
        )}
      </div>
      {error && (
        <p className="text-xs text-rose-600 ml-6" role="alert">{error}</p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
