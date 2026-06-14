import api from './api';

export const getInvoices = (status = '') =>
  api.get(`/invoices.php${status ? '?status=' + status : ''}`);

export const getInvoice = (id) =>
  api.get(`/invoices.php?id=${id}`);

export const createInvoice = (data) =>
  api.post('/invoices.php', data);

export const updateInvoice = (id, data) =>
  api.put(`/invoices.php?id=${id}`, data);

export const deleteInvoice = (id) =>
  api.delete(`/invoices.php?id=${id}`);

// export const getDashboard = () =>
//   api.get('/dashboard.php');
//Adding this for better revenue dispay (last 30 dyas, 6 months, 1 year)
export const getDashboard = (period = '6months') =>
  api.get(`/dashboard.php?period=${period}`);

export const getPayments = (invoice_id) =>
  api.get(`/payments.php?invoice_id=${invoice_id}`);

export const recordPayment = (data) =>
  api.post('/payments.php', data);
export const sendReminderEmail = (data) =>
  api.post('/send_reminder_email.php', data);