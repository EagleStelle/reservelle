// Dev: relative base; proxy.conf.js forwards /lpu-reservation-system/* and
// /uploads/* to BACKEND_URL (read from .env).
export const environment = {
  production: false,
  apiUrl: '/lpu-reservation-system/api',
  // Backend root for assets outside the API context (e.g. /uploads).
  backendUrl: '/',
};
