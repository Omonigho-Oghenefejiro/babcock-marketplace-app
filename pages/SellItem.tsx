import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, DollarSign, Tag, Sparkles, Loader, X, Smartphone, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { Product } from '../types';
import { generateProductDescription, analyzeProductImage } from '../services/geminiService';
import { useToast } from '../contexts/ToastContext';

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

  if (!user) {
    navigate('/login');
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">List an Item</h1>
        <p className="text-gray-500 mt-2">Reach thousands of students on campus instantly.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:divide-x divide-gray-100">
          
          {/* Left Column: Image Upload */}
          <div className="p-8 lg:col-span-1 bg-gray-50/50">
            <label className="block text-sm font-medium text-gray-700 mb-4">Product Image</label>
            
            <div 
              className={`relative border-2 border-dashed rounded-2xl p-4 text-center h-64 flex flex-col items-center justify-center transition-all ${
                image ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-white'
              }`}
            >
              {image ? (
                <>
                  <img src={image} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                  <button 
                    type="button"
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className="cursor-pointer w-full h-full flex flex-col items-center justify-center"
                >
                  <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Click to upload</p>
                  <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG (Max 5MB)</p>
                </div>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
              />
            </div>

            {image && (
              <button
                type="button"
                onClick={handleImageAnalysis}
                disabled={isAnalyzing}
                className="mt-4 w-full flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-medium text-sm shadow-md shadow-purple-200 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isAnalyzing ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Sparkles className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />}
                {isAnalyzing ? 'Analyzing Image...' : 'Auto-fill details with AI'}
              </button>
            )}
            
            <div className="mt-6 bg-blue-50 p-4 rounded-xl flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="ml-3 text-xs text-blue-800 leading-relaxed">
                Take clear photos in good lighting. Items with real photos sell 3x faster than those with stock images.
              </p>
            </div>
          </div>

          {/* Right Column: Form Fields */}
          <div className="p-8 lg:col-span-2 space-y-6">
            
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Calculus Textbook, Electric Kettle"
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm px-4 py-2.5 border"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 px-4 py-2.5 border"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full pl-10 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 px-4 py-2.5 border bg-white"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as Product['condition'])}
                  className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 px-4 py-2.5 border bg-white"
                >
                  <option value="New">New (Unopened)</option>
                  <option value="Like New">Like New (Used once/twice)</option>
                  <option value="Used - Good">Used - Good</option>
                  <option value="Used - Fair">Used - Fair</option>
                </select>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp / Phone</label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Smartphone className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0801 234 5678"
                    className="w-full pl-10 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 px-4 py-2.5 border"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={isGenerating || !title}
                  className="text-xs flex items-center text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50 transition-colors"
                >
                  {isGenerating ? <Loader className="animate-spin h-3 w-3 mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                  {isGenerating ? 'Writing...' : 'Enhance with AI'}
                </button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Describe specific details, defects, or reasons for selling..."
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 shadow-sm px-4 py-3 border resize-none"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex items-center justify-end space-x-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2.5 bg-blue-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting && <Loader className="animate-spin h-4 w-4 mr-2" />}
                {isSubmitting ? 'Listing Item...' : 'Post Listing'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellItem;
