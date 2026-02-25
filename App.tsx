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
import Wishlist from './pages/Wishlist.tsx';
import UserDashboard from './pages/UserDashboard.tsx';
import SellItem from './pages/SellItem.tsx';
import Messages from './pages/Messages.tsx';
import PaymentCallback from './pages/PaymentCallback.tsx';
import PaymentSimulation from './pages/PaymentSimulation.tsx';
import AIAssistant from './components/AIAssistant';

const ROUTES = [
  { path: '/', element: <Home /> },
  { path: '/shop', element: <Shop /> },
  { path: '/product/:id', element: <ProductDetail /> },
  { path: '/cart', element: <Cart /> },
  { path: '/wishlist', element: <Wishlist /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/admin', element: <AdminDashboard /> },
  { path: '/dashboard', element: <UserDashboard /> },
  { path: '/sell', element: <SellItem /> },
  { path: '/messages', element: <Messages /> },
  { path: '/pay', element: <PaymentSimulation /> },
  { path: '/payment/callback', element: <PaymentCallback /> },
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <AnimatedRoutes />
      </main>
      <AIAssistant />
      {isHomePage && <Footer />}
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