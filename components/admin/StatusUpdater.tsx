'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StatusUpdater({
  orderId,
  currentStatus
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const statuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        router.refresh(); // Refresh the server component to get new data
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      disabled={loading}
      value={currentStatus}
      onChange={handleChange}
      data-testid={`admin-status-select-${orderId}`}
      className={`text-[12px] px-3 py-1.5 rounded-lg border font-bold uppercase tracking-wider transition-all cursor-pointer ${
        currentStatus === 'paid' ? 'bg-gray-900 text-white border-gray-900' : 
        'bg-white text-gray-900 border-gray-200 hover:border-gray-900'
      } disabled:opacity-50`}
    >
      {statuses.map(status => (
        <option key={status} value={status} className="bg-white text-gray-900">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </option>
      ))}
    </select>
  );
}
