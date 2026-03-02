import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ArrowUpDown, Search } from 'lucide-react';
import EmptyState, { ErrorState } from './EmptyState';
import { TableSkeleton } from './Skeleton.enhanced';

/**
 * Enhanced Table with accessibility, sorting, and better UX
 * Features:
 * - ARIA labels and roles
 * - Keyboard navigation
 * - Column sorting
 * - Row selection
 * - Empty and error states
 * - Responsive design
 * - Smooth animations
 */
export default function Table({ 
  columns, 
  data, 
  onRowClick,
  loading = false,
  error = null,
  onRetry,
  emptyState,
  emptyMessage = 'No data available',
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  sortable = false,
  onSort,
  className = '',
  ariaLabel = 'Data table',
  stickyHeader = true,
  striped = false,
  hoverable = true
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (columnKey) => {
    if (!sortable || !columnKey) return;

    const direction = 
      sortConfig.key === columnKey && sortConfig.direction === 'asc' 
        ? 'desc' 
        : 'asc';
    
    setSortConfig({ key: columnKey, direction });
    
    if (onSort) {
      onSort(columnKey, direction);
    }
  };

  const handleRowSelect = (row) => {
    if (!selectable || !onSelectionChange) return;

    const isSelected = selectedRows.some(r => r.id === row.id);
    const newSelection = isSelected
      ? selectedRows.filter(r => r.id !== row.id)
      : [...selectedRows, row];
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (!selectable || !onSelectionChange) return;

    const allSelected = selectedRows.length === data.length;
    onSelectionChange(allSelected ? [] : [...data]);
  };

  // Loading state
  if (loading) {
    return <TableSkeleton rows={5} cols={columns.length} />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Failed to load data"
        description={error.message || "We encountered an error while loading the table data."}
        onRetry={onRetry}
        error={error}
        showDetails={process.env.NODE_ENV === 'development'}
      />
    );
  }

  // Empty state
  if (data.length === 0) {
    if (emptyState) {
      return emptyState;
    }
    return (
      <EmptyState
        title="No data found"
        description={emptyMessage}
      />
    );
  }

  return (
    <div className={`relative overflow-x-auto ${className}`}>
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm">
          <table 
            className="min-w-full divide-y divide-gray-100"
            role="table"
            aria-label={ariaLabel}
          >
            {/* Table Header */}
            <thead 
              className={`bg-gray-50/70 backdrop-blur-sm ${stickyHeader ? 'sticky top-0 z-10' : ''}`}
              role="rowgroup"
            >
              <tr role="row">
                {/* Checkbox column for selection */}
                {selectable && (
                  <th 
                    scope="col"
                    className="px-6 py-4 w-12"
                    role="columnheader"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRows.length === data.length && data.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 cursor-pointer"
                      aria-label="Select all rows"
                    />
                  </th>
                )}
                
                {/* Column headers */}
                {columns.map((column, index) => (
                  <th
                    key={index}
                    scope="col"
                    className={`
                      px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]
                      ${sortable && column.accessor ? 'cursor-pointer select-none hover:text-gray-600 transition-colors' : ''}
                    `}
                    onClick={() => handleSort(column.accessor)}
                    role="columnheader"
                    aria-sort={
                      sortConfig.key === column.accessor 
                        ? sortConfig.direction === 'asc' ? 'ascending' : 'descending'
                        : 'none'
                    }
                    tabIndex={sortable && column.accessor ? 0 : undefined}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSort(column.accessor);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.header}</span>
                      {sortable && column.accessor && (
                        <span className="text-gray-300" aria-hidden="true">
                          {sortConfig.key === column.accessor ? (
                            sortConfig.direction === 'asc' ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody 
              className="bg-white divide-y divide-gray-50"
              role="rowgroup"
            >
              <AnimatePresence mode="popLayout">
                {data.map((row, rowIndex) => {
                  const isSelected = selectable && selectedRows.some(r => r.id === row.id);
                  const isClickable = onRowClick || selectable;
                  
                  return (
                    <motion.tr
                      key={row.id || rowIndex}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: rowIndex * 0.03 }}
                      onClick={() => {
                        if (selectable) handleRowSelect(row);
                        if (onRowClick) onRowClick(row);
                      }}
                      className={`
                        group transition-all duration-200
                        ${isClickable ? 'cursor-pointer' : ''}
                        ${hoverable && isClickable ? 'hover:bg-primary-50/30' : striped && rowIndex % 2 === 1 ? 'bg-gray-50/30' : ''}
                        ${isSelected ? 'bg-primary-100/50' : ''}
                        focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-inset
                      `}
                      role="row"
                      tabIndex={isClickable ? 0 : undefined}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          if (selectable) handleRowSelect(row);
                          if (onRowClick) onRowClick(row);
                        }
                      }}
                      aria-selected={isSelected}
                    >
                      {/* Checkbox cell */}
                      {selectable && (
                        <td className="px-6 py-4 w-12" role="cell">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleRowSelect(row);
                            }}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 cursor-pointer"
                            aria-label={`Select row ${rowIndex + 1}`}
                          />
                        </td>
                      )}
                      
                      {/* Data cells */}
                      {columns.map((column, colIndex) => (
                        <td 
                          key={colIndex} 
                          className="px-6 py-4 whitespace-nowrap"
                          role="cell"
                        >
                          <div className="text-sm text-gray-600 transition-colors group-hover:text-gray-900">
                            {column.render ? column.render(row) : (
                              <span className="font-medium text-gray-900">
                                {row[column.accessor]}
                              </span>
                            )}
                          </div>
                        </td>
                      ))}
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact Table variant for smaller spaces
 */
export function CompactTable({ columns, data, ...props }) {
  return (
    <Table
      columns={columns}
      data={data}
      className="[&_th]:py-2 [&_td]:py-2 [&_th]:px-4 [&_td]:px-4 text-xs"
      {...props}
    />
  );
}

/**
 * Card Table for mobile-responsive layout
 */
export function CardTable({ columns, data, loading, error, onRetry, emptyState }) {
  if (loading) {
    return <TableSkeleton rows={3} cols={1} />;
  }

  if (error) {
    return <ErrorState onRetry={onRetry} error={error} />;
  }

  if (data.length === 0) {
    return emptyState || <EmptyState />;
  }

  return (
    <div className="space-y-3">
      {data.map((row, index) => (
        <motion.div
          key={row.id || index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          {columns.map((column, colIndex) => (
            <div key={colIndex} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {column.header}
              </span>
              <span className="text-sm text-gray-900 font-medium">
                {column.render ? column.render(row) : row[column.accessor]}
              </span>
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}
