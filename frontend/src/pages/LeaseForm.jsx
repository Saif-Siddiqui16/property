import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Button } from '../components/Button';
import { Home, User, Calendar, DollarSign, Shield, ChevronDown, Bed } from 'lucide-react';

export const LeaseForm = () => {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState([]);
  const [units, setUnits] = useState([]);
  const [bedrooms, setBedrooms] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [form, setForm] = useState({
    unitId: '',
    bedroomId: '',
    tenantId: '',
    startDate: '',
    endDate: '',
    monthlyRent: '',
    securityDeposit: ''
  });

  useEffect(() => {
    fetchBuildings();
    fetchTenants();
  }, []);

  const fetchBuildings = async () => {
    try {
      const res = await api.get('/admin/properties');
      setBuildings(res.data);
    } catch (error) {
      console.error('Failed to fetch buildings', error);
    }
  };

  const fetchTenants = async () => {
    try {
      const res = await api.get('/admin/tenants');
      // Filter tenants that don't have active lease (only DRAFT or no lease)
      const availableTenants = res.data.filter(t => t.leaseStatus !== 'Active');
      setTenants(availableTenants);
    } catch (error) {
      console.error('Failed to fetch tenants', error);
    }
  };

  const handleBuildingChange = async (e) => {
    const buildingId = e.target.value;
    setSelectedBuilding(buildingId);
    setUnits([]);
    setBedrooms([]);
    setSelectedUnit(null);
    setForm({ ...form, unitId: '', bedroomId: '', tenantId: '' });

    if (buildingId) {
      try {
        // Fetch all units for this building
        const unitsRes = await api.get(`/admin/units?propertyId=${buildingId}&limit=1000`);
        const allUnits = unitsRes.data.data || unitsRes.data;

        // Fetch all active leases to find which units are already leased
        const leasesRes = await api.get('/admin/leases');
        const activeUnitNames = leasesRes.data
          .filter(l => l.status === 'active')
          .map(l => l.unit);

        // Filter out units that already have an active lease
        const availableUnits = allUnits.filter(u => !activeUnitNames.includes(u.unitNumber));

        setUnits(availableUnits);
      } catch (error) {
        console.error('Failed to fetch units', error);
      }
    }
  };

  const handleUnitChange = async (e) => {
    const unitId = e.target.value;
    setForm({ ...form, unitId, bedroomId: '', tenantId: '' });
    setBedrooms([]);
    setSelectedUnit(null);

    if (unitId) {
      const unit = units.find(u => u.id === parseInt(unitId));
      setSelectedUnit(unit);

      try {
        // Fetch vacant bedrooms for this unit
        const bedroomsRes = await api.get('/admin/units/bedrooms/vacant');
        const unitBedrooms = bedroomsRes.data.filter(b => b.unitId === parseInt(unitId));
        setBedrooms(unitBedrooms);

        // Check if there's a DRAFT lease with tenant for this unit
        const leaseRes = await api.get(`/admin/leases/active/${unitId}`);
        if (leaseRes.data && leaseRes.data.tenantId) {
          setForm(prev => ({
            ...prev,
            tenantId: leaseRes.data.tenantId.toString()
          }));
        }
      } catch (error) {
        console.error('Failed to fetch bedrooms', error);
      }
    }
  };

  const handleSave = async () => {
    if (!form.unitId || !form.tenantId || !form.startDate || !form.endDate) {
      alert('Please fill all required fields (Unit, Tenant, Start Date, End Date)');
      return;
    }

    try {
      const payload = {
        unitId: parseInt(form.unitId),
        tenantId: parseInt(form.tenantId),
        bedroomId: form.bedroomId ? parseInt(form.bedroomId) : null,
        startDate: form.startDate,
        endDate: form.endDate,
        monthlyRent: parseFloat(form.monthlyRent) || 0,
        securityDeposit: parseFloat(form.securityDeposit) || 0
      };

      await api.post('/admin/leases', payload);
      alert('Lease created successfully');
      navigate('/leases');
    } catch (error) {
      console.error('Failed to create lease', error);
      alert(error.response?.data?.message || 'Error creating lease');
    }
  };

  return (
    <MainLayout title="Create New Lease">
      <div className="max-w-[760px] mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Home size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 m-0">New Lease</h2>
            <p className="text-slate-500 text-sm mt-1">Create a lease for an apartment unit or bedroom</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Building Selection */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Select Building (Civic Number)</label>
            <div className="relative">
              <Home size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedBuilding}
                onChange={handleBuildingChange}
                className="w-full pl-12 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 appearance-none"
              >
                <option value="">Choose a Building</option>
                {buildings.map(b => (
                  <option key={b.id} value={b.id}>{b.civicNumber || b.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* Unit Selection */}
          <div>
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
                  <option key={u.id} value={u.id}>{u.unitNumber} (Floor {u.floor})</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* Bedroom Selection (shows only if unit has bedrooms) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">
              Bedroom {bedrooms.length > 0 ? `(${bedrooms.length} available)` : ''}
            </label>
            <div className="relative">
              <Bed size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                name="bedroomId"
                value={form.bedroomId}
                onChange={(e) => setForm({ ...form, bedroomId: e.target.value })}
                disabled={!form.unitId || bedrooms.length === 0}
                className="w-full pl-12 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 appearance-none disabled:opacity-50"
              >
                <option value="">{bedrooms.length === 0 ? 'No bedrooms available' : 'Select Bedroom (Optional)'}</option>
                {bedrooms.map(b => (
                  <option key={b.id} value={b.id}>{b.displayName} - Room {b.roomNumber}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* Tenant Selection */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Select Tenant</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                name="tenantId"
                value={form.tenantId}
                onChange={(e) => setForm({ ...form, tenantId: e.target.value })}
                disabled={!form.unitId}
                className="w-full pl-12 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800 appearance-none disabled:opacity-50"
              >
                <option value="">Select Tenant</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Start Date</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">End Date</label>
            <div className="relative">
              <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Financials */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Monthly Rent ($)</label>
            <div className="relative">
              <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="0.00"
                type="number"
                value={form.monthlyRent}
                onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Security Deposit ($)</label>
            <div className="relative">
              <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="0.00"
                type="number"
                value={form.securityDeposit}
                onChange={(e) => setForm({ ...form, securityDeposit: e.target.value })}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-800"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-slate-100">
          <Button variant="secondary" onClick={() => navigate('/leases')}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} className="min-w-[140px] shadow-lg shadow-indigo-200">
            Save Lease
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};
