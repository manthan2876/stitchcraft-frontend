import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import { api } from '../services/api';
import {
  MdPerson, MdEmail, MdBusiness, MdEdit, MdSave,
  MdLogout, MdSecurity, MdStorefront, MdClose, MdCheck, MdAdd, MdDelete
} from 'react-icons/md';
import ProfileImage from '../assets/profile.png';

export const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('Profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Shop states
  const [shops, setShops] = useState([]);
  const [shopsLoading, setShopsLoading] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [shopModalMode, setShopModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedShop, setSelectedShop] = useState(null);
  const [shopForm, setShopForm] = useState({ shopName: '', phone: '', address: '', plan: 'Free' });
  const [shopError, setShopError] = useState('');
  const [shopModalLoading, setShopModalLoading] = useState(false);

  const [deleteTargetShop, setDeleteTargetShop] = useState(null);
  const [deleteShopLoading, setDeleteShopLoading] = useState(false);
  const [deleteShopError, setDeleteShopError] = useState('');

  const fetchShops = async () => {
    setShopsLoading(true);
    try {
      const data = await api.get('/shops');
      setShops(data);
    } catch (err) {
      console.error('Failed to fetch shops:', err);
    } finally {
      setShopsLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

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

  const handleSwitchShop = async (shopId) => {
    try {
      const data = await api.put(`/auth/switch-shop/${shopId}`);
      updateUser(data);
      navigate('/dashboard');
    } catch (err) {
      alert(err.message || 'Failed to switch shop');
    }
  };

  const handleOpenCreateShopModal = () => {
    setShopForm({ shopName: '', phone: '', address: '', plan: 'Free' });
    setShopModalMode('create');
    setSelectedShop(null);
    setShopError('');
    setIsShopModalOpen(true);
  };

  const handleOpenEditShopModal = (shop) => {
    setShopForm({
      shopName: shop.shopName,
      phone: shop.phone || '',
      address: shop.address || '',
      plan: shop.plan || 'Free'
    });
    setShopModalMode('edit');
    setSelectedShop(shop);
    setShopError('');
    setIsShopModalOpen(true);
  };

  const handleShopFormSubmit = async (e) => {
    e.preventDefault();
    if (!shopForm.shopName) {
      setShopError('Shop name is required.');
      return;
    }
    setShopModalLoading(true);
    setShopError('');
    try {
      if (shopModalMode === 'create') {
        const data = await api.post('/shops', shopForm);
        setShops(prev => [...prev, data]);
        if (!user.shopId) {
          const profile = await api.get('/auth/profile');
          updateUser(profile);
        }
      } else {
        const data = await api.put(`/shops/${selectedShop._id}`, shopForm);
        setShops(prev => prev.map(s => s._id === data._id ? data : s));
        if (user.shopId === data._id) {
          const updatedSession = { ...user, shopName: data.shopName };
          updateUser(updatedSession);
        }
      }
      setIsShopModalOpen(false);
    } catch (err) {
      setShopError(err.message || 'Failed to save shop.');
    } finally {
      setShopModalLoading(false);
    }
  };

  const handleDeleteShopSubmit = async () => {
    if (!deleteTargetShop) return;
    setDeleteShopLoading(true);
    setDeleteShopError('');
    try {
      await api.delete(`/shops/${deleteTargetShop._id}`);
      setShops(prev => prev.filter(s => s._id !== deleteTargetShop._id));
      if (user.shopId === deleteTargetShop._id) {
        const profile = await api.get('/auth/profile');
        updateUser(profile);
        navigate('/dashboard');
      }
      setDeleteTargetShop(null);
    } catch (err) {
      setDeleteShopError(err.message || 'Failed to delete shop.');
    } finally {
      setDeleteShopLoading(false);
    }
  };

  const initials = (user?.name || 'MR')
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const tabKeys = ['Profile', 'Shop Info'];
  const getTabLabel = (key) => {
    if (key === 'Profile') return t('profile');
    if (key === 'Shop Info') return t('shopsManager');
    return key;
  };

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

      {/* Tabs */}
      <div className="flex gap-2 bg-bg-secondary border border-border-subtle rounded-2xl p-1.5">
        {tabKeys.map(tabKey => (
          <button
            key={tabKey}
            onClick={() => setActiveTab(tabKey)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === tabKey
              ? 'delivery-active-tab border border-color-accent-purple/30 shadow'
              : 'filter-tab-inactive hover:text-text-main'
              }`}
          >
            {getTabLabel(tabKey)}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'Profile' && (
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
              <p className="text-xl font-black text-text-main">{shops.length || 1}</p>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-1">{t('shopsManaged')}</p>
            </div>
            <div className="bg-bg-secondary p-4 rounded-xl border border-border-subtle text-center">
              <p className="text-xl font-black text-text-main">2026</p>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-1">{t('memberSince')}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Shop Info Tab */}
      {activeTab === 'Shop Info' && (
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div>
                <h3 className="text-base font-bold text-text-main">{t('shopsManager')}</h3>
                <p className="text-xs text-text-muted mt-0.5">{t('shopsManagerSub')}</p>
              </div>
              <button
                onClick={handleOpenCreateShopModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-color-accent-purple hover:bg-color-accent-purple/90 text-white-forced font-bold rounded-xl text-xs shadow-lg transition-all cursor-pointer"
              >
                <MdAdd className="w-4 h-4 text-white-forced" />
                <span>{t('newShop')}</span>
              </button>
            </div>

            {shopsLoading ? (
              <div className="text-center py-8 text-xs text-text-muted">{t('syncing')}</div>
            ) : shops.length === 0 ? (
              <div className="text-center py-8 text-xs text-text-muted">{t('noRecords')}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {shops.map(shop => {
                  const isActive = user?.shopId === shop._id;
                  return (
                    <div
                      key={shop._id}
                      className={`p-5 rounded-2xl border transition-all flex flex-col gap-4 text-left relative overflow-hidden
                        ${isActive
                          ? 'shop-active-card shadow-lg shadow-color-accent-purple/5'
                          : 'border-border-subtle bg-bg-secondary hover:border-border-medium'}`}
                    >
                      {isActive && (
                        <div className="absolute right-4 top-4 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider bg-color-accent-purple text-white-forced rounded-md border border-color-accent-purple/40">
                          {t('activeSession')}
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                          ${isActive ? 'bg-color-accent-purple/20 text-color-accent-purple' : 'bg-bg-hover text-text-muted'}`}
                        >
                          <MdStorefront className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 pr-12">
                          <h4 className="text-sm font-bold text-text-main truncate">{shop.shopName}</h4>
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#007aff]">
                            {t((shop.plan || 'Free').toLowerCase() + 'plan')}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 text-xs text-text-muted border-t border-border-subtle pt-3">
                        {shop.phone && <span className="truncate">📞 {shop.phone}</span>}
                        {shop.address && <span className="truncate">📍 {shop.address}</span>}
                      </div>

                      <div className="flex items-center gap-2 border-t border-border-subtle pt-3 mt-auto">
                        {!isActive ? (
                          <button
                            onClick={() => handleSwitchShop(shop._id)}
                            className="flex-1 py-1.5 bg-bg-card hover:bg-bg-card-hover text-text-main rounded-xl text-[10px] font-extrabold transition-all cursor-pointer border border-border-subtle hover:border-color-accent-purple/40"
                          >
                            {t('switchActive')}
                          </button>
                        ) : (
                          <span className="flex-1 text-[10px] text-color-accent-emerald font-black flex items-center gap-1">
                            <MdCheck className="w-3.5 h-3.5" />
                            <span>{t('currentlyActive')}</span>
                          </span>
                        )}
                        <button
                          onClick={() => handleOpenEditShopModal(shop)}
                          className="px-2.5 py-1.5 bg-bg-hover hover:bg-border-medium text-text-main rounded-xl text-[10px] font-bold transition-all cursor-pointer border border-border-subtle"
                          title={t('editDetails')}
                        >
                          <MdEdit className="w-3.5 h-3.5 text-color-accent-purple" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetShop(shop)}
                          className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-xl text-[10px] font-bold transition-all cursor-pointer border border-rose-500/10"
                          title={t('deleteShop')}
                        >
                          <MdDelete className="w-3.5 h-3.5 text-color-accent-pink" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Create/Edit Shop Modal */}
      {isShopModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-[440px] bg-bg-modal border border-border-medium rounded-[24px] p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setIsShopModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg bg-bg-secondary border border-border-subtle text-text-muted hover:text-text-main cursor-pointer"
            >
              <MdClose className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-text-main flex items-center gap-2 mb-1">
              <MdStorefront className="text-color-accent-purple w-5 h-5" />
              {shopModalMode === 'create' ? t('createShop') : t('editShopDetails')}
            </h3>
            <p className="text-xs text-text-muted mb-5 font-semibold">
              {shopModalMode === 'create' ? t('createShopDesc') : t('editShopDetailsDesc')}
            </p>

            <form onSubmit={handleShopFormSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{t('shopName')} *</label>
                <input
                  type="text"
                  required
                  value={shopForm.shopName}
                  onChange={e => { setShopForm({ ...shopForm, shopName: e.target.value }); setShopError(''); }}
                  placeholder={t('shopName')}
                  className="w-full px-4 py-2.5 bg-bg-input border border-border-medium rounded-xl text-text-main outline-none focus:border-color-accent-purple text-sm transition-all placeholder:text-text-muted/50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{t('contactPhone')}</label>
                <input
                  type="tel"
                  value={shopForm.phone}
                  onChange={e => setShopForm({ ...shopForm, phone: e.target.value })}
                  placeholder={t('contactPhone')}
                  className="w-full px-4 py-2.5 bg-bg-input border border-border-medium rounded-xl text-text-main outline-none focus:border-color-accent-purple text-sm transition-all placeholder:text-text-muted/50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{t('address')}</label>
                <input
                  type="text"
                  value={shopForm.address}
                  onChange={e => setShopForm({ ...shopForm, address: e.target.value })}
                  placeholder={t('address')}
                  className="w-full px-4 py-2.5 bg-bg-input border border-border-medium rounded-xl text-text-main outline-none focus:border-color-accent-purple text-sm transition-all placeholder:text-text-muted/50"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{t('planTier')}</label>
                <select
                  value={shopForm.plan}
                  onChange={e => setShopForm({ ...shopForm, plan: e.target.value })}
                  className="w-full px-4 py-2.5 bg-bg-input border border-border-medium rounded-xl text-text-main outline-none focus:border-color-accent-purple text-sm transition-all cursor-pointer font-bold"
                >
                  <option value="Free" className="bg-bg-card text-text-main">{t('freePlan')}</option>
                  <option value="Basic" className="bg-bg-card text-text-main">{t('basicPlan')}</option>
                  <option value="Premium" className="bg-bg-card text-text-main">{t('premiumPlan')}</option>
                </select>
              </div>

              {shopError && (
                <span className="text-xs text-color-accent-pink font-bold text-center animate-pulse">
                  {shopError}
                </span>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsShopModalOpen(false)}
                  className="flex-1 py-2.5 btn-tactile-dark font-bold text-sm transition-all cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={shopModalLoading}
                  className="flex-1 py-2.5 bg-color-accent-purple text-white-forced rounded-xl font-bold text-sm shadow-lg shadow-color-accent-purple/20 hover:bg-color-accent-purple/90 transition-all cursor-pointer disabled:opacity-50"
                >
                  {shopModalLoading ? t('saving') : t('saveDetails')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Shop Confirmation Modal */}
      {deleteTargetShop && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-[420px] bg-bg-modal border border-border-medium rounded-[24px] p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setDeleteTargetShop(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg bg-bg-secondary border border-border-subtle text-text-muted hover:text-text-main cursor-pointer"
            >
              <MdClose className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-text-main flex items-center gap-2 mb-2">
              <MdDelete className="text-color-accent-pink w-5 h-5" />
              {t('deleteShopConfirmTitle')}
            </h3>
            <p className="text-xs text-text-muted mb-4 font-semibold">
              {t('deleteShopConfirmDesc').replace('{shopName}', deleteTargetShop.shopName)}
            </p>

            {deleteShopError && (
              <span className="text-xs text-color-accent-pink font-bold text-center block mb-4 animate-pulse">
                {deleteShopError}
              </span>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTargetShop(null)}
                className="flex-1 py-2.5 btn-tactile-dark font-bold text-sm transition-all cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleDeleteShopSubmit}
                disabled={deleteShopLoading}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white-forced rounded-xl font-bold text-sm shadow-lg shadow-rose-950/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {deleteShopLoading ? t('saving') : t('deleteShop')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
