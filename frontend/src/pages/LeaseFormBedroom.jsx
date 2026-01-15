import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Button } from '../components/Button';
import { BedDouble, Calendar, DollarSign, Home, User, Shield, ChevronDown, CheckCircle } from 'lucide-react';

export const LeaseFormBedroom = () => {
    const navigate = useNavigate();
    const [buildings, setBuildings] = useState([]);
    const [units, setUnits] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState('');
    const [form, setForm] = useState({
        unitId: '',
        tenantId: '',
        tenantName: '',
        startDate: '',
        endDate: '',
        monthlyRent: '',
        securityDeposit: ''
    });
    const [isTenantReadOnly, setIsTenantReadOnly] = useState(true);

    useEffect(() => {
        fetchBuildings();
    }, []);

    const fetchBuildings = async () => {
        try {
            const res = await api.get('/admin/properties');
            setBuildings(res.data);
        } catch (error) {
            console.error('Failed to fetch buildings', error);
        }
    };

    const handleBuildingChange = async (e) => {
        const buildingId = e.target.value;
        setSelectedBuilding(buildingId);
        setUnits([]);
        setForm({
            ...form,
            unitId: '',
            tenantId: '',
            tenantName: '',
            monthlyRent: '',
            securityDeposit: '',
            startDate: '',
            endDate: ''
        });

        if (buildingId) {
            try {
                // Fetch units for this building with BEDROOM_WISE rental mode that have assigned tenants
                const res = await api.get(`/admin/leases/units-with-tenants?propertyId=${buildingId}&rentalMode=BEDROOM_WISE`);
                const allUnits = res.data.data || [];

                // Fetch all leases to find active ones
                const leasesRes = await api.get('/admin/leases');
                const activeUnits = leasesRes.data
                    .filter(l => l.status === 'active')
                    .map(l => l.unit);

                // Filter out units that already have an active lease
                const filteredUnits = allUnits.filter(u => !activeUnits.includes(u.unitNumber));

                setUnits(filteredUnits);
            } catch (error) {
                console.error('Failed to fetch units', error);
            }
        }
    };

    const handleUnitChange = async (e) => {
        const unitId = e.target.value;
        setForm({ ...form, unitId, tenantId: '', tenantName: '' });

        if (unitId) {
            try {
                const res = await api.get(`/admin/leases/active/${unitId}`);
                if (res.data) {
                    setForm(prev => ({
                        ...prev,
                        tenantId: res.data.tenantId,
                        tenantName: res.data.tenantName
                    }));
                } else {
                    setForm(prev => ({ ...prev, tenantId: '', tenantName: 'No Active Tenant' }));
                }
            } catch (error) {
                console.error('Failed to fetch active lease', error);
                setForm(prev => ({ ...prev, tenantName: 'Error fetching tenant' }));
            }
        }
    };

    const handleSave = async () => {
        if (!form.unitId || !form.tenantName || !form.startDate || !form.endDate || form.tenantName === 'No Active Tenant' || form.tenantName === 'Error fetching tenant') {
            alert('Please select a unit with an assigned tenant and fill all required fields');
            return;
        }

        try {
            await api.post('/admin/leases', form);
            alert('Bedroom Lease created successfully');
            navigate('/leases');
        } catch (error) {
            console.error('Failed to create lease', error);
            alert(error.response?.data?.message || 'Error creating lease');
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    return (
        <MainLayout title="Bedroom Lease">
            <div className="max-w-3xl mx-auto py-6">
                <div className="bg-white p-8 rounded-2xl shadow-xl animate-in slide-in-from-bottom-4 duration-500 fade-in border border-slate-100">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <BedDouble size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 m-0">New Bedroom Lease</h2>
                            <p className="text-slate-500 text-sm mt-1">Create a lease for a unit managed bedroom-wise</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Building Selection */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Select Building</label>
                            <div className="relative">
                                <Home size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select
                                    value={selectedBuilding}
                                    onChange={handleBuildingChange}
                                    className="w-full pl-12 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 appearance-none"
                                >
                                    <option value="">Choose a Building</option>
                                    {buildings.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Unit Selection */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Unit</label>
                            <div className="relative">
                                <Home size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select
                                    name="unitId"
                                    value={form.unitId}
                                    onChange={handleUnitChange}
                                    disabled={!selectedBuilding}
                                    className="w-full pl-12 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 appearance-none disabled:opacity-50"
                                >
                                    <option value="">Select Unit</option>
                                    {units.map(u => (
                                        <option key={u.id} value={u.id}>{u.unitNumber}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Tenant Name */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Tenant Name</label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    name="tenantName"
                                    placeholder="Auto-filled from unit"
                                    value={form.tenantName}
                                    readOnly={true}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-100 outline-none font-medium text-slate-800 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Financials */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Monthly Rent ($)</label>
                            <div className="relative">
                                <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    name="monthlyRent"
                                    placeholder="0.00"
                                    value={form.monthlyRent}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Security Deposit ($)</label>
                            <div className="relative">
                                <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    name="securityDeposit"
                                    placeholder="0.00"
                                    value={form.securityDeposit}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800"
                                />
                            </div>
                        </div>

                        {/* Dates */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Start Date</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    name="startDate"
                                    value={form.startDate}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 placeholder-slate-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">End Date</label>
                            <div className="relative">
                                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="date"
                                    name="endDate"
                                    value={form.endDate}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 placeholder-slate-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                        <Button variant="secondary" onClick={() => navigate('/leases')}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSave} className="min-w-[140px] shadow-lg shadow-indigo-200">
                            <CheckCircle size={18} />
                            Save Lease
                        </Button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};
