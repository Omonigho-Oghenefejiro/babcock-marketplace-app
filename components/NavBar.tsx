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
  ChevronDown,
  GraduationCap,
  X
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

const Navbar = () => {
  const { user, cart, wishlist, searchQuery, setSearchQuery, logout, conversations } = useStore();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm py-2' 
          : 'bg-white border-b border-gray-100 py-3'
      }`}>
        <div className="container-custom">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 group"
            >
              <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-2 rounded-lg transform group-hover:scale-105 transition-transform duration-300">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">
                <span className="text-blue-900">Babcock</span>
                <span className="text-gray-900">Market</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/shop"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/shop'
                    ? 'bg-blue-50 text-blue-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Shop
              </Link>
              <Link
                to="/sell"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/sell'
                    ? 'bg-blue-50 text-blue-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Sell
              </Link>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:block flex-1 max-w-md mx-8" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for anything..."
                  className="pl-10 w-full bg-gray-50 border-gray-200 focus:bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                />
                
                {/* Search suggestions dropdown */}
                {isSearchOpen && searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2">
                      <div className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md cursor-pointer">
                        Search for "<span className="font-medium">{searchQuery}</span>"
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
                  className="p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <ShieldCheck className="h-5 w-5" />
                </Link>
              )}

              {user && (
                <Link
                  to="/messages"
                  className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <MessageSquare className="h-5 w-5" />
                  {unreadMessagesCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white text-xs">
                      {unreadMessagesCount}
                    </Badge>
                  )}
                </Link>
              )}

              {!isAdmin && (
                <>
                  <Link
                    to="/wishlist"
                    className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Heart className="h-5 w-5" />
                    {wishlist.length > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-pink-500 text-white text-xs">
                        {wishlist.length}
                      </Badge>
                    )}
                  </Link>

                  <Link
                    to="/cart"
                    className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-blue-900 text-white text-xs">
                        {cartCount}
                      </Badge>
                    )}
                  </Link>
                </>
              )}

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.fullName || user.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-900">
                          {getInitials(user.fullName || user.name || 'User')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.fullName || user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.role === 'admin' ? (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer w-full">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard" className="cursor-pointer w-full">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/messages" className="cursor-pointer w-full">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>Messages</span>
                        {unreadMessagesCount > 0 && (
                          <Badge className="ml-auto bg-red-500 text-white">{unreadMessagesCount}</Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/wishlist" className="cursor-pointer w-full">
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Wishlist</span>
                        {wishlist.length > 0 && (
                          <Badge className="ml-auto bg-pink-500 text-white">{wishlist.length}</Badge>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                      onClick={logout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild className="bg-blue-900 hover:bg-blue-800 text-white">
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
                <ShoppingCart className="h-5 w-5 text-gray-700" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-blue-900 text-white text-xs">
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
            <div className="mt-4 md:hidden animate-in fade-in slide-in-from-top-2">
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
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl animate-in slide-in-from-right">
            <div className="p-6">
              {user && (
                <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-gray-100">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.fullName || user.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-900">
                      {getInitials(user.fullName || user.name || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.fullName || user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
              )}
              
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
                
                {user && (
                  <>
                    <Link
                      to="/messages"
                      className="flex items-center justify-between px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>Messages</span>
                      {unreadMessagesCount > 0 && (
                        <Badge className="bg-red-500 text-white">{unreadMessagesCount}</Badge>
                      )}
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

                    {isAdmin ? (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    ) : (
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    )}
                  </>
                )}

                {user ? (
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-center bg-blue-900 text-white rounded-md hover:bg-blue-800"
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

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;