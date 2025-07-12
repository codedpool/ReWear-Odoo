import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, MapPin, Calendar, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ClothingItem, User } from '../types';
import Footer from '../components/Footer';

interface ItemDetailPageProps {
  itemId: string;
  onNavigate: (page: string, itemId?: string) => void;
}

const ItemDetailPage: React.FC<ItemDetailPageProps> = ({ itemId, onNavigate }) => {
  const { user } = useAuth();
  const [item, setItem] = useState<ClothingItem | null>(null);
  const [userItems, setUserItems] = useState<ClothingItem[]>([]);
  const [selectedOfferItem, setSelectedOfferItem] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchItem();
    if (user) {
      fetchUserItems();
    }
  }, [itemId, user]);

  const fetchItem = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch item');
      if (!data.isApproved) throw new Error('Item is not approved');
      setItem(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch item');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserItems = async () => {
    try {
      const response = await fetch('/api/items/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch user items');
      setUserItems(data.filter((item: ClothingItem) => item.isAvailable && item.isApproved));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user items');
    }
  };

  const handleSwapRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onNavigate('auth', 'login');
      return;
    }
    if (!selectedOfferItem) {
      setError('Please select an item to offer');
      return;
    }

    try {
      const response = await fetch('/api/swaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          itemId,
          offeredItemId: selectedOfferItem,
          type: 'swap',
          message
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send swap request');
      setSuccess('Swap request sent successfully!');
      setMessage('');
      setSelectedOfferItem('');
    } catch (err: any) {
      setError(err.message || 'Failed to send swap request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
          <button
            onClick={() => onNavigate('browse')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Browse</span>
          </button>
          <p className="text-red-600">{error || 'Item not found'}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <button
          onClick={() => onNavigate('browse')}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Browse</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full h-96 object-cover"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
              {item.images.slice(1).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${item.title} ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{item.title}</h1>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-green-600 dark:text-green-400 font-bold">{item.pointValue} points</span>
              <span className="text-gray-600 dark:text-gray-400">•</span>
              <span className="text-gray-600 dark:text-gray-400">{item.condition}</span>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6">{item.description}</p>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{item.location || 'Not specified'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Listed on {new Date(item.uploadDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">Uploaded by {item.uploaderName}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {item.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            {user && user.id !== item.uploaderId && (
              <form onSubmit={handleSwapRequest} className="space-y-4">
                {error && <p className="text-red-600">{error}</p>}
                {success && <p className="text-green-600">{success}</p>}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Item to Offer
                  </label>
                  <select
                    value={selectedOfferItem}
                    onChange={(e) => setSelectedOfferItem(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select an item</option>
                    {userItems.map((offerItem) => (
                      <option key={offerItem.id} value={offerItem.id}>
                        {offerItem.title} ({offerItem.pointValue} points)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    rows={4}
                    placeholder="Add a message to the item owner..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="h-5 w-5" />
                  <span>Send Swap Request</span>
                </button>
              </form>
            )}

            {(!user || user.id === item.uploaderId) && (
              <p className="text-gray-600 dark:text-gray-400">
                {user ? 'You cannot swap for your own item.' : 'Please log in to send a swap request.'}
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ItemDetailPage;