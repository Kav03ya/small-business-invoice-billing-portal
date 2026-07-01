import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://localhost:8080/invoice-portal/backend/api',
  baseURL: 'https://invoiceportal.alwaysdata.net/api',
  withCredentials: true,
});

let sessionExpired = false;

api.interceptors.response.use(
  (response) => response,

  (error) => {

    const url = error.config?.url || '';

    if (
      error.response?.status === 401 &&
      !url.includes('auth.php?action=login') &&
      !sessionExpired
    ) {

      sessionExpired = true;

      alert(
        'Your session has expired. Please login again.'
      );

      localStorage.removeItem('user');

      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);
export default api;