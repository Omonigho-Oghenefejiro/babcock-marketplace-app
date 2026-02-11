import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './contexts/StoreContext';
import { ToastProvider } from './contexts/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIAssistant from './components/AIAssistant';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Wishlist from './pages/Wishlist';
import UserDashboard from './pages/UserDashboard';
import SellItem from './pages/SellItem';
import Messages from './pages/Messages';
import PaymentCallback from './pages/PaymentCallback';

const App = () => {
  return (
    <ToastProvider>
      <StoreProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/sell" element={<SellItem />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/payment/callback" element={<PaymentCallback />} />
              </Routes>
            </main>
            <AIAssistant />
            <Footer />
          </div>
        </Router>
      </StoreProvider>
    </ToastProvider>
  );
};

export default App;