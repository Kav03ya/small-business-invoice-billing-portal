import api from './api';

export const register = (data) =>
  api.post('/auth.php?action=register', data);

export const login = (data) =>
  api.post('/auth.php?action=login', data);

export const logout = () =>
  api.post('/auth.php?action=logout');

export const changePassword = (data) =>
  api.post('/change_password.php', data);