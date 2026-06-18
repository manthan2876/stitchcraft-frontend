import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import {
  MdDashboard,
  MdExitToApp,
  MdClose,
  MdPerson,
  MdPeople,
} from 'react-icons/md';
import { GiScissors, GiSewingNeedle } from 'react-icons/gi';

export const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const { t } = useLanguage();

  const menuItems = [
    { name: t('dashboard'), path: '/dashboard', icon: <MdDashboard className="w-5 h-5" /> },
    { name: t('profile'), path: '/profile', icon: <MdPerson className="w-5 h-5" /> },
    { name: t('customerRegistry') !== 'customerRegistry' ? t('customerRegistry') : 'Customers', path: '/customers', icon: <MdPeople className="w-5 h-5" /> },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-[260px] h-screen bg-bg-sidebar border-r border-border-subtle flex flex-col justify-between pt-8 pb-6 select-none shrink-0 transition-transform duration-300 lg:static lg:translate-x-0 overflow-hidden lg:overflow-visible
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div>
        <div className="flex items-center justify-between px-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-color-accent-purple flex items-center justify-center text-white shadow-sm">
              <GiScissors className="w-6 h-6 transform -rotate-45" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-main tracking-wide">StitchCraft</h1>
              <span className="text-[10px] font-semibold text-color-accent-purple uppercase tracking-wider flex items-center gap-0.5">
                <GiSewingNeedle /> ERP Platform
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg bg-bg-secondary border border-border-subtle text-text-muted hover:text-text-main cursor-pointer"
            title="Close Menu"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1.5 px-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 text-sm font-medium transition-all duration-200 cursor-pointer text-text-muted hover:bg-bg-hover hover:text-text-main rounded-lg
                ${isActive ? 'sidebar-active-tab' : ''}`
              }
            >
              <div className="shrink-0">{item.icon}</div>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="px-4 flex flex-col gap-5">
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-bg-secondary hover:bg-bg-card-hover text-text-main border border-border-subtle hover:border-color-accent-purple/40 font-medium text-sm rounded-lg active:scale-98 transition-all duration-200 cursor-pointer"
        >
          <MdExitToApp className="w-4.5 h-4.5 text-color-accent-pink" />
          <span>{t('logout')}</span>
        </button>

        <div className="text-center pb-2">
          <span className="text-[9px] font-semibold text-text-muted tracking-widest uppercase opacity-55">
            © 2026 STITCHCRAFT ERP
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
