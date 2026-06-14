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
  // BarChart,
  // Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

export default function Dashboard() {

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  //Adding this for better revenue dispay (last 30 dyas, 6 months, 1 year)
  const [period, setPeriod] = useState('6months');

  // useEffect(() => {

  //   loadDashboard();

  // }, []);

  //Adding this for better revenue dispay (last 30 dyas, 6 months, 1 year)
  useEffect(() => {

    loadDashboard();

  }, [period]);

  const loadDashboard = async () => {

    try {

      // const res = await getDashboard();
      //Adding this for revenue (last 30 days, 6 months, 1 year)
      const res = await getDashboard(period);

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
  const collectionRate =
    (
      (parseFloat(data?.revenue || 0) /
        (
          parseFloat(data?.revenue || 0)
          +
          parseFloat(data?.pending || 0)
        )
      ) * 100
    ) || 0;
  // const clientData = [
  //   {
  //     name: 'Clients',
  //     count: parseInt(data?.total_clients || 0)
  //   },
  //   {
  //     name: 'Overdue',
  //     count: parseInt(data?.overdue_count || 0)
  //   }
  // ];

  //Added for monthly revenue line chart
  const revenueTrendData = (() => {

    const months = [];

    for (let i = 5; i >= 0; i--) {

      const date = new Date();

      date.setMonth(date.getMonth() - i);

      const monthLabel =
        date.toLocaleString('default', {
          month: 'short'
        }) +
        ' ' +
        date.getFullYear();

      months.push({
        month: monthLabel,
        revenue: 0
      });
    }

    data?.monthly_revenue?.forEach((item) => {

      const existing = months.find(
        (m) => m.month === item.month
      );

      if (existing) {

        existing.revenue =
          parseFloat(item.revenue);
      }
    });

    return months;

  })();

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

            {/* <p className="text-sm text-gray-500 mb-2">
              Total Revenue
            </p> */}

            {/* Drop down in Total revenue card, for last 30 days/ 6 months/ 1 year revenue */}
            <div className="flex justify-between items-center mb-2">

              <p className="text-sm text-gray-500">
                Revenue Collected
              </p>

              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="text-xs border rounded px-2 py-1"
              >

                <option value="30days">
                  Last 30 Days
                </option>

                <option value="6months">
                  Last 6 Months
                </option>

                <option value="12months">
                  Last 12 Months
                </option>

              </select>

            </div>

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
                  📈 Revenue collection performance remains healthy with
                  {' '}
                  ₹ {data?.revenue}
                  {' '}
                  collected during the selected reporting period.
                </p>

              ) : (

                <p>
                  📊 Revenue collection during the selected reporting period
                  is currently moderate and may improve with stronger client
                  payment follow-up.
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

            <div className="mb-6">

              <h2 className="text-xl font-bold text-primary">
                Revenue vs Pending
              </h2>

              <p
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${collectionRate >= 80
                    ? 'bg-green-100 text-green-700'
                    : collectionRate >= 60
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
              >
                Collection Rate: {collectionRate.toFixed(1)}%
              </p>

            </div>

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
          {/* 
          Bar Chart

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

          </div> */}

          {/* Revenue Trend Chart */}

          <div className="bg-white rounded-2xl shadow p-6">

            <h2 className="text-xl font-bold text-primary mb-6">
              Revenue Collection Trend (Last 6 Months)
            </h2>

            <ResponsiveContainer width="100%" height={300}>

              <LineChart data={revenueTrendData}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Legend />

                <Line
                  type="linear"
                  dataKey="revenue"
                  stroke="#1B6CA8"
                  strokeWidth={3}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-10">

          <h2 className="text-xl font-bold text-primary mb-4">
            Top Clients by Revenue
          </h2>

          <div className="space-y-3">

            {data?.top_clients?.map((client, index) => (

              <div
                key={index}
                className="flex justify-between items-center border-b pb-3"
              >

                <div>

                  <p className="font-semibold">
                    {client.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    {client.company}
                  </p>

                </div>

                <p className="font-bold text-green-600">
                  ₹ {parseFloat(client.revenue).toFixed(2)}
                </p>

              </div>

            ))}

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