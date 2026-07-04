// Dev: relative base; proxy.conf.js forwards /api/* to BACKEND_URL (from .env).
export const environment = {
  production: false,
  apiUrl: '/api',
  backendUrl: '/',
};
