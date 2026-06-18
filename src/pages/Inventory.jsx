/* src/pages/Inventory.jsx */
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/common/Card';
import { MdSearch, MdClose, MdAdd, MdEdit, MdDelete, MdInventory } from 'react-icons/md';

export const Inventory = () => {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Add/Edit Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedItem, setSelectedItem] = useState(null);
  const [form, setForm] = useState({ itemName: '', quantity: '', unit: 'meters', minQuantity: '10', purchaseAmount: '', description: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Delete Modal states
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Translation helper with fallback
  const tf = (key, fallback) => {
    const val = t(key);
    return val === key ? fallback : val;
  };

  const fetchInventory = async (search = '') => {
    setLoading(true);
    try {
      const data = await api.get(`/inventory?search=${encodeURIComponent(search)}`);
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory(searchTerm);
  }, [searchTerm]);

  const handleOpenAddModal = () => {
    setForm({ itemName: '', quantity: '0', unit: 'meters', minQuantity: '10', purchaseAmount: '', description: '' });
    setModalMode('add');
    setSelectedItem(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setForm({
      itemName: item.itemName,
      quantity: String(item.quantity),
      unit: item.unit || 'meters',
      minQuantity: String(item.minQuantity),
      purchaseAmount: '',
      description: ''
    });
    setModalMode('edit');
    setSelectedItem(item);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.itemName) {
      setFormError(tf('itemNameRequired', 'Item name is required.'));
      return;
    }
    setFormLoading(true);
    setFormError('');
    try {
      const payload = {
        itemName: form.itemName,
        quantity: Number(form.quantity) || 0,
        unit: form.unit,
        minQuantity: Number(form.minQuantity) || 10,
        purchaseAmount: Number(form.purchaseAmount) || 0,
        description: form.description || ''
      };

      if (modalMode === 'add') {
        const data = await api.post('/inventory', payload);
        setItems(prev => [data, ...prev]);
      } else {
        const data = await api.put(`/inventory/${selectedItem._id}`, payload);
        setItems(prev => prev.map(item => item._id === data._id ? data : item));
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message || tf('failedSaveInventory', 'Failed to save inventory item.'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setDeleteError('');
    try {
      await api.delete(`/inventory/${deleteTarget._id}`);
      setItems(prev => prev.filter(item => item._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err.message || tf('failedDeleteInventory', 'Failed to delete item.'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Stock':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'Low Stock':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'Out of Stock':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      default:
        return 'bg-bg-hover text-text-muted border border-border-subtle';
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
        <div>
          <h2 className="text-xl font-bold text-text-main tracking-wide">{tf('inventoryManager', 'Inventory Manager')}</h2>
          <p className="text-xs text-text-muted mt-0.5 font-semibold">
            {tf('inventorySub', 'Track raw fabrics, threads, trims, and tailoring materials')}
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="btn-tactile flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <MdAdd className="w-5 h-5 text-white-forced" />
          <span className="text-white-forced">{tf('addMaterial', 'Add Material')}</span>
        </button>
      </div>

      {/* Search Bar */}
      <Card className="py-3 px-4">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
          <input
            type="text"
            placeholder={tf('searchPlaceholder', 'Search inventory items...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bg-input border border-border-subtle rounded-xl text-sm text-text-main placeholder:text-text-muted/50 outline-none focus:border-color-accent-purple/50 transition-all text-left"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main cursor-pointer"
            >
              <MdClose className="w-4 h-4" />
            </button>
          )}
        </div>
      </Card>

      {/* Inventory Grid/Table */}
      <div className="bg-bg-secondary rounded-[20px] border border-border-subtle overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-primary/30 border-b border-border-subtle">
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">{tf('itemName', 'Item Name')}</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">{tf('stockLevel', 'Stock Level')}</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">{tf('unitType', 'Unit Type')}</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">{tf('minThreshold', 'Min Threshold')}</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">{tf('status', 'Status')}</th>
                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-center">{tf('actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-text-muted">
                    {tf('syncing', 'Syncing...')}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-text-muted">
                    {tf('noRecords', 'No inventory records found.')}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-bg-hover transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-text-main">{item.itemName}</td>
                    <td className="px-6 py-4 text-sm font-black text-text-main">
                      {item.quantity} <span className="text-xs font-bold text-text-muted">{tf(item.unit, item.unit)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-text-muted capitalize">{tf(item.unit, item.unit)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-text-muted">
                      {item.minQuantity} {tf(item.unit, item.unit)}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${getStatusBadge(item.status)}`}>
                        {item.status === 'In Stock'
                          ? tf('inStock', 'In Stock')
                          : item.status === 'Low Stock'
                          ? tf('lowStock', 'Low Stock')
                          : item.status === 'Out of Stock'
                          ? tf('outOfStock', 'Out of Stock')
                          : item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg bg-bg-secondary hover:bg-bg-card-hover border border-border-subtle text-text-muted hover:text-text-main transition-all cursor-pointer"
                          title="Edit Details"
                        >
                          <MdEdit className="w-4 h-4 text-color-accent-purple" />
                        </button>
                        <button
                          onClick={() => { setDeleteTarget(item); setDeleteError(''); }}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 hover:text-rose-600 transition-all cursor-pointer border border-rose-500/10"
                          title="Delete Item"
                        >
                          <MdDelete className="w-4 h-4 text-color-accent-pink" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-[440px] bg-bg-modal border border-border-medium rounded-[24px] p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg bg-bg-secondary border border-border-subtle text-text-muted hover:text-text-main cursor-pointer"
            >
              <MdClose className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-text-main flex items-center gap-2 mb-1">
              <MdInventory className="text-color-accent-purple w-5 h-5" />
              {modalMode === 'add' ? tf('addInventoryItem', 'Add Inventory Item') : tf('editInventoryDetails', 'Edit Inventory Details')}
            </h3>
            <p className="text-xs text-text-muted mb-5 font-semibold">
              {modalMode === 'add' ? tf('addInventoryItemDesc', 'Register new materials to your workshop inventory.') : tf('editInventoryDetailsDesc', 'Update material counts, units, and alert thresholds.')}
            </p>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{tf('itemName', 'Item Name')}</label>
                <input
                  type="text"
                  required
                  value={form.itemName}
                  onChange={e => { setForm({ ...form, itemName: e.target.value }); setFormError(''); }}
                  placeholder={tf('itemNamePlaceholder', 'e.g. Silk, Velvet fabric, Cotton Thread')}
                  className="w-full px-4 py-2.5 bg-bg-input border border-border-medium rounded-xl text-text-main outline-none focus:border-color-accent-purple text-sm transition-all placeholder:text-text-muted/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{tf('quantity', 'Quantity')}</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: e.target.value })}
                    className="w-full px-4 py-2.5 bg-bg-input border border-border-medium rounded-xl text-text-main outline-none focus:border-color-accent-purple text-sm transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{tf('unitType', 'Unit Type')}</label>
                  <select
                    value={form.unit}
                    onChange={e => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-4 py-2.5 bg-bg-input border border-border-medium rounded-xl text-text-main outline-none focus:border-color-accent-purple text-sm transition-all cursor-pointer font-bold"
                  >
                    <option value="meters" className="bg-bg-card">{tf('meters', 'Meters')}</option>
                    <option value="pieces" className="bg-bg-card">{tf('pieces', 'Pieces')}</option>
                    <option value="rolls" className="bg-bg-card">{tf('rolls', 'Rolls')}</option>
                    <option value="yards" className="bg-bg-card">{tf('yards', 'Yards')}</option>
                    <option value="packs" className="bg-bg-card">{tf('packs', 'Packs')}</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{tf('minThresholdAlert', 'Min Threshold Alert')}</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={form.minQuantity}
                  onChange={e => setForm({ ...form, minQuantity: e.target.value })}
                  placeholder="Low stock alert trigger (e.g. 10)"
                  className="w-full px-4 py-2.5 bg-bg-input border border-border-medium rounded-xl text-text-main outline-none focus:border-color-accent-purple text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{tf('purchaseCost', 'Purchase Cost (₹)')}</label>
                  <input
                    type="number"
                    min="0"
                    value={form.purchaseAmount}
                    onChange={e => setForm({ ...form, purchaseAmount: e.target.value })}
                    placeholder={tf('costPlaceholder', 'e.g. 1200')}
                    className="w-full px-4 py-2.5 bg-bg-input border border-border-medium rounded-xl text-text-main outline-none focus:border-color-accent-purple text-sm transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{tf('purchaseDescription', 'Description')}</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder={tf('descriptionPlaceholder', 'e.g. Supplier X roll')}
                    className="w-full px-4 py-2.5 bg-bg-input border border-border-medium rounded-xl text-text-main outline-none focus:border-color-accent-purple text-sm transition-all"
                  />
                </div>
              </div>

              {formError && (
                <span className="text-xs text-color-accent-pink font-bold text-center animate-pulse">
                  {formError}
                </span>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 btn-tactile-dark font-bold text-sm transition-all cursor-pointer"
                >
                  {tf('cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2.5 bg-color-accent-purple text-white-forced rounded-xl font-bold text-sm shadow-lg shadow-color-accent-purple/20 hover:bg-color-accent-purple/90 transition-all cursor-pointer disabled:opacity-50"
                >
                  {formLoading ? tf('saving', 'Saving...') : tf('save', 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-[420px] bg-bg-modal border border-border-medium rounded-[24px] p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setDeleteTarget(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg bg-bg-secondary border border-border-subtle text-text-muted hover:text-text-main cursor-pointer"
            >
              <MdClose className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-text-main flex items-center gap-2 mb-2">
              <MdDelete className="text-color-accent-pink w-5 h-5" />
              {tf('deleteMaterial', 'Delete Material')}
            </h3>
            <p className="text-xs text-text-muted mb-4 font-semibold">
              {tf('deleteMaterialConfirm', 'Are you sure you want to permanently delete')} <span className="text-text-main font-bold">{deleteTarget.itemName}</span>?
            </p>

            {deleteError && (
              <span className="text-xs text-color-accent-pink font-bold text-center block mb-4 animate-pulse">
                {deleteError}
              </span>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 btn-tactile-dark font-bold text-sm transition-all cursor-pointer"
              >
                {tf('cancel', 'Cancel')}
              </button>
              <button
                onClick={handleDeleteSubmit}
                disabled={deleteLoading}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white-forced rounded-xl font-bold text-sm shadow-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {deleteLoading ? tf('saving', 'Saving...') : tf('deleteMaterial', 'Delete Material')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
