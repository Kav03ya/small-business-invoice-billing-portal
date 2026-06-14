import { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import Navbar from '../components/Navbar';

import StatusBadge from '../components/StatusBadge';

// import {
//   getInvoice,
//   updateInvoice,
//   getPayments,
//   recordPayment
// } from '../services/invoiceService';
//Added below block for overdue invoice email reminder feature
import {
  getInvoice,
  updateInvoice,
  getPayments,
  recordPayment,
  sendReminderEmail
} from '../services/invoiceService';

import jsPDF from 'jspdf';

import html2canvas from 'html2canvas';

export default function InvoiceDetail() {

  const { id } = useParams();

  const [invoice, setInvoice] = useState(null);

  const [payments, setPayments] = useState([]);

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_date: '',
    method: 'Cash',
    note: ''
  });

  useEffect(() => {

    loadData();

  }, []);

  const loadData = async () => {

    try {

      const invoiceRes = await getInvoice(id);

      setInvoice(invoiceRes.data);

      const paymentRes = await getPayments(id);

      setPayments(paymentRes.data);

    } catch (err) {

      console.error(err);
    }
  };

  const handleStatusChange = async (e) => {

    try {

      await updateInvoice(id, {
        status: e.target.value
      });

      loadData();

    } catch (err) {

      console.error(err);
    }
  };

  const handlePaymentChange = (e) => {

    setPaymentForm({
      ...paymentForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentSubmit = async (e) => {

    e.preventDefault();

    try {

      await recordPayment({
        ...paymentForm,
        invoice_id: id
      });

      setPaymentForm({
        amount: '',
        payment_date: '',
        method: 'Cash',
        note: ''
      });

      loadData();

    } catch (err) {

      // alert(
      //   err.response?.data?.error ||
      //   'Failed to record payment.'
      // );
      console.log(err.response?.data);

      alert(
        JSON.stringify(err.response?.data)
      );
    }
  };

  //Added this block of code for overdue invoice email reminder feature
  const handleReminderEmail = async () => {

    try {

      await sendReminderEmail({

        client_name: invoice.client_name,

        client_email: invoice.client_email,

        invoice_number: invoice.invoice_number,

        due_date: invoice.due_date,

        total: invoice.total
      });

      alert('Reminder email sent successfully.');

    } catch (err) {

      alert(
        err.response?.data?.error ||
        'Failed to send reminder email.'
      );
    }
  };

  if (!invoice) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  const totalPaid = payments.reduce((sum, payment) => {

    return sum + parseFloat(payment.amount);

  }, 0);

  const balance =
    parseFloat(invoice.total)
    -
    totalPaid;

  const downloadPDF = () => {

    const pdf = new jsPDF('p', 'mm', 'a4');

    // Company Details
    pdf.setFontSize(22);
    pdf.setTextColor(40, 40, 40);

    pdf.text('INVOICE PORTAL', 20, 20);

    pdf.setFontSize(10);

    pdf.text('Business Management System', 20, 28);

    pdf.text('Bangalore, Karnataka, India', 20, 34);

    pdf.text('Email: support@invoiceportal.com', 20, 40);

    // Invoice Heading
    pdf.setFontSize(18);

    pdf.text('INVOICE DETAILS', 140, 20);

    // Invoice Information
    pdf.setFontSize(12);

    pdf.text(
      `Invoice Number: ${invoice.invoice_number}`,
      20,
      60
    );

    pdf.text(
      `Client Name: ${invoice.client_name}`,
      20,
      70
    );

    pdf.text(
      `Issue Date: ${invoice.issue_date}`,
      20,
      80
    );

    pdf.text(
      `Due Date: ${invoice.due_date}`,
      20,
      90
    );

    pdf.text(
      `Status: ${invoice.status}`,
      20,
      100
    );

    // Table Heading
    pdf.setFontSize(14);

    pdf.text('Invoice Items', 20, 120);

    // Table Header
    pdf.setFillColor(230, 230, 230);

    pdf.rect(20, 128, 170, 10, 'F');

    pdf.setFontSize(11);

    pdf.text('Description', 25, 135);

    pdf.text('Qty', 105, 135);

    pdf.text('Price', 125, 135);

    pdf.text('Total', 160, 135);

    // Table Rows
    let y = 148;

    invoice.items.forEach((item) => {

      pdf.text(
        item.description,
        25,
        y
      );

      pdf.text(
        String(item.quantity),
        105,
        y
      );

      pdf.text(
        `INR ${item.unit_price}`,
        125,
        y
      );

      pdf.text(
        `INR ${item.subtotal}`,
        160,
        y
      );

      y += 12;
    });

    // Totals Section
    y += 10;

    pdf.setFontSize(12);

    pdf.text(
      `Subtotal: INR ${invoice.subtotal}`,
      130,
      y
    );

    y += 10;

    pdf.text(
      `Tax Rate: ${invoice.tax_rate}%`,
      130,
      y
    );

    y += 10;

    pdf.setFontSize(16);

    pdf.setTextColor(0, 102, 204);

    pdf.text(
      `Grand Total: INR ${invoice.total}`,
      110,
      y
    );

    // Payment Summary
    y += 25;

    pdf.setTextColor(0, 0, 0);

    pdf.setFontSize(14);

    pdf.text('Payment Summary', 20, y);

    y += 12;

    pdf.setFontSize(12);

    pdf.text(
      `Total Paid: INR ${totalPaid.toFixed(2)}`,
      20,
      y
    );

    y += 10;

    pdf.text(
      `Balance Due: INR ${balance.toFixed(2)}`,
      20,
      y
    );

    // Footer
    y += 25;

    pdf.setFontSize(11);

    pdf.setTextColor(100);

    const generatedDate = new Date();

    const formattedDate =
      generatedDate.toLocaleDateString();

    const formattedTime =
      generatedDate.toLocaleTimeString();

    pdf.setFontSize(10);

    pdf.setTextColor(120);

    pdf.text(
      `Generated On: ${formattedDate} ${formattedTime}`,
      20,
      y
    );

    y += 10;

    pdf.text(
      'Thank you for doing business with us.',
      20,
      y
    );

    y += 8;

    pdf.text(
      'This invoice was generated digitally by Invoice Portal.',
      20,
      y
    );

    // Save PDF
    pdf.save(`${invoice.invoice_number}.pdf`);
  };
  //console.log(invoice);

  //Added this for payment progress bar
  const paymentPercentage =
    invoice.total > 0
      ? (totalPaid / parseFloat(invoice.total)) * 100
      : 0;
  return (

    <div className="min-h-screen bg-light">

      <Navbar />

      <div className="p-8 max-w-5xl mx-auto">

        <div className="bg-white rounded-2xl shadow p-6 mb-8">

          <div className="flex justify-between items-center mb-6">

            <div>

              <h1 className="text-3xl font-bold text-primary">
                {invoice.invoice_number}
              </h1>

              <p className="text-gray-500">
                {/* Added compant name in bracket to differenciate 2 clients with same name */}
                {invoice.client_name} ({invoice.client_company})
              </p>

            </div>

            <div className="flex items-center gap-4">

              <button
                onClick={downloadPDF}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Download PDF
              </button>

              {/* Added this for overdue invoice email reminder feature */}
              {
                (
                  new Date(invoice.due_date) < new Date() &&
                  invoice.status !== 'Paid'
                ) && (

                  <button
                    onClick={handleReminderEmail}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
                  >
                    Send Reminder
                  </button>

                )
              }
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

            </div>

          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">

            <div>

              <p className="text-gray-500 text-sm">
                Issue Date
              </p>

              <p className="font-semibold">
                {invoice.issue_date}
              </p>

            </div>

            <div>

              <p className="text-gray-500 text-sm">
                Due Date
              </p>

              <p className="font-semibold">
                {invoice.due_date}
              </p>

            </div>

          </div>

          <div className="mb-8">

            <label className="block text-sm font-medium mb-2">
              Update Status
            </label>

            <select
              value={invoice.status}
              onChange={handleStatusChange}
              className="border rounded-lg px-4 py-2"
            >

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

              <option value="Cancelled">
                Cancelled
              </option>

            </select>

          </div>

          <div>

            <h2 className="text-xl font-bold mb-4">
              Invoice Items
            </h2>

            <table className="w-full text-sm">

              <thead>

                <tr className="border-b">

                  <th className="text-left py-3">
                    Description
                  </th>

                  <th className="text-left py-3">
                    Qty
                  </th>

                  <th className="text-left py-3">
                    Price
                  </th>

                  <th className="text-left py-3">
                    Total
                  </th>

                </tr>

              </thead>

              <tbody>

                {invoice.items.map((item) => (

                  <tr
                    key={item.id}
                    className="border-b"
                  >

                    <td className="py-3">
                      {item.description}
                    </td>

                    <td className="py-3">
                      {item.quantity}
                    </td>

                    <td className="py-3">
                      INR {item.unit_price}
                    </td>

                    <td className="py-3 font-semibold">
                      INR {item.subtotal}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          <div className="mt-8 text-right space-y-2">

            <div>
              Subtotal: INR {invoice.subtotal}
            </div>

            <div>
              Tax Rate: {invoice.tax_rate}%
            </div>

            <div className="text-2xl font-bold text-primary">
              Total: INR {invoice.total}
            </div>

          </div>

        </div>

        <div
          id="invoice-content"
          className="bg-white rounded-2xl shadow p-6 mb-8"
        >

          <h2 className="text-xl font-bold mb-6">
            Payment Summary
          </h2>

          {/* <div className="grid grid-cols-3 gap-6 mb-8"> */}
          {/* <div className="grid grid-cols-2 gap-6 mb-6">

            <div>

              <p className="text-sm text-gray-500">
                Total Paid
              </p>

              <p className="text-2xl font-bold text-green-600">
                INR {totalPaid.toFixed(2)}
              </p>

            </div>

            <div>

              <div className="mb-8">

                <div className="flex justify-between mb-2">

                  <span className="text-sm font-medium text-gray-700">
                    Payment Progress
                  </span>

                  <span className="text-sm font-medium text-gray-700">
                    {paymentPercentage.toFixed(0)}%
                  </span>

                </div>

                <div className="w-full bg-gray-200 rounded-full h-4">

                  <div
                    className="bg-green-500 h-4 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(paymentPercentage, 100)}%`
                    }}
                  />

                </div>

                <p className="text-sm text-gray-500 mt-2">

                  Paid INR {totalPaid.toFixed(2)}
                  {' '}
                  of
                  {' '}
                  INR {parseFloat(invoice.total).toFixed(2)}

                </p>

              </div>

              <p className="text-sm text-gray-500">
                Balance
              </p>

              <p className="text-2xl font-bold text-red-600">
                INR {balance.toFixed(2)}
              </p>

            </div>

          </div> */}

          <div className="grid grid-cols-2 gap-6 mb-6">

            <div>

              <p className="text-sm text-gray-500">
                Total Paid
              </p>

              <p className="text-2xl font-bold text-green-600">
                INR {totalPaid.toFixed(2)}
              </p>

            </div>

            <div>

              <p className="text-sm text-gray-500">
                Balance
              </p>

              <p className="text-2xl font-bold text-red-600">
                INR {balance.toFixed(2)}
              </p>

            </div>

          </div>

          <div className="mb-8">

            <div className="flex justify-between mb-2">

              <span className="text-sm font-medium text-gray-700">
                Payment Progress
              </span>

              <span className="text-sm font-medium text-gray-700">
                {paymentPercentage.toFixed(0)}%
              </span>

            </div>

            <div className="w-full bg-gray-200 rounded-full h-4">

              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(paymentPercentage, 100)}%`
                }}
              />

            </div>

            <p className="text-sm text-gray-500 mt-2">

              Paid INR {totalPaid.toFixed(2)}
              {' '}
              of
              {' '}
              INR {parseFloat(invoice.total).toFixed(2)}

            </p>

          </div>

          <form
            onSubmit={handlePaymentSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >

            <input
              type="number"
              name="amount"
              value={paymentForm.amount}
              onChange={handlePaymentChange}
              placeholder="Amount"
              required
              className="border rounded-lg px-4 py-2"
            />

            {/* <input
              type="date"
              name="payment_date"
              value={paymentForm.payment_date}
              onChange={handlePaymentChange}
              required
              className="border rounded-lg px-4 py-2"
            /> */}

            {/* ADDED RESTRICTION ON CHOOSING DATE */}
            <input
              type="date"
              name="payment_date"
              value={paymentForm.payment_date}
              onChange={handlePaymentChange}
              required
              max={new Date().toLocaleDateString('en-CA')}
              className="border rounded-lg px-4 py-2"
            />

            <select
              name="method"
              value={paymentForm.method}
              onChange={handlePaymentChange}
              className="border rounded-lg px-4 py-2"
            >

              <option value="Cash">
                Cash
              </option>

              <option value="UPI">
                UPI
              </option>

              <option value="Bank Transfer">
                Bank Transfer
              </option>

            </select>

            <button
              type="submit"
              className="bg-primary text-white rounded-lg px-4 py-2"
            >
              Record Payment
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}