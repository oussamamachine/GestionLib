import { useState, useCallback } from 'react';

/**
 * Reusable pagination hook
 * @param {number} initialPageSize - Items per page
 * @returns {object} Pagination state and handlers
 */
export function usePagination(initialPageSize = 10) {
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: initialPageSize,
    totalCount: 0,
    totalPages: 0
  });

  const setPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const nextPage = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      page: Math.min(prev.page + 1, prev.totalPages)
    }));
  }, []);

  const prevPage = useCallback(() => {
    setPagination(prev => ({
      ...prev,
      page: Math.max(prev.page - 1, 1)
    }));
  }, []);

  const updatePaginationData = useCallback((data) => {
    setPagination(prev => ({
      ...prev,
      page: data.page,
      totalCount: data.totalCount,
      totalPages: data.totalPages
    }));
  }, []);

  const reset = useCallback(() => {
    setPagination({
      page: 1,
      pageSize: initialPageSize,
      totalCount: 0,
      totalPages: 0
    });
  }, [initialPageSize]);

  return {
    pagination,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    updatePaginationData,
    reset
  };
}
