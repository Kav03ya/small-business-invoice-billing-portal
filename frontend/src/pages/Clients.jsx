import { useEffect, useState } from 'react';

import Navbar from '../components/Navbar';

import {
  getClients,
  createClient,
  deleteClient
} from '../services/clientService';

import { Link } from 'react-router-dom';

export default function Clients() {

  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');

  //Added for client search bar
  const [searchTerm, setSearchTerm] = useState('');
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

  // const handleSubmit = async (e) => {

  //   e.preventDefault();

  //   try {

  //     await createClient(form);

  //     setForm({
  //       name: '',
  //       email: '',
  //       phone: '',
  //       company: '',
  //       address: ''
  //     });

  //     loadClients();

  //   } catch (err) {

  //     console.error(err);
  //   }
  // };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');

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

      setError(
        err.response?.data?.error ||
        'Failed to create client.'
      );
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

      alert(
        err.response?.data?.error ||
        'Failed to delete client.'
      );
    }
  };

  const filteredClients = clients.filter((client) =>

    client.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    ||

    client.company
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

    ||

    client.email
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

  );

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
          {error && (
            <div className="bg-red-100 text-red-700 border border-red-300 rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

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
              required
            />

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="border rounded-lg px-4 py-2"
              required
            />

            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone"
              className="border rounded-lg px-4 py-2"
              required
            />

            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Company"
              className="border rounded-lg px-4 py-2"
              required
            />

            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Address"
              className="border rounded-lg px-4 py-2 md:col-span-2"
              required
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

          {/* <h2 className="text-xl font-bold mb-4">
            Client List
          </h2> */}
          {/* Added this for client search bar */}
          <div className="flex justify-between items-center mb-4">

            <h2 className="text-xl font-bold">
              Client List
            </h2>

            <input
              type="text"
              placeholder="Search by name, company or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-lg px-4 py-2 w-80"
            />

          </div>

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

                {/* {clients.map((client) => ( */}
                {/* Added for client search bar */}

                {
                  filteredClients.length === 0 ? (

                    <tr>

                      <td
                        colSpan="5"
                        className="text-center py-6 text-gray-500"
                      >
                        No clients found.
                      </td>

                    </tr>

                  ) : (

                    filteredClients.map((client) => (
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

                          <div className="flex gap-4">

                            <Link
                              to={`/clients/${client.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              View
                            </Link>

                            <button
                              onClick={() => handleDelete(client.id)}
                              className="text-red-600 hover:underline"
                            >
                              Delete
                            </button>

                          </div>
                        </td>

                      </tr>

                    )
                    ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}