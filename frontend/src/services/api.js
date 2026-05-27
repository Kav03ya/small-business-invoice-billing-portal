import axios from 'axios';

const api = axios.create({
  baseURL: 'https://invoiceportalapp.infinityfreeapp.com/backend/api',

  withCredentials: true,

  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;