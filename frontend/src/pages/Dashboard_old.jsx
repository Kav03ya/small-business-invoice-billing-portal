import { useEffect, useState } from 'react';

import Navbar from '../components/Navbar';

import StatusBadge from '../components/StatusBadge';

import { getDashboard } from '../services/invoiceService';

export default function Dashboard() {

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    loadDashboard();

  }, []);

  const loadDashboard = async () => {

    try {

      const res = await getDashboard();

      setData(res.data);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);
    }
  };

  if (loading) {

    return (
      <div className="p-10">
        Loading dashboard...
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-light">

      <Navbar />

      <div className="p-8">

        <h1 className="text-3xl font-bold text-primary mb-8">
          Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

          <div className="bg-white rounded-2xl shadow p-6">

            <p className="text-sm text-gray-500 mb-2">
              Total Revenue
            </p>

            <h2 className="text-3xl font-bold text-green-600">
              ₹ {data?.revenue || 0}
            </h2>

          </div>

          <div className="bg-white rounded-2xl shadow p-6">

            <p className="text-sm text-gray-500 mb-2">
              Pending Amount
            </p>

            <h2 className="text-3xl font-bold text-yellow-600">
              ₹ {data?.pending || 0}
            </h2>

          </div>

          <div className="bg-white rounded-2xl shadow p-6">

            <p className="text-sm text-gray-500 mb-2">
              Overdue Invoices
            </p>

            <h2 className="text-3xl font-bold text-red-600">
              {data?.overdue_count || 0}
            </h2>

          </div>

          <div className="bg-white rounded-2xl shadow p-6">

            <p className="text-sm text-gray-500 mb-2">
              Total Clients
            </p>

            <h2 className="text-3xl font-bold text-blue-600">
              {data?.total_clients || 0}
            </h2>

          </div>

        </div>

        <div className="bg-white rounded-2xl shadow p-6">

          <h2 className="text-xl font-bold text-primary mb-4">
            Recent Invoices
          </h2>

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
                    Amount
                  </th>

                  <th className="text-left py-3">
                    Due Date
                  </th>

                  <th className="text-left py-3">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {data?.recent_invoices?.map((invoice) => (

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
                        status={invoice.status}
                      />

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