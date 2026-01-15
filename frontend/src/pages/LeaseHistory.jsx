import React, { useEffect, useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';
import { Eye, Pencil, Trash2, X, FileText, Calendar, User, Home } from 'lucide-react';
import { Button } from '../components/Button';
import api from '../api/client';

// DUMMY_LEASES removed
export const LeaseHistory = () => {
    const navigate = useNavigate();

    const [leases, setLeases] = useState([]);
    const [selectedLease, setSelectedLease] = useState(null);
    const [editLease, setEditLease] = useState(null);

    /* LOAD DATA */
    useEffect(() => {
        const fetchLeases = async () => {
            // ... existing correct implementation ...
            try {
                const res = await api.get('/admin/leases');
                setLeases(res.data);
            } catch (error) {
                console.error('Failed to fetch leases', error);
            }
        };

        fetchLeases();
    }, []);

    /* DELETE */
    const handleDelete = async (id) => {
        if (!window.confirm('Delete this lease?')) return;
        try {
            await api.delete(`/admin/leases/${id}`);
            const updated = leases.filter((l) => l.id !== id);
            setLeases(updated);
        } catch (error) {
            alert('Failed to delete lease');
        }
    };

    /* SAVE EDIT */
    const handleEditSave = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/leases/${editLease.id}`, editLease);
            const updated = leases.map((l) =>
                l.id === editLease.id ? editLease : l
            );
            setLeases(updated);
            setEditLease(null);
        } catch (error) {
            alert('Failed to update lease');
        }
    };

    return (
        <MainLayout title="Lease History">
            <div className="flex flex-col gap-6">

                {/* ACTIONS */}
                <div className="flex justify-end gap-3 actions-bar">
                    <Button variant="primary" onClick={() => navigate('/leases/new')}>
                        <FileText size={18} />
                        New Lease
                    </Button>
                </div>

                {/* TABLE */}
                <div className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] overflow-hidden border border-slate-100">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tenant</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Term</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Rent</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {leases.map((lease, index) => (
                                    <tr
                                        key={lease.id}
                                        className="hover:bg-slate-50/80 transition-all duration-200 animate-in slide-in-from-left-2 fade-in fill-mode-forwards"
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-semibold text-slate-800">{lease.unit}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-700">{lease.tenant}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono text-[13px]">{lease.term}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">${(lease.monthlyRent || 0).toLocaleString('en-CA')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${lease.status === 'active'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : 'bg-slate-100 text-slate-600 border-slate-200'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${lease.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                                                {lease.status === 'active' ? 'Active' : 'Expired'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                                                    onClick={() => setSelectedLease(lease)}
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200"
                                                    onClick={() => setEditLease({ ...lease })}
                                                    title="Edit Lease"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                                                    onClick={() => handleDelete(lease.id)}
                                                    title="Delete Lease"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* VIEW MODAL */}
                {selectedLease && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Lease Details</h3>
                                <button
                                    onClick={() => setSelectedLease(null)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between py-3 border-b border-slate-100">
                                    <span className="text-sm font-medium text-slate-500">Unit</span>
                                    <span className="text-sm font-semibold text-slate-900">{selectedLease.unit}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-slate-100">
                                    <span className="text-sm font-medium text-slate-500">Tenant</span>
                                    <span className="text-sm font-medium text-slate-900">{selectedLease.tenant}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-slate-100">
                                    <span className="text-sm font-medium text-slate-500">Term</span>
                                    <span className="text-sm font-medium text-slate-900">{selectedLease.term}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-slate-100">
                                    <span className="text-sm font-medium text-slate-500">Monthly Rent</span>
                                    <span className="text-sm font-semibold text-slate-900">${(selectedLease.monthlyRent || 0).toLocaleString('en-CA')}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-slate-100">
                                    <span className="text-sm font-medium text-slate-500">Status</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${selectedLease.status === 'active'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {selectedLease.status === 'active' ? 'Active' : 'Expired'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button variant="secondary" onClick={() => setSelectedLease(null)}>Close</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* EDIT MODAL */}
                {editLease && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                        <form onSubmit={handleEditSave} className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900">Edit Lease</h3>
                                <button
                                    type="button"
                                    onClick={() => setEditLease(null)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Tenant Name</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                            value={editLease.tenant}
                                            onChange={(e) => setEditLease({ ...editLease, tenant: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Lease Term</label>
                                    <div className="relative">
                                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                            value={editLease.term}
                                            onChange={(e) => setEditLease({ ...editLease, term: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="secondary" onClick={() => setEditLease(null)}>Cancel</Button>
                                <Button type="submit" variant="primary">Save Changes</Button>
                            </div>
                        </form>
                    </div>
                )}

            </div>
        </MainLayout>
    );
};
