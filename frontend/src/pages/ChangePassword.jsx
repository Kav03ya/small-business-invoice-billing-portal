import { useState } from 'react';

import Navbar from '../components/Navbar';

import { changePassword } from '../services/authService';

export default function ChangePassword() {

  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [error, setError] = useState('');

  const [success, setSuccess] = useState('');

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');

    setSuccess('');

    try {

      const res = await changePassword(form);

      setSuccess(res.data.message);

      setForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });

    } catch (err) {

      setError(
        err.response?.data?.error ||
        'Failed to change password.'
      );
    }
  };

  return (

    <div className="min-h-screen bg-light">

      <Navbar />

      <div className="max-w-xl mx-auto p-8">

        <div className="bg-white rounded-2xl shadow p-6">

          <h1 className="text-3xl font-bold text-primary mb-6">
            Change Password
          </h1>

          {error && (

            <div className="bg-red-100 text-red-700 border border-red-300 rounded-lg p-3 mb-4">
              {error}
            </div>

          )}

          {success && (

            <div className="bg-green-100 text-green-700 border border-green-300 rounded-lg p-3 mb-4">
              {success}
            </div>

          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >

            <input
              type="password"
              name="current_password"
              value={form.current_password}
              onChange={handleChange}
              placeholder="Current Password"
              required
              className="w-full border rounded-lg px-4 py-2"
            />

            <input
              type="password"
              name="new_password"
              value={form.new_password}
              onChange={handleChange}
              placeholder="New Password"
              required
              className="w-full border rounded-lg px-4 py-2"
            />

            <input
              type="password"
              name="confirm_password"
              value={form.confirm_password}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
              className="w-full border rounded-lg px-4 py-2"
            />

            <button
              type="submit"
              className="bg-primary text-white px-6 py-2 rounded-lg"
            >
              Update Password
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}