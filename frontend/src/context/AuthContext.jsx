import { createContext, useContext, useState } from 'react';

import {
  login as loginAPI,
  logout as logoutAPI
} from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  );

  const login = async (credentials) => {

    const res = await loginAPI(credentials);

    setUser(res.data.user);

    localStorage.setItem(
      'user',
      JSON.stringify(res.data.user)
    );

    return res;
  };

  const logout = async () => {

    await logoutAPI();

    setUser(null);

    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () =>
  useContext(AuthContext);