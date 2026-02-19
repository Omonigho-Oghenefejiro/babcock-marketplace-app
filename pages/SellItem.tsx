import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, DollarSign, Tag, Sparkles, Loader, X, Smartphone, AlertCircle, Store, ArrowLeft } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { Product } from '../types';
import { generateProductDescription, analyzeProductImage } from '../services/geminiService';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const SellItem = () => {
  const { user, addProduct } = useStore();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Textbooks');
  const [condition, setCondition] = useState<Product['condition']>('Used - Good');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/sell', message: 'Sign in to sell items' } });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast('File size must be less than 5MB', 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiGenerate = async () => {
    if (!title) {
      addToast('Please enter a product title first', 'error');
      return;
    }
    setIsGenerating(true);
    const desc = await generateProductDescription(title, `${category} (${condition})`);
    setDescription(desc);
    setIsGenerating(false);
    addToast('Description generated!', 'success');
  };

  const handleImageAnalysis = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    const data = await analyzeProductImage(image);
    
    if (data) {
        if (data.title) setTitle(data.title);
        if (data.description) setDescription(data.description);
        if (data.category) setCategory(data.category);
        if (data.condition) setCondition(data.condition as any);
        addToast('Product details auto-filled from image!', 'success');
    } else {
        addToast('Could not analyze image. Please try again.', 'error');
    }
    setIsAnalyzing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!title || !price || !description || !phone) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    if (parseFloat(price) <= 0) {
      addToast('Price must be greater than 0', 'error');
      return;
    }

    if (!image) {
      addToast('Please upload at least one image', 'error');
      return;
    }

    setIsSubmitting(true);

    // Simulate network delay
    setTimeout(() => {
      const newProduct: Product = {
        id: `p-${Date.now()}`,
        title,
        description,
        price: parseFloat(price),
        category,
        image,
        rating: 0,
        stock: 1, // Default for individual sellers
        sellerId: user.id,
        condition,
        contactPhone: phone,
        status: 'pending'
      };

      addProduct(newProduct);
      setIsSubmitting(false);
      navigate('/shop');
    }, 1500);
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
          >
            <Link to="/shop" className="inline-flex items-center text-primary-200 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Shop
            </Link>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-white/30 text-white">
                <Store className="h-3.5 w-3.5 mr-1" />
                Sell on Campus
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold text-white">List an Item</h1>
            </div>
            <p className="text-primary-100 mt-2">Reach thousands of students on campus instantly.</p>
          </motion.div>
        </div>
      </section>

      <div className="container-custom py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-gray-100">
          
          {/* Left Column: Image Upload */}
          <div className="p-8 lg:col-span-1 bg-gradient-to-br from-gray-50 to-white">
            <label className="block text-sm font-semibold text-gray-900 mb-4">Product Image</label>
            
            <motion.div 
              whileHover={{ scale: image ? 1 : 1.02 }}
              className={`relative border-2 border-dashed rounded-2xl p-4 text-center h-64 flex flex-col items-center justify-center transition-all ${
                image ? 'border-primary-300 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-white'
              }`}
            >
              {image ? (
                <>
                  <img src={image} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    type="button"
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className="cursor-pointer w-full h-full flex flex-col items-center justify-center"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Click to upload</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG (Max 5MB)</p>
                </div>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
              />
            </motion.div>

            {image && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleImageAnalysis}
                disabled={isAnalyzing}
                className="mt-4 w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold text-sm shadow-lg shadow-purple-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                {isAnalyzing ? 'Analyzing Image...' : 'Auto-fill with AI'}
              </motion.button>
            )}
            
            <div className="mt-6 bg-primary-50 p-4 rounded-xl flex items-start border border-primary-100">
              <AlertCircle className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <p className="ml-3 text-xs text-primary-800 leading-relaxed">
                Take clear photos in good lighting. Items with real photos sell 3x faster than those with stock images.
              </p>
            </div>
          </div>

          {/* Right Column: Form Fields */}
          <div className="p-8 lg:col-span-2 space-y-6">
            
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Product Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Calculus Textbook, Electric Kettle"
                className="w-full rounded-xl border-gray-200 focus:ring-primary-500 focus:border-primary-500 shadow-sm px-4 py-3 border transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Price (₦)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 rounded-xl border-gray-200 focus:ring-primary-500 focus:border-primary-500 px-4 py-3 border transition-all"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Tag className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-10 rounded-xl border-gray-200 focus:ring-primary-500 focus:border-primary-500 px-4 py-3 border bg-white transition-all"
                  >
                    <option value="Textbooks">Textbooks</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Food">Food & Snacks</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Services">Services</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Condition */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as Product['condition'])}
                  className="w-full rounded-xl border-gray-200 focus:ring-primary-500 focus:border-primary-500 px-4 py-3 border bg-white transition-all"
                >
                  <option value="New">New (Unopened)</option>
                  <option value="Like New">Like New (Used once/twice)</option>
                  <option value="Used - Good">Used - Good</option>
                  <option value="Used - Fair">Used - Fair</option>
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">WhatsApp / Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Smartphone className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0801 234 5678"
                    className="w-full pl-10 rounded-xl border-gray-200 focus:ring-primary-500 focus:border-primary-500 px-4 py-3 border transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-gray-900">Description</label>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={isGenerating || !title}
                  className="text-xs flex items-center text-purple-600 hover:text-purple-700 font-semibold disabled:opacity-50 transition-colors px-3 py-1.5 bg-purple-50 rounded-full"
                >
                  {isGenerating ? <Loader className="animate-spin h-3 w-3 mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                  {isGenerating ? 'Writing...' : 'Enhance with AI'}
                </motion.button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Describe specific details, defects, or reasons for selling..."
                className="w-full rounded-xl border-gray-200 focus:ring-primary-500 focus:border-primary-500 shadow-sm px-4 py-3 border resize-none transition-all"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex items-center justify-end space-x-4 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="px-6 py-5 rounded-xl"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-primary-800 to-primary-900 rounded-xl text-sm font-semibold text-white hover:shadow-xl shadow-lg shadow-primary-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center transition-all"
              >
                {isSubmitting && <Loader className="animate-spin h-4 w-4 mr-2" />}
                {isSubmitting ? 'Listing Item...' : 'Post Listing'}
              </motion.button>
            </div>
          </div>
        </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SellItem;
