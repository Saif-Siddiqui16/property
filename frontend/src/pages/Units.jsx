import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/Button';
import { Plus, Search, Filter, Eye, Edit2, Trash2, X, ChevronDown, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api/client';

export const Units = () => {
  const [units, setUnits] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUnit, setEditUnit] = useState(null);
  const [viewUnit, setViewUnit] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  // Form state for controlled inputs
  const [formData, setFormData] = useState({
    propertyId: '',
    unit: '',
    unitNumber: '',
    unitType: '',
    floor: '',
    rentalMode: 'FULL_UNIT',
    bedrooms: '1',
    status: 'Vacant'
  });

  useEffect(() => {
    fetchData(pagination.page);
  }, [pagination.page]);

  useEffect(() => {
    if (showModal || viewUnit || editUnit || deleteConfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showModal, viewUnit, editUnit, deleteConfirm]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const [unitsRes, buildingsRes] = await Promise.all([
        api.get(`/api/admin/units?page=${page}&limit=${pagination.limit}`),
        api.get('/api/admin/properties')
      ]);

      if (unitsRes.data) {
        setUnits(unitsRes.data.data || []);
        setPagination(prev => ({
          ...prev,
          total: unitsRes.data.pagination?.total || 0,
          totalPages: unitsRes.data.pagination?.totalPages || 0,
          page: unitsRes.data.pagination?.page || 1
        }));
      }
      if (buildingsRes.data) {
        setBuildings(buildingsRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      propertyId: '',
      unit: '',
      unitNumber: '',
      unitType: '',
      floor: '',
      rentalMode: 'FULL_UNIT',
      bedrooms: '1',
      status: 'Vacant'
    });
  };

  const openAddModal = () => {
    resetForm();
    setEditUnit(null);
    setShowModal(true);
  };

  const openEditModal = (unit) => {
    setFormData({
      propertyId: unit.propertyId?.toString() || '',
      unit: unit.unitNumber || '',
      unitNumber: unit.unitNumber || '',
      unitType: unit.unitType || '',
      floor: unit.floor?.toString() || '',
      rentalMode: unit.rentalMode || 'FULL_UNIT',
      bedrooms: unit.bedrooms?.toString() || '1',
      status: unit.status || 'Vacant'
    });
    setEditUnit(unit);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditUnit(null);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const selectedProperty = buildings.find(b => b.id === parseInt(formData.propertyId));

      const payload = {
        unit: formData.unit,
        unitNumber: formData.unitNumber || formData.unit,
        unitType: formData.unitType || null,
        floor: formData.floor ? parseInt(formData.floor) : null,
        bedrooms: parseInt(formData.bedrooms) || 1,
        propertyId: formData.propertyId,
        building: selectedProperty ? selectedProperty.name : 'Unknown',
        rentalMode: formData.rentalMode,
        status: formData.status
      };

      if (editUnit) {
        // Update existing unit
        const response = await api.put(`/api/admin/units/${editUnit.id}`, payload);
        setUnits(prev => prev.map(u => u.id === editUnit.id ? response.data : u));
        showToast('Unit updated successfully');
      } else {
        // Create new unit
        const response = await api.post('/api/admin/units', payload);
        setUnits(prev => [response.data, ...prev]);
        showToast('Unit created successfully');
      }

      closeModal();
    } catch (error) {
      console.error('Error saving unit:', error);
      showToast(error.response?.data?.message || 'Error saving unit', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (unit) => {
    setSubmitting(true);
    try {
      await api.delete(`/api/admin/units/${unit.id}`);
      setUnits(prev => prev.filter(u => u.id !== unit.id));
      setDeleteConfirm(null);
      showToast('Unit deleted successfully');
    } catch (error) {
      console.error('Error deleting unit:', error);
      showToast(error.response?.data?.message || 'Error deleting unit', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUnits = units.filter(u =>
    u.unitNumber?.toLowerCase().includes(search.toLowerCase()) ||
    u.building?.toLowerCase().includes(search.toLowerCase()) ||
    u.unitType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout title="Units">
      <div className="flex flex-col gap-6">

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-4 z-[10000] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}

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

          <Button variant="primary" onClick={openAddModal}>
            <Plus size={18} />
            Add Unit
          </Button>
        </section>

        {/* TABLE */}
        <section className="bg-white rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.08)] overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin text-indigo-500" />
              <span className="ml-3 text-slate-500">Loading units...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 min-w-[800px] p-3.5 px-5 font-semibold bg-slate-50 text-slate-500 text-sm border-b border-slate-100 uppercase tracking-wide">
                  <span>Unit Number</span>
                  <span>Unit Type</span>
                  <span>Civic Number</span>
                  <span>Floor</span>
                  <span>Bedrooms</span>
                  <span>Status</span>
                  <span>Actions</span>
                </div>

                {filteredUnits.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    No units found. Click "Add Unit" to create one.
                  </div>
                ) : (
                  filteredUnits.map((unit) => (
                    <div key={unit.id} className="grid grid-cols-7 min-w-[800px] p-3.5 px-5 transition-all duration-300 hover:bg-slate-50 bg-white border-b border-slate-50 last:border-0 text-sm items-center">
                      <span className="font-medium text-slate-900">{unit.unitNumber}</span>
                      <span className="text-slate-600">{unit.unitType || '-'}</span>
                      <span className="font-bold text-indigo-600">{unit.civicNumber || unit.building}</span>
                      <span className="text-slate-600">{unit.floor || '-'}</span>
                      <span className="text-slate-600">{unit.bedrooms || '-'}</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${
                        unit.status === 'Occupied' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {unit.status}
                      </span>
                      <div className="flex items-center gap-2">
                        <Eye
                          size={16}
                          className="cursor-pointer text-slate-400 hover:text-indigo-600 transition-colors"
                          onClick={() => setViewUnit(unit)}
                        />
                        <Edit2
                          size={16}
                          className="cursor-pointer text-slate-400 hover:text-blue-600 transition-colors"
                          onClick={() => openEditModal(unit)}
                        />
                        <Trash2
                          size={16}
                          className="cursor-pointer text-slate-400 hover:text-red-600 transition-colors"
                          onClick={() => setDeleteConfirm(unit)}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* PAGINATION */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-100">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Showing {filteredUnits.length} of {pagination.total} units (Page {pagination.page} of {pagination.totalPages || 1})
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
            </>
          )}
        </section>

        {/* ADD/EDIT UNIT MODAL - FULL SCREEN */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[95vh] flex flex-col animate-in fade-in zoom-in duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-2xl">
                <h3 className="text-xl font-bold text-white">
                  {editUnit ? 'Edit Unit' : 'Add New Unit'}
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="overflow-y-auto flex-1 p-6">
                <form id="unitForm" onSubmit={handleSubmit} className="space-y-5">
                  {/* Civic Number Dropdown */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Civic Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="propertyId"
                        value={formData.propertyId}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3.5 rounded-xl border-2 border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-white text-sm appearance-none pr-10 transition-all"
                      >
                        <option value="" disabled>Select Civic Number</option>
                        {buildings.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.civicNumber || b.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronDown size={18} className="text-slate-400" />
                      </div>
                    </div>
                  </div>

                  {/* Unit Name & Number Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Unit Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                        placeholder="e.g., Unit 101"
                        required
                        className="w-full p-3.5 rounded-xl border-2 border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Unit Number
                      </label>
                      <input
                        name="unitNumber"
                        value={formData.unitNumber}
                        onChange={handleInputChange}
                        placeholder="e.g., 82-101"
                        className="w-full p-3.5 rounded-xl border-2 border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm transition-all"
                      />
                    </div>
                  </div>

                  {/* Unit Type & Floor Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Unit Type
                      </label>
                      <div className="relative">
                        <select
                          name="unitType"
                          value={formData.unitType}
                          onChange={handleInputChange}
                          className="w-full p-3.5 rounded-xl border-2 border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-white text-sm appearance-none pr-10 transition-all"
                        >
                          <option value="">Select Type</option>
                          <option value="Mackenzie">Mackenzie</option>
                          <option value="Nelson">Nelson</option>
                          <option value="Hudson">Hudson</option>
                          <option value="Richelieu">Richelieu</option>
                          <option value="Rupert">Rupert</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <ChevronDown size={18} className="text-slate-400" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Floor
                      </label>
                      <input
                        name="floor"
                        type="number"
                        value={formData.floor}
                        onChange={handleInputChange}
                        placeholder="e.g., 1"
                        min="1"
                        className="w-full p-3.5 rounded-xl border-2 border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm transition-all"
                      />
                    </div>
                  </div>

                  {/* Rental Mode & Bedrooms Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Rental Mode <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="rentalMode"
                          value={formData.rentalMode}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3.5 rounded-xl border-2 border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-white text-sm appearance-none pr-10 transition-all"
                        >
                          <option value="FULL_UNIT">Full Unit</option>
                          <option value="BEDROOM_WISE">Bedroom-wise</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <ChevronDown size={18} className="text-slate-400" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Number of Bedrooms
                      </label>
                      <input
                        name="bedrooms"
                        type="number"
                        value={formData.bedrooms}
                        onChange={handleInputChange}
                        placeholder="e.g., 2"
                        min="1"
                        className="w-full p-3.5 rounded-xl border-2 border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm transition-all"
                      />
                    </div>
                  </div>

                  {/* Status (only for edit) */}
                  {editUnit && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Status
                      </label>
                      <div className="relative">
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full p-3.5 rounded-xl border-2 border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-white text-sm appearance-none pr-10 transition-all"
                        >
                          <option value="Vacant">Vacant</option>
                          <option value="Occupied">Occupied</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <ChevronDown size={18} className="text-slate-400" />
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 flex-shrink-0 bg-slate-50 rounded-b-2xl">
                <Button type="button" variant="secondary" onClick={closeModal} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" form="unitForm" variant="primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {editUnit ? 'Updating...' : 'Saving...'}
                    </>
                  ) : (
                    editUnit ? 'Update Unit' : 'Save Unit'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW UNIT MODAL */}
        {viewUnit && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
                <h3 className="text-lg font-bold text-slate-900">Unit Details</h3>
                <button
                  onClick={() => setViewUnit(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Unit Number</p>
                    <p className="text-sm font-medium text-slate-900">{viewUnit.unitNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Unit Type</p>
                    <p className="text-sm font-medium text-slate-900">{viewUnit.unitType || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Civic Number</p>
                    <p className="text-sm font-bold text-indigo-600">{viewUnit.civicNumber || viewUnit.building}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Floor</p>
                    <p className="text-sm font-medium text-slate-900">{viewUnit.floor || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Bedrooms</p>
                    <p className="text-sm font-medium text-slate-900">{viewUnit.bedrooms || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Status</p>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      viewUnit.status === 'Occupied' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {viewUnit.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-200 flex-shrink-0 bg-slate-50 rounded-b-2xl">
                <Button variant="secondary" onClick={() => setViewUnit(null)}>
                  Close
                </Button>
                <Button variant="primary" onClick={() => { setViewUnit(null); openEditModal(viewUnit); }}>
                  <Edit2 size={16} />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Unit</h3>
                <p className="text-slate-500 text-sm mb-6">
                  Are you sure you want to delete unit <strong>{deleteConfirm.unitNumber}</strong>? This action cannot be undone.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="secondary" onClick={() => setDeleteConfirm(null)} disabled={submitting}>
                    Cancel
                  </Button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    disabled={submitting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
};
