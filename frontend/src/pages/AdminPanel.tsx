import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ClothingItem } from '../types';
import Footer from '../components/Footer';

interface AdminPanelProps {
  onNavigate: (page: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [pendingItems, setPendingItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.isAdmin) {
      fetchPendingItems();
    }
  }, [user]);

  const fetchPendingItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/items/pending', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch items');
      setPendingItems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (itemId: string) => {
    try {
      const response = await fetch(`/api/admin/items/${itemId}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to approve item');
      setPendingItems(pendingItems.filter(item => item.id !== itemId));
    } catch (err: any) {
      setError(err.message || 'Failed to approve item');
    }
  };

  const handleReject = async (itemId: string) => {
    try {
      const response = await fetch(`/api/admin/items/${itemId}/reject`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to reject item');
      setPendingItems(pendingItems.filter(item => item.id !== itemId));
    } catch (err: any) {
      setError(err.message || 'Failed to reject item');
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      const response = await fetch(`/api/admin/items/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to remove item');
      }
      setPendingItems(pendingItems.filter(item => item.id !== itemId));
    } catch (err: any) {
      setError(err.message || 'Failed to remove item');
    }
  };

  if (!user?.isAdmin) {
    onNavigate('home');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Panel</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {loading && <p className="text-gray-600 dark:text-gray-400">Loading...</p>}

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Pending Items</h2>
          {pendingItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingItems.map(item => (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <img src={item.images[0]} alt={item.title} className="w-full h-48 object-cover rounded-lg mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{item.description}</p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleApprove(item.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
                    >
                      <Check className="h-4 w-4 inline mr-1" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(item.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
                    >
                      <X className="h-4 w-4 inline mr-1" /> Reject
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-medium"
                    >
                      <Trash2 className="h-4 w-4 inline mr-1" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No pending items.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminPanel;