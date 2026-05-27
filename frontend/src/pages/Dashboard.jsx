import { useEffect, useState } from 'react';

import Navbar from '../components/Navbar';

import StatusBadge from '../components/StatusBadge';

import { getDashboard } from '../services/invoiceService';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

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

  const pieData = [
    {
      name: 'Revenue',
      value: parseFloat(data?.revenue || 0)
    },
    {
      name: 'Pending',
      value: parseFloat(data?.pending || 0)
    }
  ];

  const clientData = [
    {
      name: 'Clients',
      count: parseInt(data?.total_clients || 0)
    },
    {
      name: 'Overdue',
      count: parseInt(data?.overdue_count || 0)
    }
  ];

  const COLORS = ['#2563eb', '#f59e0b'];

  return (

    <div className="min-h-screen bg-light">

      <Navbar />

      <div className="p-8">

        <h1 className="text-3xl font-bold text-primary mb-8">
          Dashboard Analytics
        </h1>

        {/* Stats Cards */}

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

        {/* AI Insights */}

        <div className="bg-white rounded-2xl shadow p-6 mb-10">

          <h2 className="text-xl font-bold text-purple-700 mb-4">
            AI Business Insights
          </h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">

            {/* Revenue Insight */}

            {
              parseFloat(data?.revenue || 0) > 30000 ? (

                <p>
                  📈 Revenue realization performance remains healthy with
                  {' '}
                  ₹ {data?.revenue}
                  {' '}
                  successfully collected from completed invoices.
                </p>

              ) : (

                <p>
                  📊 Revenue collection is currently moderate and may improve
                  with stronger invoice conversion and payment follow-up.
                </p>
              )
            }

            {/* Pending Insight */}

            {
              parseFloat(data?.pending || 0) >
                parseFloat(data?.revenue || 0)

                ? (

                  <p>
                    💰 Outstanding pending invoices currently exceed realized
                    revenue, indicating moderate collection pressure and
                    possible cash-flow risk.
                  </p>

                ) : (

                  <p>
                    ✅ Pending invoice amounts remain within manageable limits
                    compared to realized revenue.
                  </p>
                )
            }

            {/* Overdue Insight */}

            {
              parseInt(data?.overdue_count || 0) > 0 ? (

                <p>
                  ⚠️
                  {' '}
                  {data?.overdue_count}
                  {' '}
                  invoice(s) have crossed their due dates and require
                  immediate client follow-up attention.
                </p>

              ) : (

                <p>
                  ✅ No overdue invoices detected. Payment timelines are
                  currently stable across client accounts.
                </p>
              )
            }

            {/* Client Insight */}

            {
              parseInt(data?.total_clients || 0) >= 5 ? (

                <p>
                  🤝 Client engagement activity appears healthy with
                  {' '}
                  {data?.total_clients}
                  {' '}
                  actively managed business accounts.
                </p>

              ) : (

                <p>
                  📌 Expanding the active client base may help improve
                  long-term revenue growth and invoice activity.
                </p>
              )
            }

          </div>

        </div>

        {/* Charts */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

          {/* Pie Chart */}

          <div className="bg-white rounded-2xl shadow p-6">

            <h2 className="text-xl font-bold text-primary mb-6">
              Revenue vs Pending
            </h2>

            <ResponsiveContainer width="100%" height={300}>

              <PieChart>

                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >

                  {pieData.map((entry, index) => (

                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />

                  ))}

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>

          {/* Bar Chart */}

          <div className="bg-white rounded-2xl shadow p-6">

            <h2 className="text-xl font-bold text-primary mb-6">
              Client & Overdue Overview
            </h2>

            <ResponsiveContainer width="100%" height={300}>

              <BarChart data={clientData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis />

                <Tooltip />

                <Legend />

                <Bar dataKey="count" fill="#1B6CA8" />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* Recent Invoices */}

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
                        status={
                          (
                            new Date(invoice.due_date) < new Date() &&
                            invoice.status !== 'Paid'
                          )
                            ? 'Overdue'
                            : invoice.status
                        }
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