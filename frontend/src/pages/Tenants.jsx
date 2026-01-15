import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/Button';
import { Plus, Search, User, Eye, Trash2, FileText, Shield, Download, Upload, ArrowLeft, Calendar, FileCheck, AlertCircle, Pencil } from 'lucide-react';
import clsx from 'clsx';
import api from '../api/client';

const initialTenants = [];

export const Tenants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [viewingTenant, setViewingTenant] = useState(null);
  const [errorNotFound, setErrorNotFound] = useState(false);

  // Lists for Dropdowns
  const [properties, setProperties] = useState([]);
  const [allUnits, setAllUnits] = useState([]); // All units fetched
  const [availableUnits, setAvailableUnits] = useState([]); // Filtered by selected property

  // For Modal Form State
  const [selectedPropertyId, setSelectedPropertyId] = useState('');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const res = await api.get('/admin/tenants');
      setTenants(res.data);
    } catch (e) {
      console.error("Failed to fetch tenants", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [propsRes, unitsRes] = await Promise.all([
        api.get('/admin/properties'),
        api.get('/admin/units?limit=1000')
      ]);
      setProperties(propsRes.data);
      setAllUnits(unitsRes.data.data || unitsRes.data);
    } catch (e) {
      console.error("Failed to fetch dropdown data", e);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  // Filter units when property changes in modal
  useEffect(() => {
    if (selectedPropertyId) {
      // API response structure for units: { id, unitNumber, propertyId, status... }
      const filtered = allUnits.filter(u => {
        const isMatch = u.propertyId === parseInt(selectedPropertyId);
        const isVacant = u.status === 'Vacant';
        // If editing, keep the current assigned unit even if it shows "Occupied"
        const isCurrentUnit = editingTenant && u.id === parseInt(editingTenant.unitId);

        return isMatch && (isVacant || isCurrentUnit);
      });
      setAvailableUnits(filtered);
    } else {
      setAvailableUnits([]);
    }
  }, [selectedPropertyId, allUnits, editingTenant]);

  /* 🔗 HANDLE URL PARAMS */
  useEffect(() => {
    if (id) {
      const tenantId = parseInt(id);
      const found = tenants.find(t => t.id === tenantId);
      if (found) {
        setViewingTenant(found);
        setErrorNotFound(false);
      } else {
        setViewingTenant(null);
        setErrorNotFound(true);
      }
    } else {
      setViewingTenant(null);
      setErrorNotFound(false);
    }
  }, [id, tenants]);

  /* 🔒 LOCK BACKGROUND SCROLL */
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  /* 🔍 SEARCH */
  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.property.toLowerCase().includes(search.toLowerCase()) ||
      t.unit.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase())
  );

  /* ➕ ADD/EDIT TENANT */
  const handleSaveTenant = async (e) => {
    e.preventDefault();
    const form = e.target;

    if (!editingTenant && form.password.value !== form.confirmPassword.value) {
      alert('Passwords do not match');
      return;
    }

    if (editingTenant) {
      try {
        const uId = form.unitId.value;

        await api.put(`/admin/tenants/${editingTenant.id}`, {
          name: form.name.value,
          type: form.type.value,
          email: form.email.value,
          phone: form.phone.value,
          unitId: uId, // Backend handles unit swap logic
        });

        await fetchTenants(); // Refresh data from server
        setShowModal(false);
        setEditingTenant(null);
        form.reset();
      } catch (e) {
        console.error(e);
        alert('Failed to update tenant');
      }
      return; // Stop execution here
    } else {
      try {
        // Find selected names for display fallback/logic if needed, but primarily send IDs
        const propId = form.propertyId.value;
        const uId = form.unitId.value;
        const selectedProp = properties.find(p => p.id === parseInt(propId));
        const selectedUnit = allUnits.find(u => u.id === parseInt(uId));

        await api.post('/admin/tenants', {
          name: form.name.value,
          type: form.type.value,
          propertyId: propId,
          property: selectedProp ? selectedProp.name : 'Unknown', // Fallback for UI until fully relational
          unitId: uId,
          unit: selectedUnit ? selectedUnit.unitNumber : 'Unknown', // Fallback
          email: form.email.value,
          phone: form.phone.value,
          password: form.password.value,
        });
        fetchTenants(); // Refresh
      } catch (e) {
        alert('Failed to create tenant');
        console.error(e);
      }
    }

    setShowModal(false);
    setEditingTenant(null);
    form.reset();
  };

  /* 🗑 DELETE TENANT */
  const deleteTenant = async (id) => {
    if (window.confirm('Are you sure you want to delete this tenant?')) {
      try {
        await api.delete(`/admin/tenants/${id}`);
        setTenants(tenants.filter((t) => t.id !== id));
      } catch (e) {
        alert('Failed to delete tenant');
      }
    }
  };

  const handleEditTenant = (tenant) => {
    setEditingTenant(tenant);
    // Determine property ID from name if necessary, or assume tenant object has propertyId now
    // Since we are moving to backend data, we'll try to find the match or rely on future data having IDs
    if (tenant.propertyId) setSelectedPropertyId(tenant.propertyId);
    setShowModal(true);
  };

  const handleViewDetails = (tenant) => {
    navigate(`/tenants/${tenant.id}`);
  };

  const handleBack = () => {
    navigate('/tenants');
  };

  if (errorNotFound) {
    return (
      <MainLayout title="Tenant Not Found">
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl shadow-sm border border-slate-100 text-center space-y-6">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
            <AlertCircle size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Tenant Record Not Found</h2>
            <p className="text-slate-500 font-medium mt-2 max-w-sm">The tenant profile you are looking for might have been moved or deleted.</p>
          </div>
          <Button variant="secondary" onClick={handleBack} className="gap-2">
            <ArrowLeft size={18} />
            Back to Tenants
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (viewingTenant) {
    return <TenantDetail tenant={viewingTenant} onBack={handleBack} />;
  }

  return (
    <MainLayout title="Tenants">
      <div className="flex flex-col gap-6">

        {/* TOP BAR */}
        <section className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.06)] gap-4">
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all w-full md:w-auto md:min-w-[320px]">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search tenants, email, building"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 w-full text-sm font-medium"
            />
          </div>

          <Button variant="primary" onClick={() => { setEditingTenant(null); setShowModal(true); }}>
            <Plus size={18} />
            Add Tenant
          </Button>
        </section>

        {/* TABLE */}
        <section className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="grid grid-cols-[1.2fr_1.2fr_0.8fr_1fr_1fr_0.8fr] bg-slate-50 border-b border-slate-200 px-6 py-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tenant</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Property / Unit</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lease Status</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Actions</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredTenants.map((tenant, index) => {
              const hasInsuranceIssue = tenant.insurance?.some(policy => {
                const end = new Date(policy.endDate);
                const now = new Date();
                const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
                return end < now || diffDays <= 30;
              });

              return (
                <div
                  key={tenant.id}
                  className="grid grid-cols-[1.2fr_1.2fr_0.8fr_1fr_1fr_0.8fr] px-6 py-4 items-center hover:bg-slate-50/80 transition-all duration-200"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span className="flex items-center gap-3 font-medium text-slate-700 overflow-hidden">
                    <div className="min-w-[32px] w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <User size={16} />
                    </div>
                    <button
                      onClick={() => handleViewDetails(tenant)}
                      className="hover:text-indigo-600 hover:underline transition-all text-left truncate"
                    >
                      {tenant.name}
                    </button>
                    {hasInsuranceIssue && (
                      <div className="text-amber-500 min-w-[14px]" title="Insurance Expired or Expiring Soon">
                        <AlertCircle size={14} />
                      </div>
                    )}
                  </span>

                  <span className="text-sm text-slate-600 truncate">{tenant.email}</span>

                  <span className="w-fit">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${tenant.type === 'Company'
                      ? 'bg-purple-50 text-purple-700 border-purple-100'
                      : 'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                      {tenant.type}
                    </span>
                  </span>

                  <span className="text-sm text-slate-600">
                    <div className="font-medium text-slate-800">{tenant.property}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{tenant.unit}</div>
                  </span>

                  <span className="w-fit">
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${tenant.leaseStatus === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : tenant.leaseStatus === 'DRAFT'
                        ? 'bg-amber-50 text-amber-700 border-amber-100'
                        : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${tenant.leaseStatus === 'Active' ? 'bg-emerald-500' :
                        tenant.leaseStatus === 'DRAFT' ? 'bg-amber-500' : 'bg-red-500'
                        }`}></span>
                      {tenant.leaseStatus === 'DRAFT' ? 'Draft' : tenant.leaseStatus}
                    </span>
                  </span>

                  <span className="flex justify-center gap-1">
                    <button
                      onClick={() => handleViewDetails(tenant)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEditTenant(tenant)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                      title="Edit Tenant"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                      onClick={() => deleteTenant(tenant.id)}
                      title="Delete Tenant"
                    >
                      <Trash2 size={16} />
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ADD/EDIT TENANT MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
            <form
              className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto"
              onSubmit={handleSaveTenant}
            >
              <h3 className="text-2xl font-bold text-slate-800 mb-6">{editingTenant ? 'Edit Tenant' : 'Add Tenant'}</h3>

              <div className="space-y-6">
                {/* Profile Information */}
                <div>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Profile Information</h4>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-600">Tenant Name</label>
                      <input
                        name="name"
                        placeholder="Enter name"
                        defaultValue={editingTenant?.name || ''}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-600">Tenant Type</label>
                      <div className="relative">
                        <select
                          name="type"
                          defaultValue={editingTenant?.type || 'Individual'}
                          required
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none bg-white font-medium"
                        >
                          <option value="Individual">Individual</option>
                          <option value="Company">Company</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-600">Building / Property</label>
                        <div className="relative">
                          <select
                            name="propertyId"
                            defaultValue={editingTenant?.propertyId || ''}
                            onChange={(e) => setSelectedPropertyId(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none bg-white font-medium"
                          >
                            <option value="">Select Property</option>
                            {properties.map(p => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-slate-600">Unit / Bedroom</label>
                        <div className="relative">
                          <select
                            name="unitId"
                            defaultValue={editingTenant?.unitId || ''}
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none bg-white font-medium"
                            disabled={!selectedPropertyId}
                          >
                            <option value="">Select Unit</option>
                            {availableUnits.map(u => (
                              <option key={u.id} value={u.id}>{u.unitNumber} ({u.rentalMode})</option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Contact Information</h4>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-600">Tenant Email</label>
                      <input
                        name="email"
                        type="email"
                        placeholder="tenant@example.com"
                        defaultValue={editingTenant?.email || ''}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-600">Phone Number</label>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="e.g. +1 (555) 000-0000"
                        defaultValue={editingTenant?.phone || ''}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                {!editingTenant && (
                  <div>
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Login Credentials</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-slate-600">Password</label>
                          <input
                            name="password"
                            type="password"
                            placeholder="••••••"
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-slate-600">Confirm Password</label>
                          <input
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••"
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => { setShowModal(false); setEditingTenant(null); }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingTenant ? 'Update Tenant' : 'Save Tenant'}
                </Button>
              </div>
            </form>
          </div>
        )}

      </div>
    </MainLayout>
  );
};

/* =========================
   TENANT DETAIL COMPONENT
  ========================= */

const TenantDetail = ({ tenant, onBack }) => {
  const [activeTab, setActiveTab] = useState('Details');
  const [tenantData, setTenantData] = useState({
    ...tenant,
    email: tenant.email || `${tenant.name.toLowerCase().replace(' ', '.')}@example.com`,
    phone: tenant.phone || '+1 (555) 012-3456',
    leaseStatus: tenant.leaseStatus || 'Active'
  });
  const [documents, setDocuments] = useState(tenant.documents || []);
  const [policies, setPolicies] = useState(tenant.insurance || []);
  const [leases, setLeases] = useState([
    { id: 1, type: 'Full Unit', unit: tenant.unit, startDate: '2024-01-01', endDate: '2024-12-31', rent: '$1,200', status: 'Expired' }
  ]);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    if (tenant?.id) {
      fetchTickets();
    }
  }, [tenant?.id]);

  const fetchTickets = async () => {
    try {
      const res = await api.get(`/admin/tickets?userId=${tenant.id}`);
      // Map backend fields to frontend UI expectations if needed
      const mapped = res.data.map(t => ({
        id: t.id, // e.g. T-1001
        dbId: t.dbId,
        title: t.subject,
        category: t.category || 'General',
        priority: t.priority,
        status: t.status,
        date: t.date
      }));
      setTickets(mapped);
    } catch (e) {
      console.error("Failed to fetch tickets", e);
    }
  };

  // Modals state
  const [showAddInsurance, setShowAddInsurance] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [showAddTicket, setShowAddTicket] = useState(false);
  const [showAddLease, setShowAddLease] = useState(false);
  const [showEditTenant, setShowEditTenant] = useState(false);
  const [showContactTenant, setShowContactTenant] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [viewingPolicy, setViewingPolicy] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);

  const deleteDoc = (id) => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter(d => d.id !== id));
    }
  };

  const deletePolicy = (id) => {
    if (confirm('Are you sure you want to delete this insurance policy?')) {
      setPolicies(policies.filter(p => p.id !== id));
    }
  };

  const getStatusBadge = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    // Reset time for accurate day calculation
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: 'Expired',
        class: 'bg-red-50 text-red-700 border-red-100',
        dot: 'bg-red-500',
        helper: `Expired ${Math.abs(diffDays)} days ago`,
        icon: true
      };
    }
    if (diffDays <= 30) {
      return {
        label: 'Expiring Soon',
        class: 'bg-amber-50 text-amber-700 border-amber-100',
        dot: 'bg-amber-500',
        helper: `Expires in ${diffDays} days`,
        icon: true
      };
    }
    return {
      label: 'Active',
      class: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      dot: 'bg-emerald-500',
      helper: `Expires in ${diffDays} days`,
      icon: false
    };
  };

  const handleSaveInsurance = (e) => {
    e.preventDefault();
    const form = e.target;
    const newPolicy = {
      id: editingPolicy ? editingPolicy.id : Date.now(),
      provider: form.provider.value,
      policyNumber: form.policyNumber.value,
      startDate: form.startDate.value,
      endDate: form.endDate.value,
      document: 'uploaded_policy.pdf' // Mock upload
    };

    if (editingPolicy) {
      setPolicies(policies.map(p => p.id === editingPolicy.id ? newPolicy : p));
    } else {
      setPolicies([...policies, newPolicy]);
    }

    setShowAddInsurance(false);
    setEditingPolicy(null);
  };

  const handleSaveDocument = (e) => {
    e.preventDefault();
    const form = e.target;
    const newDoc = {
      id: Date.now(),
      name: form.docName.value || 'New Document.pdf',
      type: form.docType.value,
      expiryDate: form.expiryDate.value,
      date: new Date().toISOString().split('T')[0]
    };
    setDocuments([...documents, newDoc]);
    setShowAddDocument(false);
  };

  const handleSaveTicket = async (e) => {
    e.preventDefault();
    const form = e.target;
    try {
      const payload = {
        tenantId: tenant.id,
        subject: form.title.value,
        category: form.category.value,
        priority: form.priority.value,
        description: `Created via Admin Portal for ${tenant.name}`,
        propertyId: tenant.propertyId,
        unitId: tenant.unitId
      };
      await api.post('/admin/tickets', payload);
      fetchTickets(); // Refresh list
      setShowAddTicket(false);
    } catch (e) {
      console.error("Failed to save ticket", e);
      alert("Error creating ticket");
    }
  };

  const handleSaveLease = (e) => {
    e.preventDefault();
    const form = e.target;
    const newLease = {
      id: Date.now(),
      type: form.type.value,
      unit: form.unit.value,
      startDate: form.startDate.value,
      endDate: form.endDate.value,
      rent: `$${form.rent.value}`,
      status: new Date(form.endDate.value) < new Date() ? 'Expired' : 'Active'
    };
    setLeases([newLease, ...leases]);
    setShowAddLease(false);
  };

  const handleUpdateTenant = (e) => {
    e.preventDefault();
    const form = e.target;
    setTenantData({
      ...tenantData,
      name: form.name.value,
      type: form.type.value,
      email: form.email.value,
      phone: form.phone.value
    });
    setShowEditTenant(false);
  };

  return (
    <MainLayout title={`Tenant: ${tenant.name}`}>
      <div className="flex flex-col gap-6">

        {/* HEADER */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all border border-slate-100"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 font-bold text-lg">
                {tenantData.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{tenantData.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-slate-500 font-medium">{tenantData.property}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="text-sm text-slate-500 font-medium">{tenantData.unit}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="secondary" className="flex-1 md:flex-none" onClick={() => setShowEditTenant(true)}>Edit Tenant</Button>
            <Button variant="primary" className="flex-1 md:flex-none" onClick={() => setShowContactTenant(true)}>Contact</Button>
          </div>
        </section>

        {/* TABS */}
        <div className="flex border-b border-slate-200 gap-8 px-2 overflow-x-auto no-scrollbar">
          {['Details', 'Leases', 'Documents', 'Insurance', 'Tickets'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "pb-4 px-2 text-sm font-semibold transition-all relative whitespace-nowrap",
                activeTab === tab
                  ? "text-indigo-600"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full animate-in fade-in slide-in-from-bottom-1 duration-300"></div>
              )}
            </button>
          ))}
        </div>

        {/* TAB CONTENT */}
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">

          {activeTab === 'Details' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Status</h4>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${tenantData.leaseStatus === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  <span className="font-semibold text-slate-700">{tenantData.leaseStatus}</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Type</h4>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${tenantData.type === 'Company' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                  }`}>
                  {tenantData.type}
                </span>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Tenant ID</h4>
                <p className="font-mono text-sm text-slate-600">TEN-{tenantData.id}</p>
              </div>

              <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Contact Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Email</p>
                    <p className="text-sm font-medium text-slate-700">{tenantData.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Phone</p>
                    <p className="text-sm font-medium text-slate-700">{tenantData.phone}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Leases' && (
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h4 className="font-bold text-slate-800">Lease History</h4>
                <Button variant="secondary" size="sm" onClick={() => setShowAddLease(true)}>Add Past Lease</Button>
              </div>

              {leases.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Unit / Bedroom</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Period</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Rent</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {leases.map(lease => (
                        <tr key={lease.id} className="hover:bg-slate-50/50 transition-all font-medium">
                          <td className="px-6 py-4 text-sm text-slate-700">{lease.type}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{lease.unit}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{lease.startDate} - {lease.endDate}</td>
                          <td className="px-6 py-4 text-sm text-slate-700 font-bold">{lease.rent}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tight ${lease.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                              }`}>
                              {lease.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="max-w-xs mx-auto space-y-4">
                    <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                      <FileText size={32} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">No Lease History</h4>
                      <p className="text-sm text-slate-500">The historical lease record for this tenant is currently being migrated.</p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'Documents' && (
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h4 className="font-bold text-slate-800">Tenant Documents</h4>
                <Button variant="primary" size="sm" className="gap-2" onClick={() => setShowAddDocument(true)}>
                  <Upload size={16} />
                  Upload Document
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Document Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Expiry</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {documents.map(doc => (
                      <tr key={doc.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                              <FileText size={16} />
                            </div>
                            <span className="font-semibold text-slate-700">{doc.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {doc.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {doc.expiryDate ? (
                            <div>
                              <p className="text-sm font-medium text-slate-700">{doc.expiryDate}</p>
                              {(() => {
                                const diff = Math.ceil((new Date(doc.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                                return (
                                  <p className={clsx("text-[10px] font-bold uppercase tracking-wider mt-1",
                                    diff < 0 ? "text-rose-500" : diff <= 30 ? "text-amber-500" : "text-emerald-500")}>
                                    {diff < 0 ? `Expired ${Math.abs(diff)} days ago` : `Expires in ${diff} days`}
                                  </p>
                                );
                              })()}
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400 italic">No Expiry</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {doc.expiryDate ? (
                            (() => {
                              const status = getStatusBadge(doc.expiryDate);
                              return (
                                <span className={clsx("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tight w-fit", status.class)}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                                  {status.label}
                                </span>
                              );
                            })()
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-slate-50 text-slate-400 uppercase tracking-tight">Permanent</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setViewingDoc(doc)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              title="View"
                            >
                              <Eye size={18} />
                            </button>
                            <button onClick={() => deleteDoc(doc.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {documents.length === 0 && (
                  <div className="py-12 text-center text-slate-400 italic">No documents uploaded yet.</div>
                )}
              </div>
            </section>
          )}

          {activeTab === 'Insurance' && (
            <div className="space-y-6">
              <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h4 className="font-bold text-slate-800">Insurance Policies</h4>
                  <Button variant="primary" size="sm" onClick={() => {
                    setEditingPolicy(null);
                    setShowAddInsurance(true);
                  }}>
                    Add Insurance
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Provider</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Policy Number</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Period</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {policies.map(policy => {
                        const status = getStatusBadge(policy.endDate);
                        return (
                          <tr key={policy.id} className="hover:bg-slate-50/50 transition-all">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg ${status.class.split(' ')[0]} flex items-center justify-center ${status.class.split(' ')[1]} border ${status.class.split(' ')[2]}`}>
                                  <Shield size={16} />
                                </div>
                                <span className="font-semibold text-slate-700">{policy.provider}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-mono text-slate-500">
                              {policy.policyNumber}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs font-medium text-slate-600">
                                {policy.startDate} - {policy.endDate}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={clsx("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tight w-fit", status.class)}>
                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setViewingPolicy(policy)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                  title="View"
                                >
                                  <Eye size={18} />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingPolicy(policy);
                                    setShowAddInsurance(true);
                                  }}
                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                  title="Edit"
                                >
                                  <FileCheck size={18} />
                                </button>
                                <button
                                  onClick={() => deletePolicy(policy.id)}
                                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {policies.length === 0 && (
                    <div className="py-12 text-center text-slate-400 italic">No insurance policies added.</div>
                  )}
                </div>
              </section>

              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex items-start gap-4">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h5 className="font-bold text-amber-900">Compliance Requirement</h5>
                  <p className="text-sm text-amber-800 mt-1 opacity-80">All tenants are required to maintain a valid Liability Insurance policy throughout their lease term. System will automatically notify the tenant 30 days before expiry.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Tickets' && (
            <div className="space-y-6">
              <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h4 className="font-bold text-slate-800">Maintenance Tickets</h4>
                  <Button variant="primary" size="sm" onClick={() => setShowAddTicket(true)}>
                    Create Ticket
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {tickets.map(ticket => (
                        <tr key={ticket.id} className="hover:bg-slate-50/50 transition-all">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-slate-700">{ticket.title}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">#{ticket.id}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                              {ticket.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tight w-fit ${ticket.status === 'Open' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              ticket.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                'bg-emerald-50 text-emerald-700 border-emerald-100'
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'Open' ? 'bg-blue-500' :
                                ticket.status === 'In Progress' ? 'bg-amber-500' :
                                  'bg-emerald-500'
                                }`}></span>
                              {ticket.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                            {ticket.date}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                                <Search size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {tickets.length === 0 && (
                    <div className="py-12 text-center text-slate-400 italic">No tickets found for this tenant.</div>
                  )}
                </div>
              </section>
            </div>
          )}

        </div>

        {/* ADD/EDIT INSURANCE MODAL */}
        {showAddInsurance && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] animate-in fade-in duration-200">
            <form onSubmit={handleSaveInsurance} className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">{editingPolicy ? 'Edit' : 'Add'} Insurance Policy</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Provider Name</label>
                  <input
                    name="provider"
                    defaultValue={editingPolicy?.provider || ''}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 transition-all font-medium text-slate-700"
                    placeholder="e.g. State Farm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Policy Number</label>
                  <input
                    name="policyNumber"
                    defaultValue={editingPolicy?.policyNumber || ''}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 transition-all font-medium text-slate-700 font-mono"
                    placeholder="e.g. POL-12345"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Start Date</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        name="startDate"
                        type="date"
                        defaultValue={editingPolicy?.startDate || ''}
                        required
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 transition-all text-sm font-medium text-slate-700"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">End Date</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        name="endDate"
                        type="date"
                        defaultValue={editingPolicy?.endDate || ''}
                        required
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 transition-all text-sm font-medium text-slate-700"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-6 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-indigo-200 transition-all group cursor-pointer relative">
                  <Upload size={24} className="text-slate-300 group-hover:text-indigo-400 transition-all" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upload Policy Document</p>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowAddInsurance(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="flex-1">Save Policy</Button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW INSURANCE MODAL */}
        {viewingPolicy && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] animate-in fade-in duration-200" onClick={() => setViewingPolicy(null)}>
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Insurance Details</h3>
                <button onClick={() => setViewingPolicy(null)} className="text-slate-400 hover:text-slate-600 transition-all">✕</button>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Shield size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Provider</p>
                    <p className="text-lg font-bold text-slate-800">{viewingPolicy.provider}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Policy Number</p>
                    <p className="font-mono text-sm font-semibold text-slate-700">{viewingPolicy.policyNumber}</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Status</p>
                    {(() => {
                      const status = getStatusBadge(viewingPolicy.endDate);
                      return (
                        <span className={clsx("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tight w-fit", status.class)}>
                          {status.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Start Date</p>
                    <p className="text-sm font-semibold text-slate-700">{viewingPolicy.startDate}</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">End Date</p>
                    <p className="text-sm font-semibold text-slate-700">{viewingPolicy.endDate}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-900">{viewingPolicy.document}</span>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const res = await api.get(`/admin/leases/${tenant.id}/download`, { responseType: 'blob' });
                        const url = window.URL.createObjectURL(new Blob([res.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `insurance-${viewingPolicy.id}.pdf`);
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                      } catch (e) { alert('Download failed'); }
                    }}
                    className="text-indigo-600 hover:text-indigo-800 transition-all"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>
              <div className="mt-8">
                <Button variant="secondary" className="w-full" onClick={() => setViewingPolicy(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}

        {/* UPLOAD DOCUMENT MODAL */}
        {showAddDocument && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] animate-in fade-in duration-200">
            <form onSubmit={handleSaveDocument} className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Upload Document</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Document Name</label>
                  <input
                    name="docName"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 transition-all font-medium text-slate-700"
                    placeholder="e.g. ID Proof"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Document Type</label>
                  <div className="relative">
                    <select
                      name="docType"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 transition-all appearance-none bg-white font-medium text-slate-700"
                    >
                      <option value="Agreement">Lease Agreement</option>
                      <option value="ID">Identity Proof</option>
                      <option value="Income">Income Proof</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Expiry Date (Optional)</label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="expiryDate"
                      type="date"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 transition-all text-sm font-medium text-slate-700"
                    />
                  </div>
                </div>
                <div className="p-6 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-indigo-200 transition-all group cursor-pointer relative">
                  <Upload size={24} className="text-slate-300 group-hover:text-indigo-400 transition-all" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Choose File</p>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowAddDocument(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="flex-1">Upload</Button>
              </div>
            </form>
          </div>
        )}

        {/* VIEW DOCUMENT MODAL */}
        {viewingDoc && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] animate-in fade-in duration-200" onClick={() => setViewingDoc(null)}>
            <div className="bg-white rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{viewingDoc.name}</h3>
                  <p className="text-sm text-slate-500">{viewingDoc.type} • Uploaded on {viewingDoc.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    onClick={async () => {
                      try {
                        // If it's a lease agreement, use the lease download API
                        const endpoint = viewingDoc.type === 'Agreement' ? `/admin/leases/${tenant.id}/download` : `/admin/invoices/${tenant.id}/download`;
                        const res = await api.get(endpoint, { responseType: 'blob' });
                        const url = window.URL.createObjectURL(new Blob([res.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `${viewingDoc.name}`);
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                      } catch (e) { alert('Download failed'); }
                    }}
                  >
                    <Download size={16} />
                    Download
                  </Button>
                  <button onClick={() => setViewingDoc(null)} className="p-2 text-slate-400 hover:text-slate-600 transition-all">✕</button>
                </div>
              </div>

              <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden relative min-h-[500px]">
                {viewingDoc.name.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={`https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf#toolbar=0`}
                    className="w-full h-full border-none"
                    title="PDF Preview"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-8">
                    <img
                      src={`https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=1000`}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                      alt="Document Preview"
                    />
                  </div>
                )}
              </div>
              <div className="mt-8">
                <Button variant="secondary" className="w-full" onClick={() => setViewingDoc(null)}>Close Preview</Button>
              </div>
            </div>
          </div>
        )}

        {/* ADD TICKET MODAL */}
        {showAddTicket && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] animate-in fade-in duration-200">
            <form onSubmit={handleSaveTicket} className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Create Maintenance Ticket</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 opacity-60">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Tenant</label>
                    <input disabled value={tenant.name} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium" />
                  </div>
                  <div className="space-y-1.5 opacity-60">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Unit</label>
                    <input disabled value={tenant.unit} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Issue Title</label>
                  <input
                    name="title"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 transition-all font-medium text-slate-700"
                    placeholder="e.g. Broken Light Fixture"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Category</label>
                  <div className="relative">
                    <select
                      name="category"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 transition-all appearance-none bg-white font-medium text-slate-700"
                    >
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="HVAC">HVAC</option>
                      <option value="Appliance">Appliance</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Priority</label>
                  <div className="flex gap-4">
                    {['Low', 'Medium', 'High'].map(p => (
                      <label key={p} className="flex-1">
                        <input type="radio" name="priority" value={p} defaultChecked={p === 'Medium'} className="sr-only peer" />
                        <div className="text-center py-2 rounded-xl border border-slate-200 peer-checked:border-indigo-500 peer-checked:bg-indigo-50 peer-checked:text-indigo-600 cursor-pointer transition-all text-sm font-bold opacity-60 peer-checked:opacity-100">
                          {p}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowAddTicket(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="flex-1">Submit Ticket</Button>
              </div>
            </form>
          </div>
        )}

        {/* EDIT TENANT MODAL */}
        {showEditTenant && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] animate-in fade-in duration-200">
            <form onSubmit={handleUpdateTenant} className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Edit Tenant</h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Name</label>
                  <input name="name" defaultValue={tenantData.name} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Email</label>
                  <input name="email" type="email" defaultValue={tenantData.email} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Phone</label>
                  <input name="phone" defaultValue={tenantData.phone} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all font-medium text-slate-700" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Type</label>
                  <select name="type" defaultValue={tenantData.type} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all appearance-none bg-white font-medium text-slate-700">
                    <option value="Individual">Individual</option>
                    <option value="Company">Company</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowEditTenant(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="flex-1">Save Changes</Button>
              </div>
            </form>
          </div>
        )}

        {/* CONTACT TENANT MODAL */}
        {showContactTenant && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] animate-in fade-in duration-200" onClick={() => setShowContactTenant(false)}>
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Contact Tenant</h3>
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</p>
                  <a href={`mailto:${tenantData.email}`} className="text-indigo-600 font-bold hover:underline break-all">{tenantData.email}</a>
                </div>
                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</p>
                  <a href={`tel:${tenantData.phone}`} className="text-indigo-600 font-bold hover:underline">{tenantData.phone}</a>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Quick Note</label>
                  <textarea placeholder="Type a message..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all text-sm h-24 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <Button variant="secondary" className="w-full" onClick={() => setShowContactTenant(false)}>Close</Button>
              </div>
            </div>
          </div>
        )}

        {/* ADD PAST LEASE MODAL */}
        {showAddLease && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] animate-in fade-in duration-200">
            <form onSubmit={handleSaveLease} className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Add Historical Lease</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Lease Type</label>
                    <select name="type" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none transition-all appearance-none bg-white font-medium text-slate-700">
                      <option value="Full Unit">Full Unit</option>
                      <option value="Bedroom">Bedroom</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Unit / Room</label>
                    <input name="unit" defaultValue={tenantData.unit} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none font-medium text-slate-700" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Start Date</label>
                    <input name="startDate" type="date" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none font-medium text-slate-700" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">End Date</label>
                    <input name="endDate" type="date" required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none font-medium text-slate-700" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Monthly Rent</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input name="rent" type="number" required placeholder="0.00" className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none font-medium text-slate-700" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowAddLease(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="flex-1">Save Lease</Button>
              </div>
            </form>
          </div>
        )}

      </div>
    </MainLayout>
  );
};
