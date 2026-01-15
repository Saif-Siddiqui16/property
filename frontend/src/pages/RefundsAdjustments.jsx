import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Eye, X, FileCheck, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../components/Button';
import api from '../api/client';

const RefundsAdjustments = () => {
  const [records, setRecords] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selected, setSelected] = useState(null);

  // Auto-selection state
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchRecords(), fetchTenants(), fetchUnits()]);
    setLoading(false);
  };

  const fetchRecords = async () => {
    try {
      const response = await api.get('/admin/refunds');
      setRecords(response.data);
    } catch (error) { console.error('Error fetching refunds:', error); }
  };

  const fetchTenants = async () => {
    try {
      const res = await api.get('/admin/tenants');
      setTenants(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchUnits = async () => {
    try {
      const res = await api.get('/admin/units?limit=1000');
      setUnits(res.data.data || res.data);
    } catch (e) { console.error(e); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      if (editingRecord) {
        await api.put(`/admin/refunds/${editingRecord.id}`, data);
      } else {
        await api.post('/admin/refunds', data);
      }
      setShowModal(false);
      setEditingRecord(null);
      await fetchRecords();
    } catch (e) {
      alert('Error saving refund');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`/admin/refunds/${id}`);
      fetchRecords();
    } catch (e) { console.error(e); }
  };

  return (
    <MainLayout title="Refunds & Adjustments">
      <div className="flex flex-col gap-6">

        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={() => {
            setEditingRecord(null);
            setSelectedTenantId('');
            setSelectedUnitId('');
            setShowModal(true);
          }}>
            + Create Refund
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] overflow-hidden border border-gray-100">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100">ID</th>
                <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100">Type</th>
                <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100">Reason</th>
                <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100">Tenant</th>
                <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100">Unit</th>
                <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100">Amount</th>
                <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100">Date</th>
                <th className="p-4 bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100">Status</th>
                <th className="p-4 bg-slate-50 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-gray-100">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="p-12 text-center text-slate-400">
                    <Loader2 className="animate-spin mx-auto mb-2" />
                    Loading records...
                  </td>
                </tr>
              ) : records.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 border-b border-gray-100 text-sm text-slate-700 font-mono">{r.id}</td>
                  <td className="p-4 border-b border-gray-100 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${r.type.toLowerCase().includes('refund')
                      ? 'bg-cyan-50 text-cyan-700 border-cyan-100'
                      : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                      }`}>
                      {r.type}
                    </span>
                  </td>
                  <td className="p-4 border-b border-gray-100 text-sm text-slate-700">{r.reason}</td>
                  <td className="p-4 border-b border-gray-100 text-sm text-slate-700">{r.tenant}</td>
                  <td className="p-4 border-b border-gray-100 text-sm text-slate-700">{r.unit}</td>
                  <td className={`p-4 border-b border-gray-100 text-sm font-medium font-mono ${r.amount < 0 ? 'text-amber-700' : 'text-slate-700'}`}>
                    ${Math.abs(r.amount).toLocaleString('en-CA')}
                  </td>
                  <td className="p-4 border-b border-gray-100 text-sm text-slate-700">{r.date}</td>
                  <td className="p-4 border-b border-gray-100 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${r.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      r.status === 'Applied' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                        'bg-orange-50 text-orange-700 border-orange-100' // Pending
                      }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 border-b border-gray-100 text-sm text-right flex justify-end gap-2 text-nowrap">
                    <button onClick={() => setSelected(r)} className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-slate-100 rounded-md transition-colors">
                      <Eye size={16} />
                    </button>
                    <button onClick={() => { setEditingRecord(r); setShowModal(true); }} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors">
                      <FileCheck size={16} />
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-md transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && records.length === 0 && (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-400 italic">No refund records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* CREATE/EDIT MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
              <form onSubmit={handleSave}>
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-800">{editingRecord ? 'Edit Refund' : 'Create Refund/Adjustment'}</h3>
                  <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                      <select name="type" defaultValue={editingRecord?.type || 'Security Deposit'} className="px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 font-medium bg-white">
                        <option value="Security Deposit">Security Deposit</option>
                        <option value="Rent Refund">Rent Refund</option>
                        <option value="Adjustment">Adjustment</option>
                        <option value="Overcharge">Overcharge</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                      <select name="status" defaultValue={editingRecord?.status || 'Completed'} className="px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 font-medium bg-white">
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                        <option value="Applied">Applied</option>
                      </select>
                    </div>
                  </div>

                  {!editingRecord && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Tenant</label>
                        <select
                          name="tenantId"
                          required
                          value={selectedTenantId}
                          onChange={(e) => {
                            const tid = e.target.value;
                            setSelectedTenantId(tid);
                            const tenant = tenants.find(t => t.id === parseInt(tid));
                            if (tenant && tenant.unitId) {
                              setSelectedUnitId(tenant.unitId);
                            } else {
                              setSelectedUnitId('');
                            }
                          }}
                          className="px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 font-medium bg-white"
                        >
                          <option value="">Select Tenant</option>
                          {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Unit</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Unit will auto-fill"
                            value={units.find(u => u.id === parseInt(selectedUnitId))?.unitNumber || units.find(u => u.id === parseInt(selectedUnitId))?.name || ''}
                            readOnly
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-semibold cursor-not-allowed"
                          />
                          <input type="hidden" name="unitId" value={selectedUnitId} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input name="amount" type="number" step="0.01" defaultValue={editingRecord?.amount || ''} required className="w-full pl-8 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 font-medium" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Reason</label>
                    <textarea name="reason" rows="3" defaultValue={editingRecord?.reason || ''} required className="px-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 font-medium resize-none"></textarea>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 flex justify-end gap-3">
                  <button className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold transition-all disabled:opacity-50" type="button" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
                  <Button variant="primary" type="submit" disabled={saving}>
                    {saving ? 'Processing...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW MODAL (Enhanced) */}
        {selected && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white p-6 rounded-xl w-[520px] shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">{selected.type} Details</h3>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-6">
                <div className="flex flex-col"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Request ID</label><span className="text-md font-mono font-medium text-slate-900">{selected.id}</span></div>
                <div className="flex flex-col"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</label><span className="w-fit mt-1"><span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${selected.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>{selected.status}</span></span></div>
                <div className="flex flex-col"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tenant</label><span className="text-sm font-medium text-slate-900">{selected.tenant}</span></div>
                <div className="flex flex-col"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unit</label><span className="text-sm font-medium text-slate-900">{selected.unit}</span></div>
                <div className="flex flex-col col-span-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reason</label><span className="text-sm text-slate-700 mt-1">{selected.reason}</span></div>
                <div className="flex flex-col"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</label><span className="text-sm font-medium text-slate-900">{selected.date}</span></div>

                <div className={`col-span-2 mt-2 p-4 rounded-xl text-center text-2xl font-black border ${selected.amount < 0 ? 'bg-amber-50 text-amber-800 border-amber-100' : 'bg-cyan-50 text-cyan-800 border-cyan-100'}`}>
                  ${Math.abs(selected.amount).toLocaleString('en-CA')}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="secondary" onClick={() => setSelected(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default RefundsAdjustments;
