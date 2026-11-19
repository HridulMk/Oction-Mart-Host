import { useState, useCallback } from 'react';

interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export const useApiError = () => {
  const [error, setError] = useState<ApiError | null>(null);

  const handleError = useCallback((error: any) => {
    let apiError: ApiError;

    if (error.response) {
      // Server responded with error status
      apiError = {
        message: error.response.data?.message || error.response.data?.error || 'An error occurred',
        status: error.response.status,
        code: error.response.data?.code
      };
    } else if (error.request) {
      // Network error
      apiError = {
        message: 'Network error. Please check your connection.',
        status: 0
      };
    } else {
      // Other error
      apiError = {
        message: error.message || 'An unexpected error occurred',
        status: 0
      };
    }

    setError(apiError);
    return apiError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
};
