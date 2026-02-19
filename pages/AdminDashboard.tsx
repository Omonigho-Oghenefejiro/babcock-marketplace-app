import { motion } from 'framer-motion';
import { AlertTriangle, Shield, LayoutDashboard, Settings, Users, Package, BarChart3 } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { fadeUpVariants, staggerContainerVariants } from '../lib/animations';
import { Badge } from '../components/ui/badge';

const AdminDashboard = () => {
  const { user } = useStore();

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
        <motion.div 
          className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <AlertTriangle className="h-20 w-20 text-red-400 mx-auto mb-6" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-3">Access Denied</h1>
          <p className="text-white/70">You need administrator privileges to view this page.</p>
        </motion.div>
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: 'Total Users', value: '1,234', change: '+12%', color: 'bg-blue-500' },
    { icon: Package, label: 'Products', value: '567', change: '+8%', color: 'bg-green-500' },
    { icon: BarChart3, label: 'Total Sales', value: '₦2.4M', change: '+23%', color: 'bg-purple-500' },
    { icon: Settings, label: 'Active Listings', value: '89', change: '+5%', color: 'bg-accent-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 py-12">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUpVariants}
          >
            <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20">
              <Shield className="h-3 w-3 mr-1" />
              Administrator
            </Badge>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <LayoutDashboard className="h-10 w-10" />
              Admin Dashboard
            </h1>
            <p className="text-white/70">Manage your marketplace, users, and content</p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom py-8">
        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-shadow"
              variants={fadeUpVariants}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {stat.change}
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Dashboard Content */}
        <motion.div 
          className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary-100 p-3 rounded-xl">
              <Settings className="h-6 w-6 text-primary-800" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
              <p className="text-gray-500 text-sm">Manage your marketplace</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Manage Users', 'Review Products', 'View Reports'].map((action) => (
              <motion.button
                key={action}
                className="p-4 rounded-xl border border-gray-200 text-left hover:border-primary-300 hover:bg-primary-50 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="font-medium text-gray-900">{action}</span>
                <p className="text-gray-500 text-sm mt-1">Coming soon</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
