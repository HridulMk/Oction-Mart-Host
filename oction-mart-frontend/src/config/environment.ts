// Environment configuration
export const config = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
  AUTH_TOKEN_KEY: process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'authToken',
  USER_KEY: process.env.NEXT_PUBLIC_USER_KEY || 'user',
} as const;
