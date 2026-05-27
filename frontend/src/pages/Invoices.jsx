import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import Navbar from '../components/Navbar';

import StatusBadge from '../components/StatusBadge';

import {
  getInvoices,
  deleteInvoice
} from '../services/invoiceService';

export default function Invoices() {

  const [invoices, setInvoices] = useState([]);

  const [status, setStatus] = useState('');

  useEffect(() => {

    loadInvoices();

  }, []);

  const loadInvoices = async () => {

    try {

      const res = await getInvoices();

      setInvoices(res.data);

    } catch (err) {

      console.error(err);
    }
  };

  const handleDelete = async (id) => {

    if (!window.confirm('Delete this invoice?')) {
      return;
    }

    try {

      await deleteInvoice(id);

      loadInvoices();

    } catch (err) {

      console.error(err);
    }
  };

  // Automatic overdue detection
  const processedInvoices = invoices.map((invoice) => {

    const today = new Date();

    const dueDate = new Date(invoice.due_date);

    const computedStatus = (
      dueDate < today &&
      invoice.status !== 'Paid'
    )
      ? 'Overdue'
      : invoice.status;

    return {
      ...invoice,
      computedStatus
    };
  });

  // Filter logic
  const filteredInvoices = status
    ? processedInvoices.filter(
        (invoice) => invoice.computedStatus === status
      )
    : processedInvoices;

  return (

    <div className="min-h-screen bg-light">

      <Navbar />

      <div className="p-8">

        <div className="flex justify-between items-center mb-8">

          <h1 className="text-3xl font-bold text-primary">
            Invoices
          </h1>

          <Link
            to="/invoices/new"
            className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-secondary transition"
          >
            + Create Invoice
          </Link>

        </div>

        <div className="bg-white rounded-2xl shadow p-6">

          <div className="mb-6">

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded-lg px-4 py-2"
            >

              <option value="">
                All Status
              </option>

              <option value="Draft">
                Draft
              </option>

              <option value="Sent">
                Sent
              </option>

              <option value="Paid">
                Paid
              </option>

              <option value="Overdue">
                Overdue
              </option>

            </select>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>

                <tr className="border-b">

                  <th className="text-left py-3">
                    Invoice
                  </th>

                  <th className="text-left py-3">
                    Client
                  </th>

                  <th className="text-left py-3">
                    Total
                  </th>

                  <th className="text-left py-3">
                    Due Date
                  </th>

                  <th className="text-left py-3">
                    Status
                  </th>

                  <th className="text-left py-3">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredInvoices.map((invoice) => (

                  <tr
                    key={invoice.id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="py-3 font-medium">
                      {invoice.invoice_number}
                    </td>

                    <td className="py-3">
                      {invoice.client_name}
                    </td>

                    <td className="py-3">
                      ₹ {invoice.total}
                    </td>

                    <td className="py-3">
                      {invoice.due_date}
                    </td>

                    <td className="py-3">

                      <StatusBadge
                        status={invoice.computedStatus}
                      />

                    </td>

                    <td className="py-3 flex gap-4">

                      <Link
                        to={`/invoices/${invoice.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </Link>

                      <button
                        onClick={() => handleDelete(invoice.id)}
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