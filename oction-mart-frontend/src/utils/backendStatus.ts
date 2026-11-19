// Utility to check backend availability
import { config } from '@/config/environment';

export const checkBackendStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${config.API_BASE_URL}/health/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Short timeout to avoid hanging
      signal: AbortSignal.timeout(3000),
    });
    return response.ok;
  } catch (error) {
    console.log('Backend not available:', error);
    return false;
  }
};

export const isBackendAvailable = async (): Promise<boolean> => {
  // Check if we're in development mode
  if (process.env.NODE_ENV === 'development') {
    return await checkBackendStatus();
  }
  // In production, assume backend is available
  return true;
};
