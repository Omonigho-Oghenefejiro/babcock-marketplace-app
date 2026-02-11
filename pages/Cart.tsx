import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  Users, Package, DollarSign, Activity, Search, Filter, MoreVertical, 
  CheckCircle, XCircle, Ban, Eye, LayoutDashboard, ShoppingBag, 
  AlertTriangle, Download, ChevronDown, TrendingUp, Calendar, Clock, BarChart2,
  Flag, AlertCircle, MessageSquare
} from 'lucide-react';
import { SALES_DATA } from '../services/mockData';
import { useStore } from '../contexts/StoreContext';
import { Product, Order, User, Dispute } from '../types';

// ... Mock Data constants (WEEKLY_DATA, MONTHLY_DATA, HOURLY_DATA, CATEGORY_DATA, COLORS) stay same ...
const WEEKLY_DATA = [
  { name: 'Mon', sales: 45000, orders: 12 },
  { name: 'Tue', sales: 78000, orders: 19 },
  { name: 'Wed', sales: 52000, orders: 15 },
  { name: 'Thu', sales: 98000, orders: 22 },
  { name: 'Fri', sales: 125000, orders: 30 },
  { name: 'Sat', sales: 35000, orders: 10 },
  { name: 'Sun', sales: 28000, orders: 8 },
];

const MONTHLY_DATA = [
  { name: 'Week 1', sales: 320000, orders: 85 },
  { name: 'Week 2', sales: 450000, orders: 120 },
  { name: 'Week 3', sales: 380000, orders: 95 },
  { name: 'Week 4', sales: 510000, orders: 140 },
];

const HOURLY_DATA = [
  { name: '8am', sales: 5000 },
  { name: '10am', sales: 15000 },
  { name: '12pm', sales: 45000 },
  { name: '2pm', sales: 30000 },
  { name: '4pm', sales: 60000 },
  { name: '6pm', sales: 25000 },
];

