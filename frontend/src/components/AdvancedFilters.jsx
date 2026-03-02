import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  X, 
  Calendar, 
  BookOpen, 
  Tag, 
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Search
} from 'lucide-react';

/**
 * Advanced Filtering System
 * Supports multiple filter types with real-time preview
 */
export default function AdvancedFilters({ 
  onApply, 
  onClear, 
  filterConfig = {},
  activeFilters = {}
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState(activeFilters);

  const handleApply = () => {
    onApply(filters);
    setIsOpen(false);
  };

  const handleClear = () => {
    setFilters({});
    onClear();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const activeFilterCount = Object.values(filters).filter(v => 
    v !== null && v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0)
  ).length;

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
          activeFilterCount > 0
            ? 'bg-primary-600 text-white hover:bg-primary-700'
            : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-200 hover:bg-primary-50'
        }`}
      >
        <Filter className="w-4 h-4" />
        <span className="hidden sm:inline">Filters</span>
        {activeFilterCount > 0 && (
          <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 z-40"
            />

            {/* Filter Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-bold text-gray-900">Advanced Filters</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Options */}
              <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
                {/* Status Filter */}
                {filterConfig.status && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Status
                    </label>
                    <div className="space-y-2">
                      {[
                        { value: 'all', label: 'All', icon: BookOpen },
                        { value: 'active', label: 'Active', icon: Clock },
                        { value: 'overdue', label: 'Overdue', icon: AlertCircle },
                        { value: 'returned', label: 'Returned', icon: CheckCircle }
                      ].map(({ value, label, icon: Icon }) => (
                        <label
                          key={value}
                          className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-all"
                        >
                          <input
                            type="radio"
                            name="status"
                            value={value}
                            checked={filters.status === value}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="text-primary-600 focus:ring-primary-500"
                          />
                          <Icon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Filter */}
                {filterConfig.category && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Category
                    </label>
                    <select
                      value={filters.category || ''}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                      <option value="">All Categories</option>
                      {filterConfig.categories?.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Date Range Filter */}
                {filterConfig.dateRange && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Date Range
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">From</label>
                        <input
                          type="date"
                          value={filters.dateFrom || ''}
                          onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">To</label>
                        <input
                          type="date"
                          value={filters.dateTo || ''}
                          onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* User Role Filter (Admin only) */}
                {filterConfig.userRole && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <Users className="w-4 h-4 inline mr-2" />
                      User Role
                    </label>
                    <div className="space-y-2">
                      {['All', 'Admin', 'Librarian', 'Member'].map(role => (
                        <label
                          key={role}
                          className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={filters.roles?.includes(role) || false}
                            onChange={(e) => {
                              const roles = filters.roles || [];
                              handleFilterChange(
                                'roles',
                                e.target.checked
                                  ? [...roles, role]
                                  : roles.filter(r => r !== role)
                              );
                            }}
                            className="text-primary-600 focus:ring-primary-500 rounded"
                          />
                          <span className="text-sm font-medium text-gray-900">{role}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Availability Filter */}
                {filterConfig.availability && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Availability
                    </label>
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        checked={filters.availableOnly || false}
                        onChange={(e) => handleFilterChange('availableOnly', e.target.checked)}
                        className="text-primary-600 focus:ring-primary-500 rounded"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        Show available books only
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={handleClear}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold text-sm transition-all"
                >
                  Clear All
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 px-4 py-2.5 text-white bg-primary-600 hover:bg-primary-700 rounded-xl font-semibold text-sm transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Active Filters Display
 * Shows applied filters as chips
 */
export function ActiveFiltersDisplay({ filters, onRemove, onClearAll }) {
  const filterChips = [];

  Object.entries(filters).forEach(([key, value]) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return;

    if (Array.isArray(value)) {
      value.forEach(v => {
        filterChips.push({ key, value: v, label: `${key}: ${v}` });
      });
    } else if (value !== 'all') {
      filterChips.push({ key, value, label: `${key}: ${value}` });
    }
  });

  if (filterChips.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-2"
    >
      <span className="text-sm font-semibold text-gray-600">Active filters:</span>
      {filterChips.map((chip, index) => (
        <motion.span
          key={index}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
        >
          {chip.label}
          <button
            onClick={() => onRemove(chip.key, chip.value)}
            className="hover:bg-primary-200 rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </motion.span>
      ))}
      <button
        onClick={onClearAll}
        className="text-sm text-gray-500 hover:text-gray-700 font-medium underline"
      >
        Clear all
      </button>
    </motion.div>
  );
}
