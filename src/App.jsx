import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Customers from './pages/Customers';
import CustomerDetails from './pages/CustomerDetails';
import Orders from './pages/Orders';
import NewOrder from './pages/NewOrder';
import EditOrder from './pages/EditOrder';
import Payments from './pages/Payments';
import Ledger from './pages/Ledger';
import Delivery from './pages/Delivery';
import NotFound from './pages/NotFound';

export const App = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Authenticated Application Shell */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/customers/:id" element={<CustomerDetails />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/new-order" element={<NewOrder />} />
                <Route path="/orders/:id/edit" element={<EditOrder />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/ledger" element={<Ledger />} />
                <Route path="/deliveries" element={<Delivery />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Route>

              {/* Wildcard 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
