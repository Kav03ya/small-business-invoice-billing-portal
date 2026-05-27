import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';

import { getClients } from '../services/clientService';

import { createInvoice } from '../services/invoiceService';

import axios from 'axios';

export default function CreateInvoice() {

  const navigate = useNavigate();

  const [clients, setClients] = useState([]);

  const [form, setForm] = useState({
    client_id: '',
    issue_date: '',
    due_date: '',
    status: 'Draft',
    tax_rate: 0,
    notes: '',
    send_email: false
  });

  const [items, setItems] = useState([
    {
      description: '',
      quantity: 1,
      unit_price: 0
    }
  ]);

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

  const handleFormChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleItemChange = (index, e) => {

    const updated = [...items];

    updated[index][e.target.name] = e.target.value;

    setItems(updated);
  };

  const addItem = () => {

    setItems([
      ...items,
      {
        description: '',
        quantity: 1,
        unit_price: 0
      }
    ]);
  };

  const removeItem = (index) => {

    const updated = items.filter(
      (_, i) => i !== index
    );

    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => {

    return (
      sum
      +
      (
        (parseFloat(item.quantity) || 0)
        *
        (parseFloat(item.unit_price) || 0)
      )
    );

  }, 0);

  const taxAmount =
    subtotal
    *
    (parseFloat(form.tax_rate) || 0)
    / 100;

  const total = subtotal + taxAmount;

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const res = await createInvoice({
        ...form,
        items
      });

      // Send Email If Checkbox Enabled
      if (form.send_email) {

        const selectedClient = clients.find(
          (client) =>
            client.id == form.client_id
        );

        await axios.post(
          'http://invoiceportalapp.infinityfreeapp.com/backend/api/send_invoice_email.php',
          {
            client_email: selectedClient.email,
            client_name: selectedClient.name,
            invoice_number: res.data.invoice_number,
            issue_date: form.issue_date,
            due_date: form.due_date,
            total: total.toFixed(2)
          }
        );
      }

      navigate(`/invoices/${res.data.id}`);

    } catch (err) {

      console.error(err);
    }
  };

  return (

    <div className="min-h-screen bg-light">

      <Navbar />

      <div className="p-8 max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold text-primary mb-8">
          Create Invoice
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-8"
        >

          <div className="bg-white rounded-2xl shadow p-6">

            <h2 className="text-xl font-bold mb-6">
              Invoice Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <select
                name="client_id"
                value={form.client_id}
                onChange={handleFormChange}
                required
                className="border rounded-lg px-4 py-2"
              >

                <option value="">
                  Select Client
                </option>

                {clients.map((client) => (

                  <option
                    key={client.id}
                    value={client.id}
                  >
                    {client.name}
                  </option>

                ))}

              </select>

              <select
                name="status"
                value={form.status}
                onChange={handleFormChange}
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

              </select>

              <input
                type="date"
                name="issue_date"
                placeholder="Issue Date"
                value={form.issue_date}
                onChange={handleFormChange}
                required
                className="border rounded-lg px-4 py-2"
              />

              <input
                type="date"
                name="due_date"
                placeholder="Due Date"
                value={form.due_date}
                onChange={handleFormChange}
                required
                className="border rounded-lg px-4 py-2"
              />

              <input
                type="number"
                name="tax_rate"
                placeholder="Tax Rate"
                value={form.tax_rate}
                onChange={handleFormChange}
                className="border rounded-lg px-4 py-2"
              />

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleFormChange}
                placeholder="Notes"
                className="border rounded-lg px-4 py-2"
              />

              <div className="flex items-center gap-3">

                <input
                  type="checkbox"
                  name="send_email"
                  checked={form.send_email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      send_email: e.target.checked
                    })
                  }
                />

                <label className="text-sm font-medium text-gray-700">
                  Send Invoice Email to Client
                </label>

              </div>

            </div>

          </div>

          <div className="bg-white rounded-2xl shadow p-6">

            <div className="flex justify-between items-center mb-6">

              <h2 className="text-xl font-bold">
                Invoice Items
              </h2>

              <button
                type="button"
                onClick={addItem}
                className="bg-primary text-white px-4 py-2 rounded-lg"
              >
                + Add Item
              </button>

            </div>

            <div className="space-y-4">

              {items.map((item, index) => (

                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 items-center"
                >

                  <input
                    type="text"
                    name="description"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, e)
                    }
                    placeholder="Description"
                    required
                    className="border rounded-lg px-4 py-2 col-span-5"
                  />

                  <input
                    type="number"
                    name="quantity"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, e)
                    }
                    placeholder="Qty"
                    required
                    className="border rounded-lg px-4 py-2 col-span-2"
                  />

                  <input
                    type="number"
                    name="unit_price"
                    value={item.unit_price}
                    onChange={(e) =>
                      handleItemChange(index, e)
                    }
                    placeholder="Price"
                    required
                    className="border rounded-lg px-4 py-2 col-span-2"
                  />

                  <div className="col-span-2 font-semibold">

                    ₹ {
                      (
                        (parseFloat(item.quantity) || 0)
                        *
                        (parseFloat(item.unit_price) || 0)
                      ).toFixed(2)
                    }

                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600"
                  >
                    X
                  </button>

                </div>

              ))}

            </div>

            <div className="mt-8 text-right space-y-2">

              <div>
                Subtotal: ₹ {subtotal.toFixed(2)}
              </div>

              <div>
                Tax: ₹ {taxAmount.toFixed(2)}
              </div>

              <div className="text-2xl font-bold text-primary">
                Total: ₹ {total.toFixed(2)}
              </div>

            </div>

          </div>

          <button
            type="submit"
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-secondary transition"
          >
            Create Invoice
          </button>

        </form>

      </div>

    </div>
  );
}