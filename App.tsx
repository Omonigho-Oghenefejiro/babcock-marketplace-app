import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { StoreProvider } from './contexts/StoreContext';
import { ToastProvider } from './contexts/ToastContext';
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import Home from './pages/Home.tsx';
import Shop from './pages/Shop.tsx';
import ProductDetail from './pages/ProductDetail.tsx';
import Cart from './pages/Cart.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import ForgotPassword from './pages/ForgotPassword.tsx';
import ResetPassword from './pages/ResetPassword.tsx';
import AdminInventory from './pages/AdminInventory.tsx';
import AdminReports from './pages/AdminReports.tsx';
import Wishlist from './pages/Wishlist.tsx';
import UserDashboard from './pages/UserDashboard.tsx';
import SellItem from './pages/SellItem.tsx';
import Messages from './pages/Messages.tsx';
import PaymentCallback from './pages/PaymentCallback.tsx';
import PaymentSimulation from './pages/PaymentSimulation.tsx';
import PurchasedItems from './pages/PurchasedItems.tsx';
import AIAssistant from './components/AIAssistant';

const ROUTES = [
  { path: '/', element: <Home /> },
  { path: '/shop', element: <Shop /> },
  { path: '/product/:id', element: <ProductDetail /> },
  { path: '/cart', element: <Cart /> },
  { path: '/wishlist', element: <Wishlist /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/admin', element: <AdminDashboard /> },
  { path: '/admin/inventory', element: <AdminInventory /> },
  { path: '/admin/reports', element: <AdminReports /> },
  { path: '/dashboard', element: <UserDashboard /> },
  { path: '/sell', element: <SellItem /> },
  { path: '/messages', element: <Messages /> },
  { path: '/pay', element: <PaymentSimulation /> },
  { path: '/payment/callback', element: <PaymentCallback /> },
  { path: '/purchased-items', element: <PurchasedItems /> },
];

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {ROUTES.map(route => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Routes>
    </AnimatePresence>
  );
};

const AppContent = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isStandalonePaymentPage = location.pathname === '/pay' || location.pathname === '/payment/callback';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {!isStandalonePaymentPage && <Navbar />}
      <main className="flex-grow">
        <AnimatedRoutes />
      </main>
      {!isStandalonePaymentPage && <AIAssistant />}
      {!isStandalonePaymentPage && isHomePage && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <ToastProvider>
      <StoreProvider>
        <Router>
          <AppContent />
        </Router>
      </StoreProvider>
    </ToastProvider>
  );
};

export default App;