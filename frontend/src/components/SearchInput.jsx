import React from 'react';
import { Search } from 'lucide-react';

/**
 * Reusable search input component
 */
export const SearchInput = ({ value, onChange, placeholder = 'Search...', className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 rounded-xl text-sm transition-all"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};
