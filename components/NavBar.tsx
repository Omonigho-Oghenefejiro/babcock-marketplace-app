import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, 
  User, 
  Menu, 
  Search, 
  LogOut, 
  ShieldCheck, 
  Heart, 
  LayoutDashboard, 
  MessageSquare,
  X,
  ChevronDown,
  Store,
  Bell
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';

const Navbar = () => {
  const { user, cart, wishlist, searchQuery, setSearchQuery, logout, conversations } = useStore();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const isAdmin = user?.role === 'admin';

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  // Calculate unread messages
  const unreadMessagesCount = React.useMemo(() => {
    if (!user) return 0;
    return conversations.reduce((acc, conv) => {
      if (conv.participants.includes(user.id)) {
        const unreadInConv = conv.messages.filter(m => m.senderId !== user.id && !m.read).length;
        return acc + unreadInConv;
      }
      return acc;
    }, 0);
  }, [conversations, user]);

  const navLinks = [
    { to: '/shop', label: 'Shop', icon: Store },
    { to: '/sell', label: 'Sell', icon: Store },
  ];

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' 
          : 'bg-white shadow-sm py-3'
      }`}>
        <div className="container-custom">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 group"
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg transform group-hover:rotate-6 transition-transform duration-300">
                <Store className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Babcock
                </span>
                <span className="text-gray-900">Market</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.to
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Search */}
            <div className="hidden md:block flex-1 max-w-md mx-8" ref={searchRef}>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl 
                           bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 
                           focus:border-transparent outline-none transition-all duration-200"
                  placeholder="Search for anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                />
                
                {/* Search suggestions dropdown */}
                {isSearchOpen && searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="p-2">
                      <div className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer">
                        Search for "{searchQuery}"
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Right Menu */}
            <div className="hidden md:flex items-center space-x-2">
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors group"
                >
                  <ShieldCheck className="h-5 w-5 group-hover:text-blue-600" />
                </Link>
              )}

              {user && (
                <Link
                  to="/messages"
                  className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors group"
                >
                  <MessageSquare className="h-5 w-5 group-hover:text-blue-600" />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {unreadMessagesCount}
                    </span>
                  )}
                </Link>
              )}

              {!isAdmin && (
                <>
                  <Link
                    to="/wishlist"
                    className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors group"
                  >
                    <Heart className="h-5 w-5 group-hover:text-pink-500" />
                    {wishlist.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/cart"
                    className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors group"
                  >
                    <ShoppingCart className="h-5 w-5 group-hover:text-blue-600" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {/* User Menu */}
              <div className="relative" ref={profileRef}>
                {user ? (
                  <>
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-colors group"
                    >
                      <div className="relative">
                        <img
                          className="h-8 w-8 rounded-xl object-cover ring-2 ring-gray-200 group-hover:ring-blue-500 transition-all"
                          src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                          alt={user.name}
                        />
                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full ring-2 ring-white"></div>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
                        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-blue-100 text-sm truncate">{user.email}</p>
                        </div>
                        
                        <div className="p-2">
                          {user.role === 'admin' ? (
                            <Link
                              to="/admin"
                              className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <LayoutDashboard className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-700">Admin Dashboard</span>
                            </Link>
                          ) : (
                            <Link
                              to="/dashboard"
                              className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <LayoutDashboard className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-700">Dashboard</span>
                            </Link>
                          )}

                          <button
                            onClick={() => {
                              logout();
                              setIsProfileOpen(false);
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors group"
                          >
                            <LogOut className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-600">Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">Sign In</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-2 md:hidden">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
              
              <Link to="/cart" className="relative p-2 text-gray-700">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          {isSearchOpen && (
            <div className="mt-4 md:hidden animate-fadeIn">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-slideIn">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            <div className="p-6">
              <div className="space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {user && (
                  <>
                    <Link
                      to="/messages"
                      className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>Messages</span>
                      {unreadMessagesCount > 0 && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                          {unreadMessagesCount}
                        </span>
                      )}
                    </Link>
                    
                    <Link
                      to="/wishlist"
                      className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>Wishlist</span>
                      {wishlist.length > 0 && (
                        <span className="bg-pink-500 text-white px-2 py-1 rounded-full text-xs">
                          {wishlist.length}
                        </span>
                      )}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-20" />
    </>
  );
};

export default Navbar;