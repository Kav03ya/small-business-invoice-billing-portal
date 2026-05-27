import { useState } from 'react';

import { useNavigate, Link } from 'react-router-dom';

import { register } from '../services/authService';

export default function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    business_name: ''
  });

  const [error, setError] = useState('');

  const [success, setSuccess] = useState('');

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

      await register(form);

      setSuccess('Account created! Redirecting to login...');

      setTimeout(() => {

        navigate('/login');

      }, 2000);

    } catch (err) {

      setError(
        err.response?.data?.error
        || 'Registration failed. Try again.'
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-light flex items-center justify-center">

      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md">

        <h1 className="text-3xl font-bold text-primary mb-1">
          Create Account
        </h1>

        <p className="text-gray-500 mb-6 text-sm">
          Start managing your invoices today
        </p>

        {error && (

          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (

          <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />

          </div>

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

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>

            <input
              type="text"
              name="business_name"
              value={form.business_name}
              onChange={handleChange}
              placeholder="John's Agency"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-secondary transition disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

        </form>

        <p className="text-center text-sm text-gray-500 mt-6">

          Already have an account?

          {' '}

          <Link
            to="/login"
            className="text-primary font-semibold hover:underline"
          >
            Login here
          </Link>

        </p>

      </div>

    </div>
  );
}