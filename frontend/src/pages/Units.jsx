import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/Button';
import { Plus, Search, Filter, Eye, X, ChevronDown } from 'lucide-react';

export const Units = () => {
  const [units, setUnits] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewUnit, setViewUnit] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const UNITS_API = 'http://localhost:5000/api/admin/units';
  const PROPERTIES_API = 'http://localhost:5000/api/admin/properties';

  useEffect(() => {
    fetchData(pagination.page);
  }, [pagination.page]);

  const fetchData = async (page = 1) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [unitsRes, buildingsRes] = await Promise.all([
        fetch(`${UNITS_API}?page=${page}&limit=${pagination.limit}`, { headers }),
        fetch(PROPERTIES_API, { headers })
      ]);

      if (unitsRes.ok) {
        const unitsData = await unitsRes.json();
        setUnits(unitsData.data);
        setPagination(prev => ({
          ...prev,
          total: unitsData.pagination.total,
          totalPages: unitsData.pagination.totalPages,
          page: unitsData.pagination.page
        }));
      }
      if (buildingsRes.ok) {
        const buildingsData = await buildingsRes.json();
        setBuildings(buildingsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    if (showModal || viewUnit) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showModal, viewUnit]);

  const filteredUnits = units.filter(
    (u) =>
      u.unitNumber.toLowerCase().includes(search.toLowerCase()) ||
      u.building.toLowerCase().includes(search.toLowerCase())
  );

  const addUnit = async (e) => {
    e.preventDefault();
    const form = e.target;

    // Get the selected building object to send name if needed, but primarily ID
    const selectedPropertyId = form.propertyId.value;
    const selectedProperty = buildings.find(b => b.id === parseInt(selectedPropertyId));

    const newUnitPayload = {
      unit: form.unit.value,
      propertyId: selectedPropertyId,
      building: selectedProperty ? selectedProperty.name : 'Unknown', // Fallback
      rentalMode: form.rentalMode.value,
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(UNITS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUnitPayload)
      });

      if (response.ok) {
        const savedUnit = await response.json();
        setUnits([...units, savedUnit]);
        setShowModal(false);
        form.reset();
      } else {
        alert('Failed to add unit');
      }
    } catch (error) {
      console.error('Error adding unit:', error);
      alert('Error adding unit');
    }
  };

  return (
    <MainLayout title="Units">
      <div className="flex flex-col gap-6 perspective-[1200px]">

        {/* TOP CONTROLS */}
        <section className="flex justify-between items-center">
          <div className="flex gap-4">
            <div className="flex items-center gap-2 bg-white py-2.5 px-3.5 rounded-xl shadow-sm border border-slate-200">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search by unit or building"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-none outline-none text-sm w-48 text-slate-700 placeholder:text-slate-400"
              />
            </div>

            <Button variant="secondary">
              <Filter size={16} />
              Filter
            </Button>
          </div>

          <Button variant="primary" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Add Unit
          </Button>
        </section>

        {/* TABLE */}
        <section className="bg-white rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="grid grid-cols-5 p-3.5 px-5 font-semibold bg-slate-50 text-slate-500 text-sm border-b border-slate-100 uppercase tracking-wide">
            <span>Unit</span>
            <span>Building</span>
            <span>Rental Mode</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {[...units].filter(u =>
            u.unitNumber.toLowerCase().includes(search.toLowerCase()) ||
            u.building.toLowerCase().includes(search.toLowerCase())
          ).map((unit) => (
            <div key={unit.id} className="grid grid-cols-5 p-3.5 px-5 transition-all duration-300 hover:z-10 hover:shadow-[0_10px_20px_rgba(0,0,0,0.12)] hover:scale-[1.01] bg-white border-b border-slate-50 last:border-0 text-sm items-center">
              <span className="font-medium text-slate-900">{unit.unitNumber}</span>
              <span className="text-slate-600">{unit.building}</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${unit.rentalMode === 'Full Unit' || unit.rentalMode === 'FULL_UNIT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}>
                {unit.rentalMode === 'FULL_UNIT' ? 'Full Unit' : unit.rentalMode === 'BEDROOM_WISE' ? 'Bedroom-wise' : unit.rentalMode}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${unit.status === 'Occupied' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {unit.status}
              </span>
              <span>
                <Eye
                  size={16}
                  className="cursor-pointer text-slate-400 hover:text-indigo-600 transition-colors"
                  onClick={() => setViewUnit(unit)}
                />
              </span>
            </div>
          ))}

          {/* PAGINATION UI */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-100">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Showing Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        </section>

        {/* ADD UNIT MODAL - FIXED */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999] animate-[fadeIn_0.2s_ease] overflow-y-auto p-4">
            <form className="bg-white p-6 rounded-[18px] w-80 animate-[pop_0.4s_ease] shadow-2xl relative max-h-[90vh] overflow-y-auto" onSubmit={addUnit}>
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Add New Unit</h3>

              {/* Building Name Dropdown - FIRST */}
              <div className="relative">
                <select
                  name="propertyId"
                  required
                  className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white text-sm appearance-none pr-10"
                >
                  <option value="" disabled selected>Select Building</option>
                  {buildings.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown size={16} className="text-slate-400" />
                </div>
              </div>

              <input
                name="unit"
                placeholder="Unit Number"
                required
                className="w-full mt-3 p-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              />

              <div className="relative mt-3">
                <select
                  name="rentalMode"
                  required
                  className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white text-sm appearance-none pr-10"
                >
                  <option value="FULL_UNIT">Full Unit Rental</option>
                  <option value="BEDROOM_WISE">Bedroom - by - Bedroom</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown size={16} className="text-slate-400" />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 mt-5">
                <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Unit
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW UNIT MODAL - FIXED */}
        {viewUnit && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999] animate-[fadeIn_0.2s_ease] overflow-y-auto p-4">
            <div className="bg-white p-6 rounded-[18px] w-80 animate-[pop_0.4s_ease] shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Unit Details</h3>
                <button
                  onClick={() => setViewUnit(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Unit Number</p>
                  <p className="text-sm font-medium text-slate-900">{viewUnit.unitNumber}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Building</p>
                  <p className="text-sm font-medium text-slate-900">{viewUnit.building}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Rental Mode</p>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${viewUnit.rentalMode === 'Full Unit' || viewUnit.rentalMode === 'FULL_UNIT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                    {viewUnit.rentalMode === 'FULL_UNIT' ? 'Full Unit' : viewUnit.rentalMode === 'BEDROOM_WISE' ? 'Bedroom-wise' : viewUnit.rentalMode}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Status</p>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${viewUnit.status === 'Occupied' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {viewUnit.status}
                  </span>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button variant="secondary" onClick={() => setViewUnit(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};