import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export default function Table({ columns, data, onRowClick, emptyMessage = 'No data available' }) {
  const [isMobileView, setIsMobileView] = useState(false);

  // Check if we're on mobile
  React.useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile Card View
  if (isMobileView && data.length > 0) {
    return (
      <div className="space-y-3 p-4">
        {data.map((row, rowIndex) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rowIndex * 0.05 }}
            key={row.id || rowIndex}
            onClick={() => onRowClick && onRowClick(row)}
            className={`
              bg-white border border-gray-200 rounded-xl p-4 space-y-3
              transition-all duration-200
              ${onRowClick ? 'hover:border-primary-300 hover:shadow-md cursor-pointer' : 'hover:shadow-sm'}
            `}
          >
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="flex justify-between items-start gap-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider min-w-[100px]">
                  {column.header}
                </span>
                <div className="text-sm text-gray-900 font-medium text-right flex-1">
                  {column.render ? column.render(row) : row[column.accessor]}
                </div>
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    );
  }

  // Desktop Table View
  return (
    <div className="relative overflow-x-auto border border-gray-100 rounded-2xl">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50/50 backdrop-blur-sm sticky top-0 z-10">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-50">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <p className="text-sm font-medium">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <motion.tr
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: rowIndex * 0.03 }}
                key={row.id || rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={`
                  group transition-all duration-200
                  ${onRowClick ? 'hover:bg-primary-50/30 cursor-pointer' : 'hover:bg-gray-50/50'}
                `}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 transition-colors group-hover:text-gray-900">
                      {column.render ? column.render(row) : (
                        <span className="font-medium text-gray-900">{row[column.accessor]}</span>
                      )}
                    </div>
                  </td>
                ))}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string.isRequired,
      accessor: PropTypes.string,
      render: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  onRowClick: PropTypes.func,
  emptyMessage: PropTypes.string,
};

Table.defaultProps = {
  emptyMessage: 'No data available',
};
