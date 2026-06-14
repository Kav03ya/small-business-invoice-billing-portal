import { useState } from 'react';

import { useNavigate, Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

export default function Login() {

  const { login } = useAuth();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    setError('');

    try {

      await login(form);

      navigate('/');

    } catch (err) {

      setError(
        err.response?.data?.error
        || 'Login failed. Please try again.'
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-light flex items-center justify-center">

      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">


        <div className="text-center mb-8">

          <h1 className="text-4xl font-extrabold text-primary mb-2">
            Invoice Portal
          </h1>

          <p className="text-gray-500 text-sm mb-6">
            Simplifying Client, Invoice and Payment Management
          </p>

          <h2 className="text-2xl font-bold text-primary mb-1">
            Welcome Back
          </h2>

          <p className="text-gray-500 text-sm">
            Login to continue
          </p>

        </div>

        {error && (

          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="john@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />

          </div>

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-secondary transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>

        <p className="text-center text-sm text-gray-500 mt-6">

          Don't have an account?

          {' '}

          <Link
            to="/register"
            className="text-primary font-semibold hover:underline"
          >
            Register here
          </Link>

        </p>

      </div>

    </div>
  );
}