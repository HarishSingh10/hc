import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import RestaurantDetail from './pages/RestaurantDetail';
import CartPage from './pages/CartPage';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import AdminMenu from './pages/AdminMenu';
import AdminOrders from './pages/AdminOrders';
import AdminRestaurants from './pages/AdminRestaurants';
import OwnerMenu from './pages/OwnerMenu';

/* Only show footer on non-admin routes */
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div style={styles.app}>
      <Navbar />
      <div style={styles.pageContent}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/restaurant/:id" element={<RestaurantDetail />} />

          {/* Customer Protected Routes */}
          <Route 
            path="/cart" 
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CartPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <Orders />
              </ProtectedRoute>
            } 
          />

          {/* Shop Owner Protected Routes */}
          <Route 
            path="/owner" 
            element={
              <ProtectedRoute allowedRoles={['SHOP_OWNER']}>
                <OwnerMenu />
              </ProtectedRoute>
            } 
          />

          {/* Admin Protected Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/restaurants" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminRestaurants />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/menus" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminMenu />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/orders" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminOrders />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
      {!isAdminRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-main)',
  },
  pageContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  }
};

export default App;
