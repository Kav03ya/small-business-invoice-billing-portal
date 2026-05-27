import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export default function Navbar() {

  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async () => {

    await logout();

    navigate('/login');
  };

  return (

    <nav className="bg-primary text-white px-6 py-4 flex justify-between items-center shadow-md">

      <Link
        to="/"
        className="text-xl font-bold tracking-wide"
      >
        InvoicePortal
      </Link>

      <div className="flex gap-6 items-center text-sm font-medium">

        <Link
          to="/"
          className="hover:text-blue-200 transition"
        >
          Dashboard
        </Link>

        <Link
          to="/clients"
          className="hover:text-blue-200 transition"
        >
          Clients
        </Link>

        <Link
          to="/invoices"
          className="hover:text-blue-200 transition"
        >
          Invoices
        </Link>

        <Link
          to="/invoices/new"
          className="bg-white text-primary px-3 py-1 rounded-full hover:bg-blue-100 transition"
        >
          + New Invoice
        </Link>

        <span className="text-blue-200">
          | {user?.name}
        </span>

        <button
          onClick={handleLogout}
          className="hover:text-red-300 transition"
        >
          Logout
        </button>

      </div>

    </nav>
  );
}