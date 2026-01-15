import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/Button';
import { Plus, Search, User, Eye, Trash2, Building2, Pencil } from 'lucide-react';

const initialOwners = [
    {
        id: 1,
        name: 'Grand Holdings Ltd',
        email: 'owner@example.com',
        phone: '+1 (555) 111-2222',
        password: '123456',
        properties: ['Grand Residency', 'Sunset Heights'],
        totalUnits: 36,
        status: 'Active'
    },
    {
        id: 2,
        name: 'Emerald Realty',
        email: 'emerald@example.com',
        phone: '+1 (555) 333-4444',
        password: '123456',
        properties: ['Emerald Square'],
        totalUnits: 12,
        status: 'Active'
    }
];

export const Owners = () => {
    const [owners, setOwners] = useState([]);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [viewingOwner, setViewingOwner] = useState(null);
    const [editingOwner, setEditingOwner] = useState(null);

    // NEW: Properties State
    const [availableProperties, setAvailableProperties] = useState([]);
    const [selectedProperties, setSelectedProperties] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Fetch properties from backend
    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/admin/properties', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setAvailableProperties(data);
                }
            } catch (error) {
                console.error('Failed to fetch properties', error);
            }
        };
        fetchProperties();
    }, []);

    // Fetch owners from backend
    useEffect(() => {
        const fetchOwners = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/admin/owners', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    setOwners(data);
                }
            } catch (error) {
                console.error('Failed to fetch owners', error);
            }
        };
        fetchOwners();
    }, []);

    /* 💾 PERSIST OWNERS - Optional/Removed in favor of backend source of truth */
    // useEffect(() => {
    //     localStorage.setItem('owners', JSON.stringify(owners));
    // }, [owners]);

    /* 🔍 SEARCH */
    const filteredOwners = owners.filter(
        (o) =>
            (o.name && o.name.toLowerCase().includes(search.toLowerCase())) ||
            (o.email && o.email.toLowerCase().includes(search.toLowerCase())) ||
            (o.phone && o.phone.toLowerCase().includes(search.toLowerCase()))
    );

    /* ➕ ADD/EDIT OWNER */
    const handleSaveOwner = async (e) => {
        e.preventDefault();
        const form = e.target;

        if (!editingOwner && form.password.value !== form.confirmPassword.value) {
            alert('Passwords do not match');
            return;
        }

        const payload = {
            name: form.name.value,
            email: form.email.value,
            phone: form.phone.value,
            password: form.password?.value,
            propertyIds: selectedProperties.map(p => p.id), // Send IDs
        };

        const token = localStorage.getItem('token');
        const OWNERS_API = 'http://localhost:5000/api/admin/owners';

        try {
            if (editingOwner) {
                const res = await fetch(`${OWNERS_API}/${editingOwner.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    fetchOwners();
                } else alert('Failed to update owner');
            } else {
                const res = await fetch(OWNERS_API, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    fetchOwners();
                } else alert('Failed to create owner');
            }
        } catch (e) {
            console.error(e);
            alert('Error saving owner');
        }

        // Reload owners to get updated list
        async function fetchOwners() {
            const token = localStorage.getItem('token');
            const res = await fetch(OWNERS_API, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOwners(data);

                // Also refresh properties so the dropdown is up to date (removed/added assignments)
                const propRes = await fetch('http://localhost:5000/api/admin/properties', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (propRes.ok) {
                    setAvailableProperties(await propRes.json());
                }
            }
        };

        setShowModal(false);
        setEditingOwner(null);
        setSelectedProperties([]);
        form.reset();
    };

    /* 🗑 DELETE OWNER */
    const deleteOwner = async (id) => {
        if (window.confirm('Are you sure you want to delete this owner?')) {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch(`http://localhost:5000/api/admin/owners/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setOwners(owners.filter((o) => o.id !== id));
                    // Refresh properties to show they are now available
                    const propRes = await fetch('http://localhost:5000/api/admin/properties', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (propRes.ok) {
                        setAvailableProperties(await propRes.json());
                    }
                } else {
                    alert('Failed to delete owner');
                }
            } catch (e) {
                console.error(e);
                alert('Error deleting owner');
            }
        }
    };

    const handleEditOwner = (owner) => {
        setEditingOwner(owner);
        // Map names to IDs from availableProperties
        // Since we filtered in fetch or UI, availableProperties contains ALL properties (with ownerId field)
        // We match by Name because the owner object for display currently has property NAMES array, not IDs explicitly in existing code structure.
        // Wait, 'owner' comes from 'owners' state which comes from 'fetchOwners' (GET /api/admin/owners).
        // The backend GET /api/admin/owners currently returns properties with names.
        // I need to make sure I can map them back to IDs to use in my new logic.

        const currentProps = availableProperties.filter(p => owner.properties.includes(p.name));
        setSelectedProperties(currentProps);

        setShowModal(true);
    };

    return (
        <MainLayout title="Owners Management">
            <div className="flex flex-col gap-6">

                {/* TOP BAR */}
                <section className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-[0_5px_15px_rgba(0,0,0,0.06)] gap-4">
                    <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all w-full md:w-auto md:min-w-[320px]">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search owners by name, email, phone"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 w-full text-sm font-medium"
                        />
                    </div>


                    <Button variant="primary" onClick={() => {
                        setEditingOwner(null);
                        setSelectedProperties([]);
                        setShowModal(true);
                    }}>
                        <Plus size={18} />
                        Add Owner
                    </Button>
                </section>

                {/* TABLE */}
                <section className="bg-white rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] overflow-hidden">
                    <div className="grid grid-cols-[1.2fr_1.5fr_1.2fr_0.6fr_0.8fr] bg-slate-50 border-b border-slate-200 px-6 py-4">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Owner</span>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</span>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Properties</span>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Units</span>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Actions</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {filteredOwners.map((owner, index) => (
                            <div
                                key={owner.id}
                                className="grid grid-cols-[1.2fr_1.5fr_1.2fr_0.6fr_0.8fr] px-6 py-4 items-center hover:bg-slate-50/80 transition-all duration-200"
                            >
                                <span className="flex items-center gap-3 font-medium text-slate-700">
                                    <div className="min-w-[32px] w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                        <User size={16} />
                                    </div>
                                    <span className="truncate">{owner.name}</span>
                                </span>

                                <span className="text-sm text-slate-600 truncate">{owner.email}</span>

                                <span className="text-sm text-slate-600 truncate" title={owner.properties.join(', ')}>
                                    {owner.properties.join(', ')}
                                </span>

                                <span className="text-sm font-bold text-slate-700">{owner.totalUnits}</span>

                                <span className="flex justify-center gap-1">
                                    <button
                                        onClick={() => setViewingOwner(owner)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                        title="View Owner"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleEditOwner(owner)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                        title="Edit Owner"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                        onClick={() => deleteOwner(owner.id)}
                                        title="Delete Owner"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ADD/EDIT OWNER MODAL */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                        <form
                            className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto"
                            onSubmit={handleSaveOwner}
                        >
                            <h3 className="text-2xl font-bold text-slate-800 mb-6">{editingOwner ? 'Edit Owner' : 'Add Owner'}</h3>

                            <div className="space-y-6">
                                {/* Profile Information */}
                                <div>
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Profile Information</h4>
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium text-slate-600">Owner Name</label>
                                            <input
                                                name="name"
                                                defaultValue={editingOwner?.name || ''}
                                                placeholder="Enter owner name"
                                                required
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                            />
                                        </div>

                                        {!editingOwner && (
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-medium text-slate-600">Assign Properties</label>

                                                {/* Selected Properties Tags */}
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {selectedProperties.map((prop) => (
                                                        <span key={prop.id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-sm font-medium text-indigo-700">
                                                            {prop.name}
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedProperties(prev => prev.filter(p => p.id !== prop.id))}
                                                                className="hover:text-indigo-900 focus:outline-none"
                                                            >
                                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* Dropdown Input */}
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-left text-slate-700 hover:border-indigo-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium flex justify-between items-center"
                                                    >
                                                        <span className={selectedProperties.length === 0 ? "text-slate-400" : ""}>
                                                            {selectedProperties.length > 0 ? "Add another property..." : "Select Properties"}
                                                        </span>
                                                        <svg className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    {isDropdownOpen && (
                                                        <div className="absolute z-10 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                                                            {availableProperties
                                                                .filter(p => {
                                                                    // 1. Must not be already selected
                                                                    const isSelected = selectedProperties.some(sp => sp.id === p.id);
                                                                    if (isSelected) return false;

                                                                    // 2. Must be unassigned (ownerId === null) OR assigned to THIS owner
                                                                    const isUnassigned = !p.ownerId;
                                                                    const isMyProperty = editingOwner && p.ownerId === editingOwner.id;

                                                                    return isUnassigned || isMyProperty;
                                                                })
                                                                .map(p => (
                                                                    <button
                                                                        key={p.id}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedProperties([...selectedProperties, p]); // Store full object
                                                                            setIsDropdownOpen(false);
                                                                        }}
                                                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 text-slate-700 font-medium text-sm flex items-center justify-between group"
                                                                    >
                                                                        {p.name}
                                                                        <Plus size={14} className="opacity-0 group-hover:opacity-100 text-indigo-600 transition-opacity" />
                                                                    </button>
                                                                ))
                                                            }
                                                            {availableProperties.filter(p => {
                                                                const isSelected = selectedProperties.some(sp => sp.id === p.id);
                                                                const isUnassigned = !p.ownerId;
                                                                const isMyProperty = editingOwner && p.ownerId === editingOwner.id;
                                                                return !isSelected && (isUnassigned || isMyProperty);
                                                            }).length === 0 && (
                                                                    <div className="px-4 py-3 text-sm text-slate-400 italic text-center">
                                                                        No more properties available
                                                                    </div>
                                                                )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {editingOwner && (
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-medium text-slate-600">Total Units (Read-only)</label>
                                                <input
                                                    value={editingOwner.totalUnits}
                                                    readOnly
                                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-500 outline-none font-medium cursor-not-allowed"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div>
                                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Contact Information</h4>
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium text-slate-600">Owner Email (Login)</label>
                                            <input
                                                name="email"
                                                type="email"
                                                defaultValue={editingOwner?.email || ''}
                                                placeholder="owner@example.com"
                                                required
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-medium text-slate-600">Phone Number</label>
                                            <input
                                                name="phone"
                                                type="tel"
                                                defaultValue={editingOwner?.phone || ''}
                                                placeholder="e.g. +1 (555) 000-0000"
                                                required
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Login Credentials */}
                                {!editingOwner && (
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
                                    onClick={() => { setShowModal(false); setEditingOwner(null); }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary">
                                    {editingOwner ? 'Update Owner' : 'Save Owner'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* OWNER DETAIL MODAL */}
                {viewingOwner && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 font-bold text-lg">
                                        {viewingOwner.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-slate-800">{viewingOwner.name}</h3>
                                        <p className="text-sm text-slate-500 font-medium">Owner Details</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setViewingOwner(null)}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-400"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</p>
                                        <p className="text-slate-700 font-medium">{viewingOwner.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                                        <p className="text-slate-700 font-medium">{viewingOwner.phone || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Properties & Units</p>
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm font-medium text-slate-600">Total Units Managed</span>
                                            <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{viewingOwner.totalUnits} Units</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {viewingOwner.properties.map((prop, i) => (
                                                <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm">
                                                    <Building2 size={12} className="text-slate-400" />
                                                    {prop}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <Button variant="secondary" onClick={() => setViewingOwner(null)}>
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
