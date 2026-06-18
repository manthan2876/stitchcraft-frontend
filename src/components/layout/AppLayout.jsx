import React, { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export const AppLayout = () => {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-bg-primary gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-color-accent-purple border-t-transparent animate-spin"></div>
        <span className="text-sm font-semibold text-text-muted">Unlocking Ledger...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':    return t('dashboard');
      case '/profile':      return t('profile');
      default:              return "Tailor's App ERP";
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-primary relative">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar pageTitle={getPageTitle()} onMenuToggle={() => setSidebarOpen(prev => !prev)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-bg-primary">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
