import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Package, Settings, LogOut, Store, Trash2, Edit2, Save, X, Plus, RotateCcw, LayoutDashboard } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useNavigate, Link } from 'react-router-dom';
import { Product, Order } from '../types';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <p className="text-gray-600 mb-4">Please log in to view your dashboard.</p>
          <Button onClick={() => navigate('/login')} className="bg-primary-800 hover:bg-primary-900">
            Go to Login
          </Button>
        </motion.div>
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 py-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-72 h-72 bg-accent-500/20 rounded-full blur-3xl"></div>
        </div>
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <Badge variant="outline" className="border-white/30 text-white">
              <LayoutDashboard className="h-3.5 w-3.5 mr-1" />
              Dashboard
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold text-white">My Account</h1>
          </motion.div>
        </div>
      </section>

      <div className="container-custom py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-72 flex-shrink-0"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
              <div className="p-6 border-b border-gray-100 text-center bg-gradient-to-br from-gray-50 to-white">
                <img src={user.avatar} alt="User" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-primary-100 shadow-lg" />
                <h2 className="font-bold text-lg text-gray-900">{user.name}</h2>
                <Badge className="bg-primary-100 text-primary-800 mt-2">{user.role}</Badge>
              </div>
              <nav className="p-3">
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'orders' ? 'bg-primary-50 text-primary-800 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Package className="h-5 w-5" />
                  <span>My Orders</span>
                </motion.button>
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('listings')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'listings' ? 'bg-primary-50 text-primary-800 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Store className="h-5 w-5" />
                  <span>My Listings</span>
                </motion.button>
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'profile' ? 'bg-primary-50 text-primary-800 shadow-sm' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span>Profile Settings</span>
                </motion.button>
                <motion.button
                  whileHover={{ x: 4, backgroundColor: 'rgba(254, 202, 202, 0.5)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { logout(); navigate('/'); }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all mt-2"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </motion.button>
              </nav>
            </div>
          </motion.div>

          {/* Content Area */}
          <div className="flex-1">
            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-xl font-bold text-gray-900">Order History</h2>
                </div>
                
                {orders.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                    <Button asChild className="bg-primary-800 hover:bg-primary-900">
                      <Link to="/shop">Start Shopping</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <motion.div 
                        key={order.id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-6 hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row justify-between mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Order ID: <span className="font-mono text-gray-900">{order.id}</span></p>
                          <p className="text-sm text-gray-500">Placed on: <span className="text-gray-900">{new Date(order.date).toLocaleDateString()}</span></p>
                            {order.deliveredAt && order.status === 'completed' && (
                                <p className="text-xs text-green-600 mt-1">Delivered: {new Date(order.deliveredAt).toLocaleDateString()}</p>
                            )}
                          </div>
                          <div className="mt-2 md:mt-0 text-right">
                            <p className="font-bold text-lg text-primary-900">₦{order.total.toLocaleString()}</p>
                            <Badge className={`${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              ['return_requested', 'returned'].includes(order.status) ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center bg-gray-50 rounded-xl p-3">
                              <img src={item.image} alt={item.title} className="w-14 h-14 object-cover rounded-lg border border-gray-200" />
                              <div className="ml-4 flex-1">
                                <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                              </div>
                              <p className="text-sm font-semibold text-gray-700">₦{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>

                        {/* Return Action */}
                        <div className="mt-4 flex justify-end">
                          {isReturnable(order) && (
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => requestReturn(order.id)}
                              className="flex items-center text-sm text-primary-800 font-semibold bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-xl transition-colors"
                            >
                              <RotateCcw className="h-4 w-4 mr-1.5" />
                              Return Item
                            </motion.button>
                          )}
                          {order.status === 'return_requested' && (
                              <p className="text-sm text-orange-600 italic">Return request under review.</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* LISTINGS TAB */}
            {activeTab === 'listings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                  <h2 className="text-xl font-bold text-gray-900">My Listings</h2>
                  <Button asChild className="bg-primary-800 hover:bg-primary-900">
                    <Link to="/sell">
                      <Plus className="h-4 w-4 mr-2" /> Add New
                    </Link>
                  </Button>
                </div>

                {userListings.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Store className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4">You haven't listed any items for sale.</p>
                    <Button asChild className="bg-primary-800 hover:bg-primary-900">
                      <Link to="/sell">Sell an Item</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {userListings.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-12 w-12 flex-shrink-0">
                                  <img className="h-12 w-12 rounded-xl object-cover" src={product.image} alt="" />
                                </div>
                                <div className="ml-4">
                                  {editingId === product.id ? (
                                    <input 
                                      type="text" 
                                      value={editForm.title} 
                                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                      className="block w-full border-gray-200 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 px-3 py-2"
                                    />
                                  ) : (
                                    <>
                                      <div className="text-sm font-semibold text-gray-900">{product.title}</div>
                                      <Badge className="mt-1 bg-gray-100 text-gray-600 text-xs">{product.category}</Badge>
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
                                  className="block w-28 border-gray-200 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 px-3 py-2"
                                />
                              ) : (
                                <span className="text-sm font-semibold text-gray-900">₦{product.price.toLocaleString()}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {editingId === product.id ? (
                                <input 
                                  type="number" 
                                  value={editForm.stock} 
                                  onChange={(e) => setEditForm({...editForm, stock: parseInt(e.target.value)})}
                                  className="block w-20 border-gray-200 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 px-3 py-2"
                                />
                              ) : (
                                <Badge className={`${
                                  product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {product.stock} left
                                </Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {editingId === product.id ? (
                                <div className="flex justify-end space-x-2">
                                  <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={saveEdit} 
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  >
                                    <Save className="h-5 w-5" />
                                  </motion.button>
                                  <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setEditingId(null)} 
                                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                                  >
                                    <X className="h-5 w-5" />
                                  </motion.button>
                                </div>
                              ) : (
                                <div className="flex justify-end space-x-2">
                                  <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => startEdit(product)} 
                                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                  >
                                    <Edit2 className="h-5 w-5" />
                                  </motion.button>
                                  <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => deleteProduct(product.id)} 
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </motion.button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      value={profileName} 
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-primary-500 focus:border-primary-500 transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      value={user.email} 
                      disabled 
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed" 
                    />
                  </div>
                  
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <input 
                        type="password" 
                        placeholder="New Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-primary-500 focus:border-primary-500 transition-all" 
                      />
                    </div>
                  </div>

                  <div className="pt-6">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit" 
                      className="bg-gradient-to-r from-primary-800 to-primary-900 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg shadow-primary-200 transition-all flex items-center"
                    >
                      <Save className="h-4 w-4 mr-2" /> Save Changes
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;