import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Plus, Search, Filter, Eye, Pencil, Trash2, Building2, Home, X } from 'lucide-react';
import api from '../api/client';

export const Buildings = () => {
  const [buildings, setBuildings] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentBuilding, setCurrentBuilding] = useState(null);
  const [owners, setOwners] = useState([]);

  // Fetch buildings and owners from API
  useEffect(() => {
    fetchBuildings();
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const response = await api.get('/api/admin/owners');
      setOwners(response.data);
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  };

  const fetchBuildings = async () => {
    try {
      const response = await api.get('/api/admin/properties');
      setBuildings(response.data);
    } catch (error) {
      console.error('Error fetching buildings:', error);
    }
  };

  // Filter buildings based on search
  const filteredBuildings = buildings.filter(building =>
    building.name.toLowerCase().includes(search.toLowerCase())
  );

  // Add new building
  const addBuilding = async (e) => {
    e.preventDefault();
    const form = e.target;
    // Note: Backend handles unit generation based on 'units' count
    const newBuilding = {
      name: form.name.value,
      units: parseInt(form.units.value),
      status: form.status.value,
      civicNumber: form.civicNumber.value,
      street: form.street.value,
      city: form.city.value,
      province: form.province.value,
      postalCode: form.postalCode.value
    };

    try {
      const response = await api.post('/api/admin/properties', newBuilding);
      setBuildings([...buildings, response.data]);
      setShowModal(false);
      form.reset();
    } catch (error) {
      console.error('Error adding building:', error);
      alert('Error adding building');
    }
  };

  // Delete building
  const deleteBuilding = async (id) => {
    if (window.confirm('Are you sure you want to delete this building?')) {
      try {
        await api.delete(`/api/admin/properties/${id}`);
        setBuildings(buildings.filter(b => b.id !== id));
      } catch (error) {
        console.error('Error deleting building:', error);
        alert('Error deleting building');
      }
    }
  };

  // View building details
  const viewBuilding = (building) => {
    setCurrentBuilding(building);
    setShowViewModal(true);
  };

  // Edit building
  const editBuilding = (building) => {
    setCurrentBuilding(building);
    setShowEditModal(true);
  };

  // Update building
  const updateBuilding = async (e) => {
    e.preventDefault();
    const form = e.target;
    const updatedData = {
      name: form.name.value,
      units: parseInt(form.units.value),
      status: form.status.value,
      civicNumber: form.civicNumber.value,
      street: form.street.value,
      city: form.city.value,
      province: form.province.value,
      postalCode: form.postalCode.value
    };

    try {
      const response = await api.put(`/api/admin/properties/${currentBuilding.id}`, updatedData);
      setBuildings(buildings.map(b => b.id === currentBuilding.id ? response.data : b));
      setShowEditModal(false);
      form.reset();
    } catch (error) {
      console.error('Error updating building:', error);
      alert('Error updating building');
    }
  };

  return (
    <MainLayout title="Buildings">
      <div className="flex flex-col gap-6">
        {/* Header with stats cards */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 mb-4">
          <div className="relative overflow-hidden rounded-2xl p-6 flex items-center gap-4 shadow-[0_10px_30px_rgba(102,126,234,0.2)] bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white transition-all duration-300 hover:-translate-y-1 hover:rotate-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="w-[60px] h-[60px] bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-sm">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="text-[2rem] font-bold leading-none">{buildings.length}</h3>
              <p className="text-white/90 text-sm mt-1">Total Buildings</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl p-6 flex items-center gap-4 shadow-[0_10px_30px_rgba(240,147,251,0.2)] bg-gradient-to-br from-[#f093fb] to-[#f5576c] text-white transition-all duration-300 hover:-translate-y-1 hover:rotate-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom-5 fade-in duration-500 delay-100 fill-mode-forwards">
            <div className="w-[60px] h-[60px] bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-sm">
              <Home size={24} />
            </div>
            <div>
              <h3 className="text-[2rem] font-bold leading-none">{buildings.reduce((sum, b) => sum + b.units, 0)}</h3>
              <p className="text-white/90 text-sm mt-1">Total Units</p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl p-6 flex items-center gap-4 shadow-[0_10px_30px_rgba(79,172,254,0.2)] bg-gradient-to-br from-[#4facfe] to-[#00f2fe] text-white transition-all duration-300 hover:-translate-y-1 hover:rotate-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom-5 fade-in duration-500 delay-200 fill-mode-forwards">
            <div className="w-[60px] h-[60px] bg-white/20 rounded-xl flex items-center justify-center text-white backdrop-blur-sm">
              <div className="w-5 h-5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.6)]"></div>
            </div>
            <div>
              <h3 className="text-[2rem] font-bold leading-none">{buildings.filter(b => b.status === 'Active').length}</h3>
              <p className="text-white/90 text-sm mt-1">Active Buildings</p>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center bg-white p-4 md:px-6 rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.08)] gap-4">
          <div className="flex gap-4 items-center flex-1">
            <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200 focus-within:border-[#667eea] focus-within:ring-4 focus-within:ring-[#667eea]/10 transition-all w-full md:w-auto md:min-w-[280px]">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search buildings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 w-full text-sm"
              />
            </div>
            <Button variant="secondary" className="hidden md:flex">
              <Filter size={16} />
              Filter
            </Button>
          </div>
          <Button variant="primary" onClick={() => setShowModal(true)} className="whitespace-nowrap">
            <Plus size={18} />
            Add Building
          </Button>
        </div>

        {/* Table Card */}
        <Card className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="w-full overflow-x-auto">
            <div className="hidden md:grid grid-cols-8 min-w-[1100px] bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b-2 border-slate-200">
              <div className="font-semibold text-slate-600 text-sm uppercase tracking-wide">Civic #</div>
              <div className="font-semibold text-slate-600 text-sm uppercase tracking-wide">Building Name</div>
              <div className="font-semibold text-slate-600 text-sm uppercase tracking-wide">Street</div>
              <div className="font-semibold text-slate-600 text-sm uppercase tracking-wide">City</div>
              <div className="font-semibold text-slate-600 text-sm uppercase tracking-wide">Province</div>
              <div className="font-semibold text-slate-600 text-sm uppercase tracking-wide">Units</div>
              <div className="font-semibold text-slate-600 text-sm uppercase tracking-wide">Status</div>
              <div className="font-semibold text-slate-600 text-sm uppercase tracking-wide">Actions</div>
            </div>

            <div className="bg-white">
              {filteredBuildings.map((building, index) => (
                <div
                  key={building.id}
                  className="grid grid-cols-1 md:grid-cols-8 min-w-[1100px] px-6 py-4 border-b border-slate-100 transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-50 hover:to-white hover:scale-[1.002] hover:shadow-md items-center gap-4 md:gap-0"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center">
                    <span className="font-bold text-[#667eea] text-lg">{building.civicNumber || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm">
                      <Building2 size={16} />
                    </div>
                    <span className="font-medium text-slate-700 text-sm">{building.name}</span>
                  </div>
                  <div className="text-slate-600 text-sm truncate" title={building.street}>
                    {building.street || '-'}
                  </div>
                  <div className="text-slate-600 text-sm">
                    {building.city || '-'}
                  </div>
                  <div className="text-slate-600 text-sm">
                    {building.province || '-'}
                  </div>
                  <div className="flex justify-between md:block md:w-auto w-full">
                    <span className="text-[1rem] font-semibold text-[#667eea]">{building.units}</span>
                  </div>
                  <div className="flex justify-between md:block md:w-auto w-full">
                    <span
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit ${building.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                        }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${building.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      {building.status}
                    </span>
                  </div>
                  <div className="flex gap-2 justify-end md:justify-start">
                    <button
                      className="w-8 h-8 border-none rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 bg-sky-50 text-sky-600 hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(2,132,199,0.2)] hover:scale-110 group relative"
                      title="View Details"
                      onClick={() => viewBuilding(building)}
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      className="w-8 h-8 border-none rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 bg-emerald-50 text-emerald-600 hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(22,163,74,0.2)] hover:scale-110 group relative"
                      title="Edit Building"
                      onClick={() => editBuilding(building)}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="w-8 h-8 border-none rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 bg-red-50 text-red-600 hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(220,38,38,0.2)] hover:scale-110 group relative"
                      title="Delete Building"
                      onClick={() => deleteBuilding(building.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Add Building Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 overflow-y-auto py-8">
            <form className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 my-auto" onSubmit={addBuilding}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="m-0 text-slate-800 text-2xl font-bold">Add New Building</h3>
                <button
                  type="button"
                  className="bg-transparent border-none cursor-pointer text-slate-400 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => setShowModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <label htmlFor="name" className="block mb-2 font-medium text-slate-600">Building Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter building name"
                  required
                  className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10"
                />
              </div>

              {/* Address Fields */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="civicNumber" className="block mb-2 font-medium text-slate-600">Civic Number</label>
                  <input
                    type="text"
                    id="civicNumber"
                    name="civicNumber"
                    placeholder="e.g., 82"
                    className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10"
                  />
                </div>
                <div>
                  <label htmlFor="street" className="block mb-2 font-medium text-slate-600">Street</label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    placeholder="e.g., Allée Marthe-Rivard"
                    className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="city" className="block mb-2 font-medium text-slate-600">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    placeholder="e.g., Mont-Tremblant"
                    className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10"
                  />
                </div>
                <div>
                  <label htmlFor="province" className="block mb-2 font-medium text-slate-600">Province</label>
                  <select
                    id="province"
                    name="province"
                    className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 appearance-none bg-white"
                  >
                    <option value="">Select Province</option>
                    <option value="Alberta">Alberta</option>
                    <option value="British Columbia">British Columbia</option>
                    <option value="Manitoba">Manitoba</option>
                    <option value="New Brunswick">New Brunswick</option>
                    <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
                    <option value="Nova Scotia">Nova Scotia</option>
                    <option value="Ontario">Ontario</option>
                    <option value="Prince Edward Island">Prince Edward Island</option>
                    <option value="Quebec">Quebec</option>
                    <option value="Saskatchewan">Saskatchewan</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="postalCode" className="block mb-2 font-medium text-slate-600">Postal Code</label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  placeholder="e.g., J8E 2G5"
                  className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="units" className="block mb-2 font-medium text-slate-600">Total Units</label>
                  <input
                    type="number"
                    id="units"
                    name="units"
                    placeholder="Enter total units"
                    min="0"
                    defaultValue="0"
                    className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10"
                  />
                </div>
                <div>
                  <label htmlFor="status" className="block mb-2 font-medium text-slate-600">Status</label>
                  <select
                    id="status"
                    name="status"
                    required
                    className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 appearance-none bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Add Building
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* View Building Modal */}
        {showViewModal && currentBuilding && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 overflow-y-auto py-8">
            <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 my-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="m-0 text-slate-800 text-2xl font-bold">Building Details</h3>
                <button
                  className="bg-transparent border-none cursor-pointer text-slate-400 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => setShowViewModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-8 space-y-4">
                <div className="flex items-center pb-3 border-b border-slate-100">
                  <span className="font-medium w-[140px] text-slate-500">Building Name:</span>
                  <span className="flex-1 font-semibold text-slate-800">{currentBuilding.name}</span>
                </div>
                <div className="flex items-center pb-3 border-b border-slate-100">
                  <span className="font-medium w-[140px] text-slate-500">Address:</span>
                  <span className="flex-1 font-semibold text-slate-800">{currentBuilding.address || 'Not Provided'}</span>
                </div>
                {currentBuilding.civicNumber && (
                  <div className="flex items-center pb-3 border-b border-slate-100">
                    <span className="font-medium w-[140px] text-slate-500">Civic Number:</span>
                    <span className="flex-1 font-semibold text-slate-800">{currentBuilding.civicNumber}</span>
                  </div>
                )}
                {currentBuilding.city && (
                  <div className="flex items-center pb-3 border-b border-slate-100">
                    <span className="font-medium w-[140px] text-slate-500">City:</span>
                    <span className="flex-1 font-semibold text-slate-800">{currentBuilding.city}</span>
                  </div>
                )}
                {currentBuilding.province && (
                  <div className="flex items-center pb-3 border-b border-slate-100">
                    <span className="font-medium w-[140px] text-slate-500">Province:</span>
                    <span className="flex-1 font-semibold text-slate-800">{currentBuilding.province}</span>
                  </div>
                )}
                {currentBuilding.postalCode && (
                  <div className="flex items-center pb-3 border-b border-slate-100">
                    <span className="font-medium w-[140px] text-slate-500">Postal Code:</span>
                    <span className="flex-1 font-semibold text-slate-800">{currentBuilding.postalCode}</span>
                  </div>
                )}
                <div className="flex items-center pb-3 border-b border-slate-100">
                  <span className="font-medium w-[140px] text-slate-500">Total Units:</span>
                  <span className="flex-1 font-semibold text-slate-800">{currentBuilding.units}</span>
                </div>
                <div className="flex items-center pb-3 border-b border-slate-100">
                  <span className="font-medium w-[140px] text-slate-500">Status:</span>
                  <span className="flex-1">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${currentBuilding.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                        }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${currentBuilding.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      {currentBuilding.status}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowViewModal(false);
                    editBuilding(currentBuilding);
                  }}
                >
                  Edit Building
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Building Modal */}
        {showEditModal && currentBuilding && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 overflow-y-auto py-8">
            <form className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 my-auto" onSubmit={updateBuilding}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="m-0 text-slate-800 text-2xl font-bold">Edit Building</h3>
                <button
                  type="button"
                  className="bg-transparent border-none cursor-pointer text-slate-400 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-slate-100 hover:text-slate-700"
                  onClick={() => setShowEditModal(false)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <label htmlFor="edit-name" className="block mb-2 font-medium text-slate-600">Building Name</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  defaultValue={currentBuilding.name}
                  required
                  className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10"
                />
              </div>

              {/* Address Fields */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="edit-civicNumber" className="block mb-2 font-medium text-slate-600">Civic Number</label>
                  <input
                    type="text"
                    id="edit-civicNumber"
                    name="civicNumber"
                    defaultValue={currentBuilding.civicNumber || ''}
                    placeholder="e.g., 82"
                    className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10"
                  />
                </div>
                <div>
                  <label htmlFor="edit-street" className="block mb-2 font-medium text-slate-600">Street</label>
                  <input
                    type="text"
                    id="edit-street"
                    name="street"
                    defaultValue={currentBuilding.street || ''}
                    placeholder="e.g., Allée Marthe-Rivard"
                    className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="edit-city" className="block mb-2 font-medium text-slate-600">City</label>
                  <input
                    type="text"
                    id="edit-city"
                    name="city"
                    defaultValue={currentBuilding.city || ''}
                    placeholder="e.g., Mont-Tremblant"
                    className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10"
                  />
                </div>
                <div>
                  <label htmlFor="edit-province" className="block mb-2 font-medium text-slate-600">Province</label>
                  <select
                    id="edit-province"
                    name="province"
                    defaultValue={currentBuilding.province || ''}
                    className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 appearance-none bg-white"
                  >
                    <option value="">Select Province</option>
                    <option value="Alberta">Alberta</option>
                    <option value="British Columbia">British Columbia</option>
                    <option value="Manitoba">Manitoba</option>
                    <option value="New Brunswick">New Brunswick</option>
                    <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
                    <option value="Nova Scotia">Nova Scotia</option>
                    <option value="Ontario">Ontario</option>
                    <option value="Prince Edward Island">Prince Edward Island</option>
                    <option value="Quebec">Quebec</option>
                    <option value="Saskatchewan">Saskatchewan</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="edit-postalCode" className="block mb-2 font-medium text-slate-600">Postal Code</label>
                <input
                  type="text"
                  id="edit-postalCode"
                  name="postalCode"
                  defaultValue={currentBuilding.postalCode || ''}
                  placeholder="e.g., J8E 2G5"
                  className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="edit-units" className="block mb-2 font-medium text-slate-600">Total Units</label>
                  <input
                    type="number"
                    id="edit-units"
                    name="units"
                    defaultValue={currentBuilding.units}
                    min="0"
                    className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10"
                  />
                </div>
                <div>
                  <label htmlFor="edit-status" className="block mb-2 font-medium text-slate-600">Status</label>
                  <select
                    id="edit-status"
                    name="status"
                    defaultValue={currentBuilding.status}
                    required
                    className="w-full p-3 border-2 border-slate-200 rounded-xl text-base transition-all outline-none focus:border-[#667eea] focus:ring-4 focus:ring-[#667eea]/10 appearance-none bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Update Building
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Buildings;