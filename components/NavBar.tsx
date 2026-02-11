import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, Search, LogOut, ShieldCheck, Heart, LayoutDashboard, MessageSquare } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';

const Navbar = () => {
  const { user, cart, wishlist, searchQuery, setSearchQuery, logout, conversations } = useStore();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const isAdmin = user?.role === 'admin';

  // Calculate unread messages count for current user
  const unreadMessagesCount = React.useMemo(() => {
    if (!user) return 0;
    return conversations.reduce((acc, conv) => {
      // Only count if user is participant
      if (conv.participants.includes(user.id)) {
        // Count unread messages from OTHER users
        const unreadInConv = conv.messages.filter(m => m.senderId !== user.id && !m.read).length;
        return acc + unreadInConv;
      }
      return acc;
    }, 0);
  }, [conversations, user]);

  return (
    <nav className="bg-blue-900 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 font-bold text-xl tracking-wider">
              BABCOCK<span className="text-yellow-400">MARKET</span>
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-transparent rounded-md leading-5 bg-blue-800 text-white placeholder-blue-300 focus:outline-none focus:bg-white focus:text-gray-900 sm:text-sm transition duration-150 ease-in-out"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">
              <Link to="/shop" className="hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium">Shop</Link>
              
              {user?.role === 'admin' && (
                <Link to="/admin" className="flex items-center hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium bg-blue-800">
                  <ShieldCheck className="h-4 w-4 mr-1" /> Admin Panel
                </Link>
              )}

              {user && (
                <Link to="/messages" className="relative p-2 hover:text-yellow-400 group" title="Messages">
                  <MessageSquare className="h-6 w-6" />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                      {unreadMessagesCount}
                    </span>
                  )}
                </Link>
              )}

              {!isAdmin && (
                <>
                  <Link to="/wishlist" className="relative p-2 hover:text-yellow-400 group" title="Wishlist">
                    <Heart className="h-6 w-6" />
                    {wishlist.length > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-pink-500 rounded-full">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>

                  <Link to="/cart" className="relative p-2 hover:text-yellow-400" title="Cart">
                    <ShoppingCart className="h-6 w-6" />
                    {cartCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {user ? (
                <div className="relative group">
                  <button className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-white">
                    <img className="h-8 w-8 rounded-full object-cover border-2 border-yellow-400" src={user.avatar} alt="" />
                  </button>
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block text-gray-800">
                    <div className="px-4 py-2 text-sm border-b">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    {user.role === 'admin' ? (
                        <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-gray-700">
                          <LayoutDashboard className="h-4 w-4 mr-2" /> Admin Dashboard
                        </Link>
                    ) : (
                        <Link to="/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-gray-700">
                          <LayoutDashboard className="h-4 w-4 mr-2" /> User Dashboard
                        </Link>
                    )}
                    <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-red-600">
                      <LogOut className="h-4 w-4 mr-2" /> Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="flex items-center hover:text-yellow-400 px-3 py-2 rounded-md text-sm font-medium">
                  <User className="h-5 w-5 mr-1" /> Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-blue-800">
            <Link to="/shop" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-yellow-400 hover:bg-blue-700">Shop</Link>
            {!isAdmin && (
              <>
                <Link to="/wishlist" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-yellow-400 hover:bg-blue-700">Wishlist ({wishlist.length})</Link>
                <Link to="/cart" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-yellow-400 hover:bg-blue-700">Cart ({cartCount})</Link>
              </>
            )}
            {user ? (
              <>
                 <Link to="/messages" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-yellow-400 hover:bg-blue-700 flex justify-between">
                    Messages {unreadMessagesCount > 0 && <span className="bg-red-600 px-2 rounded-full text-xs">{unreadMessagesCount}</span>}
                 </Link>
                 {isAdmin ? (
                   <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-yellow-400 hover:bg-blue-700">Admin Dashboard</Link>
                 ) : (
                   <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-yellow-400 hover:bg-blue-700">Dashboard</Link>
                 )}
                <button onClick={logout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:text-yellow-400 hover:bg-blue-700">Logout</button>
              </>
            ) : (
              <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-yellow-400 hover:bg-blue-700">Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;