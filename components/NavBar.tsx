import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  User, 
  Menu, 
  Search, 
  Heart, 
  GraduationCap,
  X,
  LogOut
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

const Navbar = () => {
  const { user, cart, wishlist, searchQuery, setSearchQuery, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-200 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm' 
          : 'bg-white border-b border-gray-100'
      }`}>
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Refactoring UI: Choose a personality */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-primary-800 p-2 rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">
                <span className="text-primary-800">Babcock</span>
                <span className="text-gray-900">Market</span>
              </span>
            </Link>

            {/* Desktop Navigation - Refactoring UI: Limit choices */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/shop"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/shop'
                    ? 'bg-primary-50 text-primary-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Shop
              </Link>
              <Link
                to="/sell"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/sell'
                    ? 'bg-primary-50 text-primary-800'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Sell
              </Link>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:block flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for anything..."
                  className="pl-10 w-full bg-gray-50 border-gray-200 focus:bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Desktop Right Menu */}
            <div className="hidden md:flex items-center space-x-2">
              <Link
                to="/wishlist"
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Heart className="h-5 w-5" />
                {wishlist.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-pink-500 text-white">
                    {wishlist.length}
                  </Badge>
                )}
              </Link>

              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary-800 text-white">
                    {cartCount}
                  </Badge>
                )}
              </Link>

              {user ? (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 px-3 py-2 bg-primary-50 text-primary-800 rounded-md hover:bg-primary-100 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">{user.name?.split(' ')[0] || 'Profile'}</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Button asChild className="bg-primary-800 hover:bg-primary-900 text-white">
                  <Link to="/login">
                    <User className="mr-2 h-4 w-4" />
                    Sign In
                  </Link>
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center space-x-2 md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="relative"
              >
                <Search className="h-5 w-5" />
              </Button>
              
              <Link to="/cart" className="relative p-2">
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary-800 text-white">
                    {cartCount}
                  </Badge>
                )}
              </Link>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          {isSearchOpen && (
            <div className="mt-4 md:hidden animate-fade-in">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 w-full"
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
        <div className="fixed inset-0 z-40 md:hidden animate-slide-in-right">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            <div className="p-6">
              <div className="space-y-4">
                <Link
                  to="/shop"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Shop
                </Link>
                <Link
                  to="/sell"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sell
                </Link>
                <Link
                  to="/wishlist"
                  className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Wishlist</span>
                  {wishlist.length > 0 && (
                    <Badge className="bg-pink-500 text-white">{wishlist.length}</Badge>
                  )}
                </Link>

                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                        navigate('/');
                      }}
                      className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-center bg-primary-800 text-white rounded-md hover:bg-primary-900"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;