import { motion } from 'framer-motion';
import { Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useStore } from '../contexts/StoreContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { fadeUpVariants, staggerContainerVariants } from '../lib/animations';

const Wishlist = () => {
  const { wishlist } = useStore();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom py-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Heart className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8">Save items you want to view later.</p>
            <Button asChild className="bg-primary-800 hover:bg-primary-900 px-8 py-6 text-base font-semibold rounded-xl">
              <Link to="/shop">Explore Products</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 py-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl"></div>
        </div>
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link to="/shop" className="inline-flex items-center text-primary-200 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Shop
            </Link>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-white/30 text-white">
                <Heart className="h-3.5 w-3.5 mr-1" />
                {wishlist.length} items
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold text-white">My Wishlist</h1>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container-custom py-8">
        <motion.div 
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {wishlist.map((product) => (
            <motion.div 
              key={product.id} 
              variants={fadeUpVariants}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Wishlist;