import React, { useState, useEffect } from 'react';
import { Plus, Package, ArrowUpDown, Star, MapPin, Calendar, Eye, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ClothingItem, SwapRequest } from '../types';
import Footer from '../components/Footer';

interface DashboardProps {
  onNavigate: (page: string, itemId?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'swaps'>('overview');
  const [userItems, setUserItems] = useState<ClothingItem[]>([]);
  const [userSwapRequests, setUserSwapRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserItems();
      fetchUserSwapRequests();
    }
  }, [user]);

  const fetchUserItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/items/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch items');
      setUserItems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSwapRequests = async () => {
    try {
      const response = await fetch('/api/swaps', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch swap requests');
      setUserSwapRequests(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch swap requests');
    }
  };

  const handleAcceptSwap = async (swapId: string) => {
    try {
      const response = await fetch(`/api/swaps/${swapId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'accepted' })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to accept swap');
      setUserSwapRequests(userSwapRequests.map(swap =>
        swap.id === swapId ? { ...swap, status: 'accepted' } : swap
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to accept swap');
    }
  };

  const handleDeclineSwap = async (swapId: string) => {
    try {
      const response = await fetch(`/api/swaps/${swapId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: 'declined' })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to decline swap');
      setUserSwapRequests(userSwapRequests.map(swap =>
        swap.id === swapId ? { ...swap, status: 'declined' } : swap
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to decline swap');
    }
  };

  if (!user) {
    onNavigate('auth');
    return null;
  }

  const stats = [
    { label: 'Items Listed', value: userItems.length, icon: Package },
    { label: 'Active Swaps', value: userSwapRequests.filter(s => s.status === 'pending').length, icon: ArrowUpDown },
    { label: 'Total Points', value: user.points, icon: Star },
    { label: 'Completed Swaps', value: userSwapRequests.filter(s => s.status === 'completed').length, icon: Star }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'accepted': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'declined': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'completed': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your items and track your swaps
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => onNavigate('add-item')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>List New Item</span>
              </button>
              {user.isAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  <span>Admin Panel</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {loading && <p className="text-gray-600 dark:text-gray-400">Loading...</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                  <stat.icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'items', label: 'My Items' },
                { id: 'swaps', label: 'Swap Requests' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600 dark:text-green-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      {user.avatar && (
                        <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-full object-cover" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {new Date(user.joinedDate).toLocaleDateString()}</span>
                      </div>
                      {user.location && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4" />
                          <span>{user.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {userSwapRequests.slice(0, 3).map((swap) => (
                      <div key={swap.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {swap.type === 'swap' ? 'Swap Request' : 'Points Redemption'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {swap.itemTitle} • {new Date(swap.createdDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(swap.status)}`}>
                          {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'items' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    My Listed Items ({userItems.length})
                  </h3>
                </div>

                {userItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userItems.map((item) => (
                      <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">{item.title}</h4>
                            <span className="text-green-600 dark:text-green-400 font-bold text-sm">
                              {item.pointValue} pts
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.isAvailable 
                                ? 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400'
                                : 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              {item.isAvailable ? 'Available' : 'Not Available'}
                            </span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => onNavigate('item-detail', item.id)}
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                <Edit className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No items listed yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Start by listing your first item to begin swapping
                    </p>
                    <button
                      onClick={() => onNavigate('add-item')}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      List Your First Item
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'swaps' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Swap Requests ({userSwapRequests.length})
                </h3>

                {userSwapRequests.length > 0 ? (
                  <div className="space-y-4">
                    {userSwapRequests.map((swap) => (
                      <div key={swap.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {swap.type === 'swap' ? 'Item Swap Request' : 'Points Redemption'}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(swap.createdDate).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(swap.status)}`}>
                            {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Requested Item:
                            </p>
                            <p className="text-gray-900 dark:text-white">{swap.itemTitle}</p>
                          </div>
                          
                          {swap.offeredItemTitle && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Offered Item:
                              </p>
                              <p className="text-gray-900 dark:text-white">{swap.offeredItemTitle}</p>
                            </div>
                          )}
                        </div>

                        {swap.message && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Message:
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              {swap.message}
                            </p>
                          </div>
                        )}

                        {swap.status === 'pending' && (
                          <div className="flex items-center space-x-3 mt-4">
                            <button
                              onClick={() => handleAcceptSwap(swap.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDeclineSwap(swap.id)}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ArrowUpDown className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No swap requests yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Start browsing items to make your first swap request
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;