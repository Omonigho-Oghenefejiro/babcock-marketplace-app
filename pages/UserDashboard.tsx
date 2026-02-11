import React, { useState } from 'react';
import { User, Package, Settings, LogOut, Store, Trash2, Edit2, Save, X, Plus, RotateCcw } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import { Product, Order } from '../types';

const UserDashboard = () => {
  const { user, orders, products, logout, updateUser, deleteProduct, updateProduct, requestReturn } = useStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'listings'>('orders');
  const navigate = useNavigate();

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [password, setPassword] = useState('');

  // Listings Management State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});

  const userListings = products.filter(p => p.sellerId === user?.id);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <p>Please log in to view your dashboard.</p>
        <button onClick={() => navigate('/login')} className="mt-4 text-blue-600 font-bold hover:underline">Go to Login</button>
      </div>
    );
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileName.trim()) {
      updateUser({ name: profileName });
      setPassword(''); // Clear password field after "saving"
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm({
      title: product.title,
      price: product.price,
      stock: product.stock
    });
  };

  const saveEdit = () => {
    if (editingId && editForm) {
      updateProduct(editingId, editForm);
      setEditingId(null);
    }
  };

  const isReturnable = (order: Order) => {
    if (order.status !== 'completed') return false;
    
    // Determine delivery date (fallback to createdAt if deliveredAt not set)
    const dateToCheck = order.deliveredAt ? new Date(order.deliveredAt) : new Date(order.date);
    const now = new Date();
    
    // Calculate difference in days
    const diffTime = Math.abs(now.getTime() - dateToCheck.getTime());
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    return diffDays <= 5;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden sticky top-24">
            <div className="p-6 border-b border-gray-100 text-center">
              <img src={user.avatar} alt="User" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-50" />
              <h2 className="font-bold text-lg text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500 capitalize">{user.role}</p>
            </div>
            <nav className="p-2">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'orders' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Package className="h-5 w-5" />
                <span>My Orders</span>
              </button>
              <button
                onClick={() => setActiveTab('listings')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'listings' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Store className="h-5 w-5" />
                <span>My Listings</span>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <User className="h-5 w-5" />
                <span>Profile Settings</span>
              </button>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-2"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Order History</h2>
              </div>
              
              {orders.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>You haven't placed any orders yet.</p>
                  <Link to="/shop" className="text-blue-600 hover:underline mt-2 inline-block">Start Shopping</Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col md:flex-row justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Order ID: <span className="font-mono text-gray-900">{order.id}</span></p>
                          <p className="text-sm text-gray-500">Placed on: <span className="text-gray-900">{new Date(order.date).toLocaleDateString()}</span></p>
                          {order.deliveredAt && order.status === 'completed' && (
                              <p className="text-xs text-green-600 mt-1">Delivered: {new Date(order.deliveredAt).toLocaleDateString()}</p>
                          )}
                        </div>
                        <div className="mt-2 md:mt-0 text-right">
                          <p className="font-bold text-lg text-blue-900">₦{order.total.toLocaleString()}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            ['return_requested', 'returned'].includes(order.status) ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center">
                            <img src={item.image} alt={item.title} className="w-12 h-12 object-cover rounded border border-gray-200" />
                            <div className="ml-4 flex-1">
                              <p className="text-sm font-medium text-gray-900">{item.title}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-medium text-gray-600">₦{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>

                      {/* Return Action */}
                      <div className="mt-4 flex justify-end">
                        {isReturnable(order) && (
                          <button 
                            onClick={() => requestReturn(order.id)}
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition-colors"
                          >
                            <RotateCcw className="h-4 w-4 mr-1.5" />
                            Return Item
                          </button>
                        )}
                        {order.status === 'return_requested' && (
                            <p className="text-sm text-orange-600 italic">Return request under review.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LISTINGS TAB */}
          {activeTab === 'listings' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">My Listings</h2>
                <Link to="/sell" className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-1" /> Add New
                </Link>
              </div>

              {userListings.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <Store className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>You haven't listed any items for sale.</p>
                  <Link to="/sell" className="text-blue-600 hover:underline mt-2 inline-block">Sell an Item</Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userListings.map((product) => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img className="h-10 w-10 rounded-md object-cover" src={product.image} alt="" />
                              </div>
                              <div className="ml-4">
                                {editingId === product.id ? (
                                  <input 
                                    type="text" 
                                    value={editForm.title} 
                                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                    className="block w-full border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500 px-2 py-1"
                                  />
                                ) : (
                                  <>
                                    <div className="text-sm font-medium text-gray-900">{product.title}</div>
                                    <div className="text-sm text-gray-500">{product.category}</div>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingId === product.id ? (
                              <input 
                                type="number" 
                                value={editForm.price} 
                                onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value)})}
                                className="block w-24 border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500 px-2 py-1"
                              />
                            ) : (
                              <span className="text-sm text-gray-900">₦{product.price.toLocaleString()}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingId === product.id ? (
                              <input 
                                type="number" 
                                value={editForm.stock} 
                                onChange={(e) => setEditForm({...editForm, stock: parseInt(e.target.value)})}
                                className="block w-20 border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500 px-2 py-1"
                              />
                            ) : (
                              <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${
                                product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {product.stock} left
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {editingId === product.id ? (
                              <div className="flex justify-end space-x-2">
                                <button onClick={saveEdit} className="text-green-600 hover:text-green-900"><Save className="h-5 w-5" /></button>
                                <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                              </div>
                            ) : (
                              <div className="flex justify-end space-x-3">
                                <button onClick={() => startEdit(product)} className="text-blue-600 hover:text-blue-900"><Edit2 className="h-5 w-5" /></button>
                                <button onClick={() => deleteProduct(product.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-5 w-5" /></button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 animate-fade-in">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Profile Settings</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={profileName} 
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={user.email} 
                    disabled 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-500 cursor-not-allowed" 
                  />
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <input 
                      type="password" 
                      placeholder="New Password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center">
                    <Save className="h-4 w-4 mr-2" /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;