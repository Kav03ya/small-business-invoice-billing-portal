import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Clients from '../pages/Clients';
import Invoices from '../pages/Invoices';
import CreateInvoice from '../pages/CreateInvoice';
import InvoiceDetail from '../pages/InvoiceDetail';

function PrivateRoute({ children }) {

  const { user } = useAuth();

  return user
    ? children
    : <Navigate to="/login" />;
}

export default function AppRoutes() {

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/clients"
          element={
            <PrivateRoute>
              <Clients />
            </PrivateRoute>
          }
        />

        <Route
          path="/invoices"
          element={
            <PrivateRoute>
              <Invoices />
            </PrivateRoute>
          }
        />

        <Route
          path="/invoices/new"
          element={
            <PrivateRoute>
              <CreateInvoice />
            </PrivateRoute>
          }
        />

        <Route
          path="/invoices/:id"
          element={
            <PrivateRoute>
              <InvoiceDetail />
            </PrivateRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}