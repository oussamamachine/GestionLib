import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { handleApiError } from '../utils/errorHandler';

/**
 * Generic data fetching hook with loading and error states
 * @param {string} url - API endpoint
 * @param {object} options - Optional config { skip, params, dependencies }
 * @returns {object} { data, loading, error, refetch }
 */
export function useFetch(url, options = {}) {
  const { skip = false, params = {}, dependencies = [] } = options;
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (skip) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(url, { params });
      setData(response.data);
      return response.data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [url, skip, JSON.stringify(params)]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  const refetch = useCallback(() => fetchData(), [fetchData]);

  return { data, loading, error, refetch };
}

/**
 * Hook for mutations (POST, PUT, DELETE)
 * @returns {object} { mutate, loading, error }
 */
export function useMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (method, url, data = null, config = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api[method](url, data, config);
      return response.data;
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}
