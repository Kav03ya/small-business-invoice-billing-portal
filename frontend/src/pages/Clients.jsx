import { useEffect, useState } from 'react';

import Navbar from '../components/Navbar';

import {
  getClients,
  createClient,
  deleteClient
} from '../services/clientService';

export default function Clients() {

  const [clients, setClients] = useState([]);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: ''
  });

  useEffect(() => {

    loadClients();

  }, []);

  const loadClients = async () => {

    try {

      const res = await getClients();

      setClients(res.data);

    } catch (err) {

      console.error(err);
    }
  };

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await createClient(form);

      setForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: ''
      });

      loadClients();

    } catch (err) {

      console.error(err);
    }
  };

  const handleDelete = async (id) => {

    if (!window.confirm('Delete this client?')) {
      return;
    }

    try {

      await deleteClient(id);

      loadClients();

    } catch (err) {

      console.error(err);
    }
  };

  return (

    <div className="min-h-screen bg-light">

      <Navbar />

      <div className="p-8">

        <h1 className="text-3xl font-bold text-primary mb-8">
          Clients
        </h1>

        <div className="bg-white rounded-2xl shadow p-6 mb-10">

          <h2 className="text-xl font-bold mb-4">
            Add Client
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Client Name"
              required
              className="border rounded-lg px-4 py-2"
            />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="border rounded-lg px-4 py-2"
            />

            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone"
              className="border rounded-lg px-4 py-2"
            />

            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Company"
              className="border rounded-lg px-4 py-2"
            />

            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Address"
              className="border rounded-lg px-4 py-2 md:col-span-2"
            />

            <button
              type="submit"
              className="bg-primary text-white py-2 rounded-lg font-semibold hover:bg-secondary transition md:col-span-2"
            >
              Save Client
            </button>

          </form>

        </div>

        <div className="bg-white rounded-2xl shadow p-6">

          <h2 className="text-xl font-bold mb-4">
            Client List
          </h2>

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>

                <tr className="border-b">

                  <th className="text-left py-3">
                    Name
                  </th>

                  <th className="text-left py-3">
                    Company
                  </th>

                  <th className="text-left py-3">
                    Email
                  </th>

                  <th className="text-left py-3">
                    Phone
                  </th>

                  <th className="text-left py-3">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {clients.map((client) => (

                  <tr
                    key={client.id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="py-3">
                      {client.name}
                    </td>

                    <td className="py-3">
                      {client.company}
                    </td>

                    <td className="py-3">
                      {client.email}
                    </td>

                    <td className="py-3">
                      {client.phone}
                    </td>

                    <td className="py-3">

                      <button
                        onClick={() => handleDelete(client.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}