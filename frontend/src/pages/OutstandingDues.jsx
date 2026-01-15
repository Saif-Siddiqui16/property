import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Eye, CreditCard, X } from 'lucide-react';
import { Button } from '../components/Button';
import api from '../api/client';

const OutstandingDues = () => {
  const [dues, setDues] = useState([]);

  useEffect(() => {
    fetchDues();
  }, []);

  const fetchDues = async () => {
    try {
      const response = await api.get('/admin/outstanding-dues');
      setDues(response.data);
    } catch (error) {
      console.error('Error fetching outstanding dues:', error);
    }
  };

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  return (
    <MainLayout title="Outstanding Dues">
      <div className="p-0">

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] overflow-hidden border border-gray-100">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100">Invoice</th>
                <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100">Tenant</th>
                <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100">Unit</th>
                <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100">Lease Type</th>
                <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100">Amount</th>
                <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100">Due Date</th>
                <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100">Status</th>
                <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100">Action</th>
              </tr>
            </thead>

            <tbody>
              {dues.map((d) => (
                <tr key={d.invoice} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 border-b border-gray-100 text-sm text-slate-700 font-mono">{d.invoice}</td>
                  <td className="p-4 border-b border-gray-100 text-sm text-slate-700">{d.tenant}</td>
                  <td className="p-4 border-b border-gray-100 text-sm text-slate-700">{d.unit}</td>
                  <td className="p-4 border-b border-gray-100 text-sm text-slate-700">{d.leaseType}</td>
                  <td className="p-4 border-b border-gray-100 text-sm font-medium font-mono text-slate-700">${d.amount.toLocaleString('en-CA')}</td>
                  <td className="p-4 border-b border-gray-100 text-sm text-slate-700">{d.dueDate}</td>
                  <td className="p-4 border-b border-gray-100 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${d.status === 'Overdue'
                      ? 'bg-red-50 text-red-700 border-red-100'
                      : 'bg-orange-50 text-orange-700 border-orange-100'
                      }`}>
                      {d.status}
                      {d.daysOverdue > 0 && ` (${d.daysOverdue} days)`}
                    </span>
                  </td>
                  <td className="p-4 border-b border-gray-100 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedInvoice(d)} className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-slate-100 rounded-md transition-colors">
                        <Eye size={16} />
                      </button>
                      <button title="Record Payment" className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors">
                        <CreditCard size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* VIEW INVOICE MODAL */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white p-6 rounded-xl w-[520px] shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">Outstanding Invoice</h3>
                <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex flex-col"><label className="text-xs text-slate-500 mb-1">Invoice</label><span className="text-sm font-medium text-slate-900">{selectedInvoice.invoice}</span></div>
                <div className="flex flex-col"><label className="text-xs text-slate-500 mb-1">Tenant</label><span className="text-sm font-medium text-slate-900">{selectedInvoice.tenant}</span></div>
                <div className="flex flex-col"><label className="text-xs text-slate-500 mb-1">Unit</label><span className="text-sm font-medium text-slate-900">{selectedInvoice.unit}</span></div>
                <div className="flex flex-col"><label className="text-xs text-slate-500 mb-1">Lease Type</label><span className="text-sm font-medium text-slate-900">{selectedInvoice.leaseType}</span></div>
                <div className="flex flex-col"><label className="text-xs text-slate-500 mb-1">Due Date</label><span className="text-sm font-medium text-slate-900">{selectedInvoice.dueDate}</span></div>
                <div className="flex flex-col"><label className="text-xs text-slate-500 mb-1">Status</label><span className="text-sm font-medium text-slate-900">{selectedInvoice.status}</span></div>

                <div className="col-span-2 mt-2 p-4 rounded-lg bg-red-50 text-center text-xl font-bold text-red-800 border border-red-100">
                  ${selectedInvoice.amount.toLocaleString('en-CA')} Due
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setSelectedInvoice(null)}>
                  Close
                </Button>
                <Button>
                  Record Payment
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default OutstandingDues;
