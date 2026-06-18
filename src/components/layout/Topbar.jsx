import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdMenu, MdWbSunny, MdNightsStay } from 'react-icons/md';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import ProfileImage from '../../assets/profile.png';

export const Topbar = ({ pageTitle = 'Dashboard', onMenuToggle }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="h-[80px] px-4 sm:px-8 border-b border-border-subtle flex items-center justify-between bg-bg-secondary select-none">
      {/* Title & Mobile Toggle */}
      <div className="flex items-center">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg topbar-icon-btn hover:bg-bg-hover border border-border-subtle text-text-muted hover:text-text-main transition-all cursor-pointer mr-3"
          title="Toggle Navigation"
        >
          <MdMenu className="w-5 h-5" />
        </button>
        <h2 className="text-base sm:text-xl font-bold text-text-main tracking-wide truncate max-w-[150px] sm:max-w-none">{pageTitle}</h2>
      </div>

      {/* Center Search bar */}
      <div className="hidden sm:block w-full max-w-[200px] md:max-w-[380px] mx-4 relative">
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          className="w-full bg-bg-input border border-border-subtle text-xs sm:text-sm rounded-lg px-4 py-2.5 pl-11 text-text-main placeholder:text-text-muted/50 outline-none focus:border-color-accent-purple transition-all duration-200"
        />
        <MdSearch className="w-4 h-4 sm:w-5 sm:h-5 text-text-muted absolute left-4 top-1/2 transform -translate-y-1/2" />
      </div>

      {/* Right widgets */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Language Switcher */}
        <div className="flex items-center gap-1 bg-bg-primary border border-border-subtle rounded-xl px-2.5 py-1.5 shadow-sm">
          <select
            value={language}
            onChange={(e) => changeLanguage(e.target.value)}
            className="bg-transparent text-xs font-bold text-text-main outline-none cursor-pointer"
          >
            <option value="en" className="bg-bg-card">English (EN)</option>
            <option value="gu" className="bg-bg-card">ગુજરાતી (GU)</option>
            <option value="hi" className="bg-bg-card">हिन्दी (HI)</option>
          </select>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl hover:bg-bg-hover flex items-center justify-center border border-border-subtle text-text-muted hover:text-text-main transition-all cursor-pointer bg-bg-primary shadow-sm"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? (
            <MdWbSunny className="w-5 h-5 text-amber-500" />
          ) : (
            <MdNightsStay className="w-5 h-5 text-purple-400" />
          )}
        </button>

        {/* Divider */}
        <div className="h-6 sm:h-8 w-[1px] bg-border-subtle" />

        {/* Profile info - clickable */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 sm:gap-3 group cursor-pointer text-left"
          title="View Profile"
        >
          <div className="text-right hidden sm:block">
            <h4 className="text-xs sm:text-sm font-bold text-text-main group-hover:text-color-accent-purple transition-colors">
              {user?.name || 'Masterji Ramesh'}
            </h4>
            <span className="text-[10px] sm:text-xs font-semibold text-text-muted capitalize">
              {user?.role?.toLowerCase() === 'owner' ? t('roleOwner') : (user?.role || t('roleOwner'))}
            </span>
          </div>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-border-medium group-hover:border-color-accent-purple/60 bg-bg-card flex items-center justify-center shadow-md transition-all">
            <img
              src={user?.avatar && user.avatar !== 'profile.png' ? user.avatar : ProfileImage}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `<span class="text-text-main font-black text-sm">${(user?.name || 'MR').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</span>`;
              }}
            />
          </div>
        </button>
      </div>
    </div>
  );
};

export default Topbar;
