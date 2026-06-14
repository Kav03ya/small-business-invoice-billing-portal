import { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import Navbar from '../components/Navbar';

import {
    getClient,
    updateClient
} from '../services/clientService';

export default function ClientDetail() {

    const { id } = useParams();

    const [client, setClient] = useState(null);

    const [editing, setEditing] = useState(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        address: ''
    });

    useEffect(() => {

        loadClient();

    }, []);

    const loadClient = async () => {

        try {

            const res = await getClient(id);

            setClient(res.data);

            setForm(res.data);

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

    const handleUpdate = async (e) => {

        e.preventDefault();

        try {

            await updateClient(id, form);

            alert('Client updated successfully.');

            setEditing(false);

            loadClient();

        } catch (err) {

            alert(
                err.response?.data?.error ||
                'Failed to update client.'
            );
        }
    };

    if (!client) {

        return (
            <div className="p-10">
                Loading...
            </div>
        );
    }

    return (

        <div className="min-h-screen bg-light">

            <Navbar />

            <div className="p-8 max-w-3xl mx-auto">

                <div className="bg-white rounded-2xl shadow p-6">

                    <div className="flex justify-between items-center mb-6">

                        <h1 className="text-3xl font-bold text-primary">
                            Client Details
                        </h1>

                        <button
                            onClick={() => setEditing(!editing)}
                            className="bg-primary text-white px-4 py-2 rounded-lg"
                        >
                            {editing ? 'Cancel' : 'Edit Client'}
                        </button>

                    </div>

                    {!editing ? (
                        <>

                            <div className="grid grid-cols-3 gap-4 mb-8">

                                <div className="bg-gray-50 rounded-lg p-4">

                                    <p className="text-sm text-gray-500">
                                        Total Invoices
                                    </p>

                                    <p className="text-2xl font-bold text-primary">
                                        {client.total_invoices}
                                    </p>

                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">

                                    <p className="text-sm text-gray-500">
                                        Revenue Generated
                                    </p>

                                    <p className="text-2xl font-bold text-green-600">
                                        ₹ {client.revenue_generated}
                                    </p>

                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">

                                    <p className="text-sm text-gray-500">
                                        Pending Amount
                                    </p>

                                    <p className="text-2xl font-bold text-red-600">
                                        ₹ {client.pending_amount}
                                    </p>

                                </div>

                            </div>
                            <div className="space-y-4">

                                <div>
                                    <strong>Name:</strong> {client.name}
                                </div>

                                <div>
                                    <strong>Company:</strong> {client.company}
                                </div>

                                <div>
                                    <strong>Email:</strong> {client.email}
                                </div>

                                <div>
                                    <strong>Phone:</strong> {client.phone}
                                </div>

                                <div>
                                    <strong>Address:</strong> {client.address}
                                </div>

                            </div>
                        </>
                    ) : (

                        <form
                            onSubmit={handleUpdate}
                            className="space-y-4"
                        >

                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-2"
                                required
                            />

                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-2"
                                required
                            />

                            <input
                                type="text"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-2"
                                required
                            />

                            <input
                                type="text"
                                name="company"
                                value={form.company}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-2"
                                required
                            />

                            <textarea
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-4 py-2"
                                required
                            />

                            <button
                                type="submit"
                                className="bg-green-600 text-white px-6 py-2 rounded-lg"
                            >
                                Save Changes
                            </button>

                        </form>

                    )}

                </div>

            </div>

        </div>
    );
}