const CATEGORY_DATA = [
  { name: 'Textbooks', value: 35 },
  { name: 'Electronics', value: 25 },
  { name: 'Clothing', value: 20 },
  { name: 'Food', value: 15 },
  { name: 'Other', value: 5 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminDashboard = () => {
  const { 
    products, 
    user, 
    allUsers, 
    orders,
    disputes,
    updateUserStatus, 
    impersonateUser, 
    updateProductStatus, 
    deleteProduct,
    updateOrderStatus,
    updateDisputeStatus
  } = useStore();

  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'products' | 'orders' | 'analytics' | 'disputes'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Analytics State
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [activeUsersCount, setActiveUsersCount] = useState(142);

  // Simulate real-time active users
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsersCount(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(50, prev + change);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleExportCSV = (data: Order[]) => {
    const headers = ['Order ID', 'Customer Name', 'Items Count', 'Total', 'Status', 'Date'];
    const csvContent = [
      headers.join(','),
      ...data.map(order => {
        const orderUser = allUsers.find(u => u.id === order.userId);
        return [
          order.id,
          `"${orderUser?.name || 'Unknown'}"`,
          order.items.length,
          order.total,
          order.status,
          `"${order.date}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-500 mt-2">You need administrator privileges to view this page.</p>
        </div>
      </div>
    );
  }

  // --- STATS CALCULATION ---
  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
  const pendingProducts = products.filter(p => p.status === 'pending').length;
  const activeUsers = allUsers.filter(u => u.status === 'active').length;
  const openDisputes = disputes.filter(d => d.status === 'open').length;

  // Mock "Today's" Stats
  const salesToday = 125000; // Mocked for demo
  const listingsToday = 12; // Mocked for demo

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
      <div className={`p-4 rounded-full ${color} text-white mr-4`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <div className="flex items-end">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && <span className="ml-2 text-xs text-green-600 font-medium mb-1">{trend}</span>}
        </div>
      </div>
    </div>
  );

  // --- RENDER SECTIONS ---

  const renderOverview = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`₦${totalRevenue.toLocaleString()}`} icon={DollarSign} color="bg-green-500" trend="+12% vs last month" />
        <StatCard title="Total Users" value={allUsers.length} icon={Users} color="bg-blue-500" trend="+5 new today" />
        <StatCard title="Active Listings" value={products.filter(p => p.status === 'approved').length} icon={Package} color="bg-orange-500" />
        <StatCard title="Open Disputes" value={openDisputes} icon={AlertCircle} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue Overview</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SALES_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Sales Activity</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SALES_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => {
    let chartData = WEEKLY_DATA;
    if (timeRange === 'daily') chartData = HOURLY_DATA as any;
    if (timeRange === 'monthly') chartData = MONTHLY_DATA;

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Real-time Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Users Online</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{activeUsersCount}</h3>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="flex h-2 w-2 relative mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-green-600 font-medium">Live updating</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Sales Today</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">₦{salesToday.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <span className="text-green-600 font-medium">+18%</span> from yesterday
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">New Listings Today</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2">{listingsToday}</h3>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <span className="text-green-600 font-medium">+5</span> from yesterday
            </div>
          </div>
        </div>

        {/* Detailed Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Sales Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Sales Analytics</h2>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['daily', 'weekly', 'monthly'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-sm font-medium rounded-md capitalize transition-all ${
                      timeRange === range ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Sales by Category</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={CATEGORY_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {CATEGORY_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-4">
              {CATEGORY_DATA.map((item, index) => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => {
    const filteredUsers = allUsers.filter(u => 
      (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === 'all' || u.role === filterStatus)
    );

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm"
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
              <option value="vendor">Vendor</option>
              <option value="admin">Admin</option>
            </select>
            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <Download className="h-4 w-4 mr-2" /> Export
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img className="h-10 w-10 rounded-full" src={u.avatar} alt="" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{u.name}</div>
                          <div className="text-sm text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      } capitalize`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {u.joinedDate || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        {u.id !== user.id && (
                          <>
                            <button 
                              onClick={() => impersonateUser(u.id)}
                              className="text-blue-600 hover:text-blue-900" 
                              title="Impersonate"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {u.status === 'active' ? (
                              <button 
                                onClick={() => updateUserStatus(u.id, 'suspended')}
                                className="text-red-600 hover:text-red-900" 
                                title="Suspend"
                              >
                                <Ban className="h-4 w-4" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => updateUserStatus(u.id, 'active')}
                                className="text-green-600 hover:text-green-900" 
                                title="Activate"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderProducts = () => {
    const filteredProducts = products.filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterStatus === 'all' || 
       (filterStatus === 'reported' ? (p.reportCount && p.reportCount > 0) : p.status === filterStatus))
    );

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="reported">Reported</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img className="h-10 w-10 rounded-md object-cover" src={p.image} alt="" />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1 w-48" title={p.title}>{p.title}</div>
                          <div className="text-xs text-gray-500">{p.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₦{p.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        p.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        p.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      } capitalize`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      <div>Views: {p.views || 0}</div>
                      <div className={`${p.reportCount && p.reportCount > 0 ? 'text-red-500 font-bold' : ''}`}>
                        Reports: {p.reportCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {p.status === 'pending' && (
                          <>
                            <button onClick={() => updateProductStatus(p.id, 'approved')} className="text-green-600 hover:text-green-900" title="Approve">
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button onClick={() => updateProductStatus(p.id, 'rejected')} className="text-red-600 hover:text-red-900" title="Reject">
                              <XCircle className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        <button onClick={() => deleteProduct(p.id)} className="text-gray-400 hover:text-red-600" title="Delete">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderOrders = () => {
    const filteredOrders = orders.filter(o => {
      const orderUser = allUsers.find(u => u.id === o.userId);
      const matchesSearch = 
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (orderUser && orderUser.name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filterStatus === 'all' || o.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="return_requested">Return Requested</option>
              <option value="returned">Returned</option>
            </select>
            <button 
              onClick={() => handleExportCSV(filteredOrders)}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Download className="h-4 w-4 mr-2" /> Export
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No orders found.</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {allUsers.find(u => u.id === order.userId)?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.items.length} items</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₦{order.total.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          ['return_requested', 'returned'].includes(order.status) ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="return_requested">Return Requested</option>
                        <option value="returned">Returned</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDisputes = () => {
    const filteredDisputes = disputes.filter(d => 
      (filterStatus === 'all' || d.status === filterStatus) &&
      (d.reason.toLowerCase().includes(searchTerm.toLowerCase()) || d.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search disputes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDisputes.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No disputes found.</td></tr>
              ) : (
                filteredDisputes.map((dispute) => {
                   const reporter = allUsers.find(u => u.id === dispute.reporterId);
                   return (
                  <tr key={dispute.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{dispute.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reporter?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dispute.targetType}: {dispute.targetId}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={dispute.reason}>
                      {dispute.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        dispute.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                        dispute.status === 'open' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      } capitalize`}>
                        {dispute.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {dispute.status === 'open' && (
                        <div className="flex justify-end space-x-2">
                           <button onClick={() => updateDisputeStatus(dispute.id, 'resolved')} className="text-green-600 hover:text-green-900">Resolve</button>
                           <button onClick={() => updateDisputeStatus(dispute.id, 'dismissed')} className="text-gray-600 hover:text-gray-900">Dismiss</button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}) 
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar / Topbar wrapper for simple layout */}
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 bg-white border-r border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-bold text-blue-900 flex items-center">
              <LayoutDashboard className="h-6 w-6 mr-2" /> Admin Panel
            </h2>
          </div>
          <nav className="px-4 pb-6 space-y-1">
            <button 
              onClick={() => { setActiveSection('overview'); setFilterStatus('all'); setSearchTerm(''); }}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Activity className="h-5 w-5 mr-3" /> Overview
            </button>
            <button 
              onClick={() => { setActiveSection('analytics'); setFilterStatus('all'); setSearchTerm(''); }}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'analytics' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BarChart2 className="h-5 w-5 mr-3" /> Analytics
            </button>
            <button 
              onClick={() => { setActiveSection('users'); setFilterStatus('all'); setSearchTerm(''); }}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'users' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="h-5 w-5 mr-3" /> Users
            </button>
            <button 
              onClick={() => { setActiveSection('products'); setFilterStatus('all'); setSearchTerm(''); }}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'products' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Package className="h-5 w-5 mr-3" /> Products
              {pendingProducts > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingProducts}</span>
              )}
            </button>
            <button 
              onClick={() => { setActiveSection('orders'); setFilterStatus('all'); setSearchTerm(''); }}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'orders' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ShoppingBag className="h-5 w-5 mr-3" /> Orders
            </button>
             <button 
              onClick={() => { setActiveSection('disputes'); setFilterStatus('all'); setSearchTerm(''); }}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'disputes' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Flag className="h-5 w-5 mr-3" /> Disputes
              {openDisputes > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{openDisputes}</span>
              )}
            </button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {activeSection} Management
              </h1>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>

            {activeSection === 'overview' && renderOverview()}
            {activeSection === 'analytics' && renderAnalytics()}
            {activeSection === 'users' && renderUsers()}
            {activeSection === 'products' && renderProducts()}
            {activeSection === 'orders' && renderOrders()}
            {activeSection === 'disputes' && renderDisputes()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;