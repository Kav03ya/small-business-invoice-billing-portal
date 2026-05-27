export default function StatusBadge({ status }) {

  const colors = {
    Draft: 'bg-gray-100 text-gray-600',
    Sent: 'bg-blue-100 text-blue-700',
    Paid: 'bg-green-100 text-green-700',
    Overdue: 'bg-red-100 text-red-700',
    Cancelled: 'bg-yellow-100 text-yellow-700',
  };

  return (

    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        colors[status] || 'bg-gray-100'
      }`}
    >
      {status}
    </span>
  );
}