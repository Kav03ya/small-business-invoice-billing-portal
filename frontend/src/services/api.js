import axios from 'axios';

const api = axios.create({
  baseURL: 'https://invoiceportalapp.infinityfreeapp.com/backend/api',
});

export default api;