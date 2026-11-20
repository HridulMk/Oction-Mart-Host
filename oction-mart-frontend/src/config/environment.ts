const configuredApiUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://oction-mart-host.onrender.com/api';
const normalizedApiUrl = configuredApiUrl.trim().replace(/\/+$/, '');
const apiBaseUrl = /\/api$/i.test(normalizedApiUrl)
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`;

export const config = {
  API_BASE_URL: apiBaseUrl,
  API_ORIGIN: apiBaseUrl.replace(/\/api$/i, ''),
  AUTH_TOKEN_KEY: process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'authToken',
  USER_KEY: process.env.NEXT_PUBLIC_USER_KEY || 'user',
} as const;

export const backendAssetUrl = (path: string): string => {
  if (/^https?:\/\//i.test(path)) return path;
  return `${config.API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
};
