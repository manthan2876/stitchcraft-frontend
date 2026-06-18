/* src/pages/NewOrder.jsx */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import InputField from '../components/common/InputField';
import MeasurementForm from '../components/specific/MeasurementForm';
import { GiSewingNeedle } from 'react-icons/gi';

export const NewOrder = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const queryCustomerId = searchParams.get('customerId');

  const [rawCustomers, setRawCustomers] = useState([]);
  const [karigars, setKarigars] = useState([]);
  const [needsAster, setNeedsAster] = useState(false);
  const [assignedKarigar, setAssignedKarigar] = useState('');

  // Helper with fallbacks for translations
  const tf = (key, fallback) => {
    const val = t(key);
    return val === key ? fallback : val;
  };

  useEffect(() => {
    api.get('/customers').then(setRawCustomers).catch(console.error);
    api.get('/karigars').then(setKarigars).catch(err => {
      console.warn('Karigars not available yet:', err.message);
      setKarigars([]);
    });
  }, []);

  const [custMode, setCustMode] = useState('select');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  useEffect(() => {
    if (rawCustomers.length > 0) {
      if (queryCustomerId) {
        const match = rawCustomers.find(c => c._id === queryCustomerId || c.id === queryCustomerId);
        if (match) {
          setCustMode('select');
          setSelectedCustomerId(match._id);
          return;
        }
      }
      if (!selectedCustomerId) {
        setSelectedCustomerId(rawCustomers[0]._id);
      }
    }
  }, [queryCustomerId, rawCustomers, selectedCustomerId]);

  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  const [apparelType, setApparelType] = useState('Suit');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [advancePaid, setAdvancePaid] = useState('');

  const [measurements, setMeasurements] = useState({
    chest: '', waist: '', hips: '', shoulder: '', sleeves: '', neck: '', length: '', notes: ''
  });

  const handleApparelTypeChange = (e) => {
    const val = e.target.value;
    setApparelType(val);
    setMeasurements({
      chest: '', waist: '', hips: '', shoulder: '', sleeves: '', neck: '', length: '', notes: '',
      frontNeck: '', backNeck: '', lehengaLength: '', choliLength: '', inseam: ''
    });
  };

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError('');

    let customerName;
    let customerId = undefined;
    if (custMode === 'select') {
      const selected = rawCustomers.find(c => c._id === selectedCustomerId);
      customerName = selected ? selected.name : 'Unknown Client';
      customerId = selected ? selected._id : undefined;
    } else {
      customerName = newCustName || 'New Client';
    }

    const shirtFields = ['neck', 'chest', 'waist', 'hips', 'shoulder', 'sleeves', 'length', 'frontNeck', 'backNeck', 'notes'];
    const pantFields = ['length', 'waist', 'hips', 'inseam', 'thigh', 'rise', 'bottom', 'notes'];
    const shirt = {};
    const pant = {};
    shirtFields.forEach(f => { if (measurements[f] !== undefined && measurements[f] !== '') shirt[f] = measurements[f]; });
    pantFields.forEach(f => { if (measurements[f] !== undefined && measurements[f] !== '') pant[f] = measurements[f]; });

    const orderData = {
      customerName,
      customer: customerId,
      customerPhone: custMode === 'new' ? newCustPhone : undefined,
      apparelType,
      deliveryDate: deliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: parseFloat(totalAmount) || 0,
      advancePaid: parseFloat(advancePaid) || 0,
      measurements: { shirt, pant, others: measurements.notes || '' },
      needsAster,
      assignedKarigar: assignedKarigar || undefined
    };

    try {
      await api.post('/orders', orderData);
      navigate('/orders');
    } catch (err) {
      setSubmitError(err.message || 'Failed to create order.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const calculatedDue = (parseFloat(totalAmount) || 0) - (parseFloat(advancePaid) || 0);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 select-none text-left">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Part: Order Information */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-bold text-text-main tracking-wide">{tf('clientSettings', 'Client Settings')}</h3>
              <p className="text-xs text-text-muted mt-0.5">{tf('customerSub', 'Select existing or create a temporary booking client profile')}</p>
            </div>

            {/* Selector Mode Toggle */}
            <div className="flex bg-bg-secondary p-1.5 rounded-xl border border-border-subtle">
              <button
                type="button"
                onClick={() => setCustMode('select')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer
                  ${custMode === 'select' ? 'bg-color-accent-purple text-white-forced shadow-md' : 'text-text-muted hover:text-text-main'}`}
              >
                {tf('existingClient', 'Existing Client')}
              </button>
              <button
                type="button"
                onClick={() => setCustMode('new')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer
                  ${custMode === 'new' ? 'bg-color-accent-purple text-white-forced shadow-md' : 'text-text-muted hover:text-text-main'}`}
              >
                {tf('newProfile', 'New Profile')}
              </button>
            </div>

            {custMode === 'select' ? (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-muted">{tf('selectCustomer', 'Select Customer')}</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-input border border-border-medium rounded-xl text-text-main outline-none focus:border-color-accent-purple transition-all text-sm font-semibold"
                  required
                >
                  <option value="">-- {tf('selectCustomer', 'Select Customer')} --</option>
                  {rawCustomers.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <InputField
                  label={tf('customerName', 'Customer Name')}
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Anand Sharma"
                  required={custMode === 'new'}
                />
                <InputField
                  label={tf('contactPhone', 'Contact Phone')}
                  type="tel"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  required={custMode === 'new'}
                />
              </div>
            )}

            <div className="h-[1px] bg-border-subtle"></div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-muted">{tf('apparelCategory', 'Apparel Category')}</label>
                <select
                  value={apparelType}
                  onChange={handleApparelTypeChange}
                  className="w-full px-4 py-3 bg-bg-input border border-border-medium rounded-xl text-text-main outline-none focus:border-color-accent-purple transition-all text-sm font-semibold"
                >
                  <option value="Suit">{tf('apparelSuit', 'Suit')}</option>
                  <option value="Shirt">{tf('apparelShirt', 'Shirt')}</option>
                  <option value="Kurta">{tf('apparelKurta', 'Kurta')}</option>
                  <option value="Blouse">{tf('apparelBlouse', 'Blouse')}</option>
                  <option value="Lehenga">{tf('apparelLehenga', 'Lehenga')}</option>
                  <option value="Pants">{tf('apparelPants', 'Pants')}</option>
                </select>
              </div>

              <InputField
                label={tf('deliveryDeadline', 'Delivery Deadline')}
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                required
              />

              {/* Needs Aster checkbox */}
              <div className="flex items-center justify-between bg-bg-secondary border border-border-subtle rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-text-main">{tf('addAster', 'Lining Needed (Aster)')}</p>
                  <p className="text-[10px] text-text-muted mt-0.5">{tf('addAsterDesc', 'Requires extra inner lining material')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNeedsAster(prev => !prev)}
                  className={`w-11 h-6 rounded-full border-2 transition-all cursor-pointer relative ${
                    needsAster
                      ? 'bg-color-accent-purple border-color-accent-purple'
                      : 'bg-bg-hover border-border-medium'
                    }`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                    needsAster ? 'left-[calc(100%-18px)]' : 'left-0.5'
                    }`} />
                </button>
              </div>

              {/* Assign Karigar select */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-muted">{tf('assignKarigar', 'Assign Karigar')}</label>
                <select
                  value={assignedKarigar}
                  onChange={(e) => setAssignedKarigar(e.target.value)}
                  className="w-full px-4 py-3 bg-bg-input border border-border-medium rounded-xl text-text-main outline-none focus:border-color-accent-purple transition-all text-sm font-semibold"
                >
                  <option value="">-- {tf('unassigned', 'Unassigned')} --</option>
                  {karigars.filter(k => k.status === 'Active').map(k => (
                    <option key={k._id} value={k._id}>{k.name} ({k.specialization})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="h-[1px] bg-border-subtle"></div>

            <div className="flex flex-col gap-4">
              <InputField
                label={tf('totalOrderValue', 'Total Order Value')}
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="e.g. 15000"
                required
              />

              <InputField
                label={tf('advancePayment', 'Advance Payment')}
                type="number"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(e.target.value)}
                placeholder="e.g. 5000"
              />

              <div className="bg-bg-secondary p-4 rounded-xl border border-border-subtle flex items-center justify-between">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{tf('remainingDues', 'Remaining Dues')}:</span>
                <span className={`text-lg font-black ${calculatedDue > 0 ? 'text-color-accent-pink' : 'text-color-accent-emerald'}`}>
                  ₹{calculatedDue.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Part: Measurement sheet */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="flex flex-col gap-6">
            <MeasurementForm
              apparelType={apparelType}
              measurements={measurements}
              onChange={setMeasurements}
            />

            <div className="flex flex-col gap-3 mt-4 border-t border-border-subtle pt-4">
              {submitError && (
                <p className="text-xs text-color-accent-pink font-bold text-center animate-pulse">{submitError}</p>
              )}
              <div className="flex justify-end gap-3">
                <Button variant="dark" onClick={() => navigate('/orders')} className="cursor-pointer">
                  {tf('cancel', 'Cancel')}
                </Button>
                <Button variant="primary" type="submit" disabled={submitLoading} className="cursor-pointer">
                  <GiSewingNeedle className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
                  <span>{submitLoading ? tf('saving', 'Saving...') : tf('createOrderLockLedger', 'Create Order & Lock to Ledger')}</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
};

export default NewOrder;
