/* src/pages/Ledger.jsx */
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Card from '../components/common/Card';
import LedgerRow from '../components/specific/LedgerRow';
import { formatCurrency } from '../utils/formatters';
import {
  calculateTotalAdvances,
  calculateTotalDues,
  calculateTotalValue
} from '../utils/calculations';
import { RiVisaLine } from 'react-icons/ri';
import { useLanguage } from '../context/LanguageContext';

export const Ledger = () => {
  const { transactions, orders } = useOutletContext() || {
    transactions: [],
    orders: []
  };

  const [activeCard, setActiveCard] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const { t } = useLanguage();

  // Helper with fallbacks for translations
  const tf = (key, fallback) => {
    const val = t(key);
    return val === key ? fallback : val;
  };

  // Ledger sums
  const totalReceived = calculateTotalAdvances(orders);
  const totalOutstanding = calculateTotalDues(orders);
  const totalSales = calculateTotalValue(orders);

  // Filter transactions
  const filteredTx = transactions.filter(tx => {
    const matchesSearch = tx.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // In database/payment status schema, filterType corresponds to tx.status ('Paid', 'Partial', 'Pending') 
    // or credit/debit transaction type if defined.
    const matchesType = filterType === 'All' || tx.type === filterType || tx.status === filterType;
    return matchesSearch && matchesType;
  });

  // Export to CSV Feature
  const downloadCSV = () => {
    const headers = ['Date', 'Transaction ID', 'Customer', 'Description', 'Amount', 'Status', 'Method'];
    const csvData = filteredTx.map(tx => [
      new Date(tx.date).toLocaleDateString(),
      tx.id,
      tx.customerName,
      tx.description,
      tx.amount,
      tx.status,
      tx.paymentType
    ]);

    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `StitchCraft_Ledger_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-8 select-none text-left">

      {/* Financial Summary Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Ledger Transaction Log (Col-span 2) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-bg-secondary rounded-[20px] border border-border-subtle overflow-hidden shadow-card">

            {/* Header controls */}
            <div className="p-6 border-b border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-text-main tracking-wide">{tf('journalEntries', 'Journal Entries')}</h3>
                <p className="text-xs text-text-muted mt-0.5 font-semibold">{tf('journalEntriesSub', 'Detailed historical audits of financial deposits and credits')}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button onClick={downloadCSV} className="btn-tactile-dark flex items-center gap-1.5 cursor-pointer">
                  <span>{tf('downloadCsv', 'Download CSV')}</span>
                </button>
                <button className="btn-tactile-dark flex items-center gap-1.5 cursor-pointer">
                  <span>{tf('exportPdf', 'Export PDF')}</span>
                </button>
              </div>
            </div>

            {/* Filter Toolbars */}
            <div className="p-6 bg-bg-primary/25 border-b border-border-subtle flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Search */}
              <div className="w-full md:w-[280px] relative">
                <input
                  type="text"
                  placeholder={tf('searchLedgerPlaceholder', 'Search ledger...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-bg-input border border-border-subtle text-xs rounded-xl px-3 py-2.5 pl-9 text-text-main placeholder:text-text-muted/50 outline-none focus:border-color-accent-purple/50 transition-all text-sm"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted text-xs font-bold">🔍</span>
              </div>

              {/* Transaction Filters */}
              <div className="flex items-center gap-2">
                {['All', 'Paid', 'Partial', 'Pending'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer border
                      ${filterType === type
                        ? 'bg-color-accent-purple border-color-accent-purple text-white-forced shadow-md'
                        : 'filter-tab-inactive hover:text-text-main'}`}
                  >
                    {type === 'All' ? tf('allTransactions', 'All') : tf(type.toLowerCase(), type)}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction Grid */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-primary/30 border-b border-border-subtle">
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">{tf('noCol', 'No.')}</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">{tf('dateCreated', 'Date')}</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">{tf('refId', 'Ref ID')}</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">{tf('description', 'Description')}</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">{tf('nominal', 'Nominal')}</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">{tf('status', 'Status')}</th>
                    <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">{tf('actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {filteredTx.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-sm text-text-muted">
                        {tf('noLedgerEntries', 'No ledger entry matches criteria.')}
                      </td>
                    </tr>
                  ) : (
                    filteredTx.map((tx, idx) => (
                      <LedgerRow
                        key={tx.id}
                        tx={tx}
                        index={idx}
                        onEdit={(t) => console.log('Edit', t)}
                        onViewDetails={(t) => console.log('View', t)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Right column - Card Widget & Breakdown */}
        <div className="flex flex-col gap-8">

          {/* Pembayaran & Biaya (Payments & Cost) Card */}
          <Card className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-bold text-text-main tracking-wide">{tf('cashAccountCard', 'Cash Account Card')}</h3>
              <p className="text-xs text-text-muted mt-0.5">{tf('cashAccountSub', 'Active tailoring merchant wallet details')}</p>
            </div>

            {/* Skeuomorphic blue credit card */}
            <div
              className={`w-full h-[190px] rounded-2xl p-6 bg-grad-card-blue flex flex-col justify-between shadow-2xl relative overflow-hidden transition-all duration-300
                ${activeCard ? 'opacity-100 scale-100 shadow-blue-500/10' : 'opacity-40 grayscale scale-98 shadow-none'}`}
            >
              {/* CloudCash pattern lines */}
              <div className="absolute top-0 right-0 left-0 bottom-0 opacity-15 pointer-events-none">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <path d="M-20 60 C 50 10, 150 90, 200 40 C 250 -10, 320 80, 420 20" fill="none" stroke="white" strokeWidth="4" />
                  <path d="M-20 100 C 50 50, 150 130, 200 80 C 250 30, 320 120, 420 60" fill="none" stroke="white" strokeWidth="3" />
                </svg>
              </div>

              {/* Card Top */}
              <div className="flex items-start justify-between z-10 text-white-forced">
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold text-white/70 uppercase tracking-widest">StitchCraft Card</span>
                  <span className="text-xs font-bold text-white/95">Masterji Account</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-black italic tracking-wider flex items-center gap-1">
                    <RiVisaLine className="w-8 h-8 text-white-forced" />
                  </span>
                </div>
              </div>

              {/* Card Middle */}
              <div className="z-10 text-white-forced font-mono text-lg font-black tracking-widest my-2.5">
                5789 &nbsp; **** &nbsp; **** &nbsp; 2847
              </div>

              {/* Card Bottom */}
              <div className="flex justify-between items-end z-10 text-white-forced">
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest">{tf('cardHolder', 'Card Holder')}</span>
                  <span className="text-xs font-black">Ramesh Masterji</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest">{tf('expires', 'Expires')}</span>
                  <span className="text-xs font-black">06 / 31</span>
                </div>
              </div>
            </div>

            {/* Financial Dues Details */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center py-2.5 border-b border-border-subtle">
                <span className="text-xs text-text-muted font-bold uppercase tracking-wider">{tf('currentCashInHand', 'Current Cash In Hand')}</span>
                <span className="text-lg font-black text-text-main">{formatCurrency(totalReceived)}</span>
              </div>

              <div className="flex justify-between items-center py-2.5 border-b border-border-subtle">
                <span className="text-xs text-text-muted font-bold uppercase tracking-wider">{tf('pendingDues', 'Pending Dues')}</span>
                <span className="text-lg font-black text-color-accent-pink">{formatCurrency(totalOutstanding)}</span>
              </div>

              <div className="flex justify-between items-center py-2.5">
                <span className="text-xs text-text-muted font-bold uppercase tracking-wider">{tf('totalSalesBooked', 'Total Sales Booked')}</span>
                <span className="text-lg font-black text-color-accent-emerald">{formatCurrency(totalSales)}</span>
              </div>
            </div>

            {/* Monthly limit bar */}
            <div className="flex flex-col gap-2.5 mt-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-text-muted">{tf('monthlyExpenseLimit', 'Monthly Expense Limit')}</span>
                <span className="text-text-main">{formatCurrency(6000)} / {formatCurrency(25000)}</span>
              </div>
              <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-color-accent-blue rounded-full shadow-inner" style={{ width: '24%' }}></div>
              </div>
            </div>

            {/* Card active toggle */}
            <div className="flex items-center justify-between border-t border-border-subtle pt-4 mt-2">
              <span className="text-xs text-text-muted font-bold uppercase tracking-wider">{tf('cardPowerState', 'Card Active')}</span>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={activeCard}
                  onChange={(e) => setActiveCard(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-bg-secondary border border-border-medium rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-color-accent-blue"></div>
              </label>
            </div>

          </Card>
        </div>

      </div>

      {/* Sticky Bottom Ribbon Summary */}
      <div className="fixed bottom-0 left-0 lg:left-[260px] right-0 bg-bg-secondary/95 backdrop-blur-md border-t border-border-subtle py-4 px-6 flex items-center justify-between z-30 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">{tf('salesLedger', 'Sales Ledger')}</span>
            <span className="text-sm font-black text-text-main">{formatCurrency(totalSales)}</span>
          </div>
          <div className="h-6 w-px bg-border-strong"></div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">{tf('cashReceived', 'Cash Received')}</span>
            <span className="text-sm font-black text-color-accent-blue">{formatCurrency(totalReceived)}</span>
          </div>
          <div className="h-6 w-px bg-border-strong"></div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">{tf('outstandingDues', 'Outstanding Dues')}</span>
            <span className="text-sm font-black text-color-accent-pink">{formatCurrency(totalOutstanding)}</span>
          </div>
        </div>
        <div>
          <span className="text-[9px] font-black text-color-accent-purple uppercase tracking-widest bg-color-accent-purple/10 px-2.5 py-1 rounded-md border border-color-accent-purple/20">
            {tf('realtimeAudit', 'Real-time Audit')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Ledger;
