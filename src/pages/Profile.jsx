import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import { api } from '../services/api';
import {
  MdPerson, MdEmail, MdBusiness, MdEdit, MdSave,
  MdLogout, MdSecurity
} from 'react-icons/md';
import ProfileImage from '../assets/profile.png';

export const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      alert('Image size should be less than 1MB');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Data = reader.result;
      try {
        const data = await api.put('/auth/profile', { avatar: base64Data });
        updateUser(data);
      } catch (err) {
        console.error('Failed to upload photo:', err);
        alert(err.message || 'Failed to upload profile photo');
      }
    };
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await api.put('/auth/profile', { name });
      updateUser(data);
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const initials = (user?.name || 'MR')
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col gap-6 select-none max-w-3xl mx-auto">
      {/* Profile Hero Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-color-accent-purple/40 via-color-accent-blue/30 to-color-accent-pink/30 blur-sm" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-4 pt-10 pb-2">
          <input type="file" id="avatar-upload" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          <div
            onClick={() => document.getElementById('avatar-upload').click()}
            className="w-20 h-20 rounded-2xl border-4 border-[var(--color-bg-primary)] overflow-hidden shadow-2xl shrink-0 bg-gradient-to-br from-color-accent-purple to-color-accent-blue flex items-center justify-center cursor-pointer group relative"
            title="Upload Profile Photo"
          >
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] text-white-forced font-bold transition-opacity z-20">
              <MdEdit className="w-4 h-4 mb-0.5 text-color-accent-purple" />
              <span>Upload</span>
            </div>
            <img
              src={user?.avatar && user.avatar !== 'profile.png' ? user.avatar : ProfileImage}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={e => {
                e.target.style.display = 'none';
                e.target.parentElement.querySelector('.initials-fallback').style.display = 'flex';
              }}
            />
            <span className="initials-fallback hidden text-white-forced font-black text-2xl items-center justify-center w-full h-full">
              {initials}
            </span>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-black text-text-main">{user?.name || 'Masterji Ramesh'}</h2>
            <p className="text-sm text-text-muted font-semibold mt-0.5">
              <span className="text-color-accent-purple font-bold capitalize">{user?.role?.toLowerCase() === 'owner' ? t('roleOwner') : (user?.role || t('roleOwner'))}</span>
              {' • '}
              <span>{user?.shopName || 'Ramesh Tailors'}</span>
            </p>
            <p className="text-xs text-text-muted mt-1">{user?.email}</p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-bold hover:bg-rose-500/20 transition-all cursor-pointer self-end sm:self-auto"
          >
            <MdLogout className="w-4 h-4" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </Card>

      {/* Profile Info Details */}
      <Card className="flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
          <div>
            <h3 className="text-base font-bold text-text-main">{t('personalInfo')}</h3>
            <p className="text-xs text-text-muted mt-0.5">{t('personalInfoSub')}</p>
          </div>
          {!isEditingProfile ? (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary border border-border-medium rounded-xl text-xs font-bold text-text-muted hover:text-text-main cursor-pointer"
            >
              <MdEdit className="w-4 h-4" />{t('edit')}
            </button>
          ) : (
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-color-accent-purple rounded-xl text-xs font-bold text-white-forced cursor-pointer disabled:opacity-50"
            >
              <MdSave className="w-4 h-4 text-white-forced" />{loading ? 'Saving...' : t('save')}
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-color-accent-pink font-semibold">{error}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
              <MdPerson className="w-3.5 h-3.5 text-color-accent-purple" />
              {t('fullName')}
            </label>
            {isEditingProfile ? (
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="px-4 py-2.5 bg-bg-input border border-border-medium rounded-xl text-sm text-text-main outline-none focus:border-color-accent-purple transition-all"
              />
            ) : (
              <p className="px-4 py-2.5 bg-bg-secondary border border-border-subtle rounded-xl text-sm text-text-main font-semibold">
                {user?.name || 'Masterji Ramesh'}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
              <MdEmail className="w-3.5 h-3.5 text-color-accent-purple" />
              {t('emailAddress')}
            </label>
            <p className="px-4 py-2.5 bg-bg-secondary border border-border-subtle rounded-xl text-sm text-text-main font-semibold">
              {user?.email}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
              <MdSecurity className="w-3.5 h-3.5 text-color-accent-purple" />
              {t('role')}
            </label>
            <p className="px-4 py-2.5 bg-bg-secondary border border-border-subtle rounded-xl text-sm text-text-main font-semibold">
              {user?.role?.toLowerCase() === 'owner' ? t('roleOwner') : (user?.role || t('roleOwner'))}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
              <MdBusiness className="w-3.5 h-3.5 text-color-accent-purple" />
              {t('shopName')}
            </label>
            <p className="px-4 py-2.5 bg-bg-secondary border border-border-subtle rounded-xl text-sm text-text-main font-semibold">
              {user?.shopName || 'Ramesh Tailors'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-2 border-t border-border-subtle pt-5">
          <div className="bg-bg-secondary p-4 rounded-xl border border-border-subtle text-center">
            <p className="text-xl font-black text-text-main">
              {user?.role?.toLowerCase() === 'owner' ? t('roleOwner') : (user?.role || t('roleOwner'))}
            </p>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-1">{t('accountType')}</p>
          </div>
          <div className="bg-bg-secondary p-4 rounded-xl border border-border-subtle text-center">
            <p className="text-xl font-black text-text-main">1</p>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-1">{t('shopsManaged')}</p>
          </div>
          <div className="bg-bg-secondary p-4 rounded-xl border border-border-subtle text-center">
            <p className="text-xl font-black text-text-main">2026</p>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-1">{t('memberSince')}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
