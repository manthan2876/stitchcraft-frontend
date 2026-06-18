/* src/pages/EditOrder.jsx */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import { MdArrowBack, MdSave, MdDelete, MdClose } from 'react-icons/md';

export const EditOrder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const [formData, setFormData] = useState({
        orderId: '', customerName: '', apparelType: '', status: 'Incoming',
        deliveryDate: '', price: '', fabric: '', needsAster: false, assignedKarigar: '',
        assignedMachine: ''
    });

    const [karigars, setKarigars] = useState([]);
    const [machines, setMachines] = useState([]);

    // Helper with fallbacks for translations
    const tf = (key, fallback) => {
        const val = t(key);
        return val === key ? fallback : val;
    };

    useEffect(() => {
        api.get('/karigars').then(setKarigars).catch(err => {
            console.warn('Karigars not available yet:', err.message);
            setKarigars([]);
        });
        api.get('/machines').then(setMachines).catch(err => {
            console.warn('Machines not available yet:', err.message);
            setMachines([]);
        });
    }, []);

    const statusList = ['Incoming', 'Measuring', 'Cutting', 'Stitching', 'Checking', 'Ready', 'Delivered'];

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await api.get(`/orders/${id}`);
                setFormData({
                    orderId: data.orderId,
                    customerName: data.customerName,
                    apparelType: data.apparelType,
                    status: data.status,
                    deliveryDate: new Date(data.deliveryDate).toISOString().split('T')[0],
                    price: data.price,
                    fabric: data.fabric || '',
                    needsAster: data.needsAster || false,
                    assignedKarigar: data.assignedKarigar ? (data.assignedKarigar._id || data.assignedKarigar) : '',
                    assignedMachine: data.assignedMachine ? (data.assignedMachine._id || data.assignedMachine) : ''
                });
            } catch (err) {
                console.error(err);
                setError(tf('failedLoadOrder', 'Failed to load order details.'));
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setError('');
        try {
             await api.put(`/orders/${id}`, {
                 status: formData.status,
                 deliveryDate: formData.deliveryDate,
                 price: Number(formData.price),
                 fabric: formData.fabric,
                 needsAster: formData.needsAster,
                 assignedKarigar: formData.assignedKarigar || null,
                 assignedMachine: formData.assignedMachine || null
             });
            navigate('/orders');
        } catch (err) {
            setError(err.message || tf('failedUpdateOrder', 'Failed to update order.'));
            setSaving(false);
        }
    };

    const handleDeleteOrder = async () => {
        setDeleteLoading(true); setDeleteError('');
        try {
            await api.delete(`/orders/${id}`);
            navigate('/orders');
        } catch (err) { setDeleteError(err.message || tf('failedDeleteOrder', 'Failed to delete order.')); }
        finally { setDeleteLoading(false); }
    };

    if (loading) return <div className="p-8 text-center text-text-muted text-sm">{tf('syncing', 'Syncing...')}</div>;

    return (
        <div className="flex flex-col gap-6 select-none max-w-3xl mx-auto text-left">
            <div className="flex items-center justify-between">
                <Link to="/orders" className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-main font-bold transition-colors">
                    <MdArrowBack className="w-4 h-4" />
                    <span>{tf('backToOrders', 'Back to Orders')}</span>
                </Link>
            </div>

            <Card className="flex flex-col gap-6">
                <div className="border-b border-border-subtle pb-4">
                    <h2 className="text-xl font-bold text-text-main tracking-wide">{tf('editOrder', 'Edit Order')}: <span className="text-color-accent-purple">{formData.orderId}</span></h2>
                    <p className="text-xs text-text-muted mt-0.5 font-semibold">
                        {tf('editOrderSub', 'Update project details for')} {formData.customerName}'s {formData.apparelType ? tf('apparel' + formData.apparelType, formData.apparelType) : '—'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{tf('customerName', 'Customer Name')}</label>
                            <div className="px-4 py-3 bg-bg-primary/50 border border-border-subtle rounded-xl text-text-main/50 text-sm font-semibold cursor-not-allowed">
                                {formData.customerName}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{tf('apparelCategory', 'Apparel Category')}</label>
                            <div className="px-4 py-3 bg-bg-primary/50 border border-border-subtle rounded-xl text-text-main/50 text-sm font-semibold cursor-not-allowed">
                                {formData.apparelType ? tf('apparel' + formData.apparelType, formData.apparelType) : '—'}
                            </div>
                        </div>

                        <InputField label={tf('totalOrderValue', 'Total Order Value')} type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                        <InputField label={tf('deliveryDeadline', 'Delivery Deadline')} type="date" value={formData.deliveryDate} onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })} required />
                        <InputField label={tf('fabricDetails', 'Fabric Details')} type="text" placeholder="e.g. Silk blend, provided by customer" value={formData.fabric} onChange={(e) => setFormData({ ...formData, fabric: e.target.value })} />

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{tf('productionStatus', 'Production Status')}</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-3 bg-bg-input border border-border-medium rounded-xl text-text-main outline-none focus:border-color-accent-purple transition-all font-bold cursor-pointer text-sm"
                            >
                                {statusList.map(s => <option key={s} value={s} className="bg-bg-card text-text-main">{tf('status' + s, s)}</option>)}
                            </select>
                        </div>

                        {/* Needs Aster toggle */}
                        <div className="flex items-center justify-between bg-bg-secondary border border-border-subtle rounded-xl px-4 py-3">
                          <div>
                            <p className="text-sm font-bold text-text-main">{tf('addAster', 'Lining Needed (Aster)')}</p>
                            <p className="text-[10px] text-text-muted mt-0.5">{tf('addAsterDesc', 'Requires extra inner lining material')}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, needsAster: !formData.needsAster })}
                            className={`w-11 h-6 rounded-full border-2 transition-all cursor-pointer relative ${
                              formData.needsAster
                                ? 'bg-color-accent-purple border-color-accent-purple'
                                : 'bg-bg-hover border-border-medium'
                              }`}
                          >
                            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                              formData.needsAster ? 'left-[calc(100%-18px)]' : 'left-0.5'
                              }`} />
                          </button>
                        </div>

                        {/* Assign Karigar select */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{tf('assignKarigar', 'Assign Karigar')}</label>
                            <select
                                value={formData.assignedKarigar}
                                onChange={(e) => setFormData({ ...formData, assignedKarigar: e.target.value })}
                                className="w-full px-4 py-3 bg-bg-input border border-border-medium rounded-xl text-text-main outline-none focus:border-color-accent-purple transition-all font-bold cursor-pointer text-sm"
                            >
                                <option value="">-- {tf('unassigned', 'Unassigned')} --</option>
                                {karigars.filter(k => k.status === 'Active' || k._id === formData.assignedKarigar).map(k => (
                                    <option key={k._id} value={k._id}>{k.name} ({k.specialization})</option>
                                ))}
                            </select>
                        </div>

                        {/* Assign Machine select */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{tf('assignMachine', 'Assign Machine')}</label>
                            <select
                                value={formData.assignedMachine}
                                onChange={(e) => setFormData({ ...formData, assignedMachine: e.target.value })}
                                className="w-full px-4 py-3 bg-bg-input border border-border-medium rounded-xl text-text-main outline-none focus:border-color-accent-purple transition-all font-bold cursor-pointer text-sm"
                            >
                                <option value="">-- {tf('unassigned', 'Unassigned')} --</option>
                                {machines.filter(m => m.status === 'Working' || m._id === formData.assignedMachine).map(m => (
                                    <option key={m._id} value={m._id}>{m.name} ({m.type})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {error && <p className="text-xs text-color-accent-pink font-bold text-center animate-pulse">{error}</p>}

                    <div className="flex justify-end gap-3 mt-4 border-t border-border-subtle pt-6 w-full">
                        <button type="button" onClick={() => setIsDeleteModalOpen(true)} className="mr-auto px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs font-bold hover:bg-rose-500/20 active:scale-98 transition-all cursor-pointer flex items-center gap-1.5">
                            <MdDelete className="w-4 h-4 text-color-accent-pink" />
                            <span>{tf('deleteOrder', 'Delete Order')}</span>
                        </button>
                        <Button variant="dark" onClick={() => navigate(-1)}>{tf('cancel', 'Cancel')}</Button>
                        <Button variant="primary" type="submit" disabled={saving}>
                            <MdSave className="w-4 h-4" />
                            <span>{saving ? tf('saving', 'Saving...') : tf('saveUpdates', 'Save Updates')}</span>
                        </Button>
                    </div>
                </form>
            </Card>

            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-[420px] bg-bg-modal border border-border-medium rounded-[24px] p-6 shadow-2xl relative">
                        <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="absolute right-4 top-4 p-1.5 rounded-lg bg-bg-secondary border border-border-subtle text-text-muted hover:text-text-main cursor-pointer">
                            <MdClose className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg font-black text-text-main flex items-center gap-2 mb-2 text-left">
                            <MdDelete className="text-color-accent-pink w-5 h-5" /> {tf('deleteOrder', 'Delete Order')}
                        </h3>
                        <p className="text-xs text-text-muted mb-4 font-semibold text-left">
                            {tf('deleteOrderConfirm', 'Are you sure you want to permanently delete the tailoring order record')} <span className="text-text-main font-bold">{formData.orderId}</span>?
                        </p>
                        {deleteError && <span className="text-xs text-color-accent-pink font-bold text-center block mb-4 animate-pulse">{deleteError}</span>}
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 bg-bg-secondary border border-border-medium text-text-main rounded-xl font-bold text-sm hover:bg-bg-card-hover transition-all cursor-pointer">{tf('cancel', 'Cancel')}</button>
                            <button type="button" onClick={handleDeleteOrder} disabled={deleteLoading} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white-forced rounded-xl font-bold text-sm shadow-lg transition-all cursor-pointer disabled:opacity-50">
                                {deleteLoading ? tf('saving', 'Saving...') : tf('deleteOrder', 'Delete Order')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditOrder;
