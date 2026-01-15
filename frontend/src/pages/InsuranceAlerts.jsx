import { useState, useMemo, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import {
    ShieldAlert,
    ShieldCheck,
    Clock,
    Search,
    Filter,
    Eye,
    ArrowRight,
    X,
    FileText,
    AlertTriangle,
    ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

const TODAY = new Date(); // Use real time

export const InsuranceAlerts = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [propertyFilter, setPropertyFilter] = useState('All');
    const [viewPolicy, setViewPolicy] = useState(null);
    const [insuranceData, setInsuranceData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/admin/insurance/alerts');
                setInsuranceData(res.data);
            } catch (e) { console.error(e); }
        };
        fetchData();
    }, []);

    // Status Logic
    const getPolicyStatus = (endDate) => {
        const end = new Date(endDate);
        const diffTime = end - TODAY;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: 'Expired', color: 'red', days: diffDays };
        if (diffDays <= 30) return { label: 'Expiring Soon', color: 'amber', days: diffDays };
        return { label: 'Active', color: 'emerald', days: diffDays };
    };

    const processedData = useMemo(() => {
        return insuranceData.map(item => ({
            ...item,
            status: getPolicyStatus(item.endDate)
        }));
    }, [insuranceData]);

    // Summary Counts
    const expiredCount = processedData.filter(p => p.status.label === 'Expired').length;
    const expiringSoonCount = processedData.filter(p => p.status.label === 'Expiring Soon').length;
    const compliantCount = processedData.filter(p => p.status.label === 'Active').length;

    // Filtered Data
    const filteredData = processedData.filter(item => {
        const matchesSearch = item.tenantName.toLowerCase().includes(search.toLowerCase()) ||
            item.policyNumber.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All' || item.status.label === statusFilter;
        const matchesProperty = propertyFilter === 'All' || item.property === propertyFilter;
        return matchesSearch && matchesStatus && matchesProperty;
    });

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('All');
        setPropertyFilter('All');
    };

    return (
        <MainLayout title="Insurance Alerts">
            <div className="flex flex-col gap-8 pb-10">

                {/* HEADER SECTION */}
                <div className="space-y-1">
                    <p className="text-slate-500 font-medium">Monitor tenant insurance expiry and compliance status across all portfolio properties.</p>
                </div>

                {/* SUMMARY CARDS */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card
                        className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 border-b-4 ${statusFilter === 'Expired' ? 'border-red-500 shadow-lg' : 'border-transparent shadow-sm bg-white'}`}
                        onClick={() => setStatusFilter('Expired')}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                                <ShieldAlert size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{expiredCount}</h3>
                                <p className="text-sm font-bold text-red-600 uppercase tracking-wider">Expired Policies</p>
                            </div>
                        </div>
                    </Card>

                    <Card
                        className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 border-b-4 ${statusFilter === 'Expiring Soon' ? 'border-amber-500 shadow-lg' : 'border-transparent shadow-sm bg-white'}`}
                        onClick={() => setStatusFilter('Expiring Soon')}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                                <Clock size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{expiringSoonCount}</h3>
                                <p className="text-sm font-bold text-amber-600 uppercase tracking-wider">Expiring Soon</p>
                            </div>
                        </div>
                    </Card>

                    <Card
                        className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 border-b-4 ${statusFilter === 'Active' ? 'border-emerald-500 shadow-lg' : 'border-transparent shadow-sm bg-white'}`}
                        onClick={() => setStatusFilter('Active')}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                <ShieldCheck size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">{compliantCount}</h3>
                                <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Compliant Policies</p>
                            </div>
                        </div>
                    </Card>
                </section>

                {/* FILTERS */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[240px] relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search tenant or policy #..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 transition-all text-sm font-medium"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary-500 text-sm font-medium bg-white"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Expiring Soon">Expiring Soon</option>
                        <option value="Expired">Expired</option>
                    </select>

                    <select
                        value={propertyFilter}
                        onChange={(e) => setPropertyFilter(e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-primary-500 text-sm font-medium bg-white"
                    >
                        <option value="All">All Properties</option>
                        <option value="Building A">Building A</option>
                        <option value="Building B">Building B</option>
                        <option value="Building C">Building C</option>
                    </select>

                    {(search || statusFilter !== 'All' || propertyFilter !== 'All') && (
                        <button
                            onClick={clearFilters}
                            className="text-sm font-bold text-slate-400 hover:text-danger transition-colors flex items-center gap-1 px-2"
                        >
                            <X size={16} />
                            Clear
                        </button>
                    )}
                </section>

                {/* TABLE */}
                <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="p-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tenant Name</th>
                                    <th className="p-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Property / Unit</th>
                                    <th className="p-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Provider</th>
                                    <th className="p-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Policy #</th>
                                    <th className="p-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Expiry Date</th>
                                    <th className="p-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Remaining</th>
                                    <th className="p-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="p-4 px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredData.length > 0 ? filteredData.map((item) => (
                                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors cursor-default">
                                        <td className="p-4 px-6">
                                            <button
                                                onClick={() => navigate('/tenants')}
                                                className="font-bold text-slate-800 hover:text-primary-600 transition-colors tracking-tight text-sm"
                                            >
                                                {item.tenantName}
                                            </button>
                                        </td>
                                        <td className="p-4 px-6 text-sm">
                                            <div className="font-bold text-slate-600">{item.property}</div>
                                            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Unit {item.unit}</div>
                                        </td>
                                        <td className="p-4 px-6 text-sm font-medium text-slate-500">{item.provider}</td>
                                        <td className="p-4 px-6 text-[12px] font-mono text-slate-400">{item.policyNumber}</td>
                                        <td className="p-4 px-6 text-center text-sm font-bold text-slate-600">
                                            {new Date(item.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 px-6 text-center">
                                            <span className={`text-[13px] font-black tabular-nums ${item.status.color === 'red' ? 'text-red-600' : item.status.color === 'amber' ? 'text-amber-600' : 'text-slate-400'}`}>
                                                {item.status.days < 0 ? `${Math.abs(item.status.days)}d ago` : `${item.status.days}d`}
                                            </span>
                                        </td>
                                        <td className="p-4 px-6 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${item.status.color === 'red' ? 'bg-red-50 text-red-600 border-red-100' :
                                                item.status.color === 'amber' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                }`}>
                                                {item.status.label}
                                            </span>
                                        </td>
                                        <td className="p-4 px-6 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => setViewPolicy(item)}
                                                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-white rounded-xl transition-all shadow-none hover:shadow-sm border border-transparent hover:border-slate-100"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => navigate('/tenants')}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all shadow-none hover:shadow-sm border border-transparent hover:border-slate-100"
                                                    title="Go to Tenant"
                                                >
                                                    <ExternalLink size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="8" className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-4 text-slate-300">
                                                <ShieldAlert size={64} className="opacity-20" />
                                                <p className="font-bold text-lg">No insurance policies found matching your criteria.</p>
                                                <Button variant="secondary" onClick={clearFilters}>Reset Filters</Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* VIEW DETAILS MODAL */}
                {viewPolicy && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300 p-4">
                        <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
                            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Policy Details</h3>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{viewPolicy.tenantName} — Unit {viewPolicy.unit}</p>
                                </div>
                                <button onClick={() => setViewPolicy(null)} className="p-2.5 bg-white border border-slate-100 text-slate-400 hover:text-slate-800 rounded-2xl transition-all hover:shadow-md">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-100">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${viewPolicy.status.color === 'red' ? 'bg-red-500 text-white' :
                                        viewPolicy.status.color === 'amber' ? 'bg-amber-500 text-white' :
                                            'bg-emerald-500 text-white'
                                        }`}>
                                        <ShieldAlert size={32} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Compliance Status</p>
                                        <p className="text-xl font-black text-slate-800 tracking-tight leading-none mt-1">{viewPolicy.status.label}</p>
                                        <p className={`text-xs font-bold mt-1 ${viewPolicy.status.color === 'red' ? 'text-red-500' : viewPolicy.status.color === 'amber' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                            {viewPolicy.status.days < 0 ? `Expired ${Math.abs(viewPolicy.status.days)} days ago` : `Expires in ${viewPolicy.status.days} days`}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-x-12 gap-y-6 px-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Provider</p>
                                        <p className="font-bold text-slate-700">{viewPolicy.provider}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Policy Number</p>
                                        <p className="font-mono font-bold text-slate-500 text-sm tracking-tighter">{viewPolicy.policyNumber}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</p>
                                        <p className="font-bold text-slate-700">{new Date(viewPolicy.startDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">End Date</p>
                                        <p className="font-bold text-slate-800">{new Date(viewPolicy.endDate).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col gap-3">
                                    <a
                                        href={viewPolicy.documentUrl ? `${api.defaults.baseURL.replace('/api', '')}${viewPolicy.documentUrl}` : '#'}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`flex items-center justify-between w-full p-5 rounded-3xl border-2 border-slate-100 hover:border-primary-200 hover:bg-primary-50 transition-all group ${!viewPolicy.documentUrl && 'pointer-events-none opacity-50'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary-600 group-hover:border-primary-100">
                                                <FileText size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-black text-slate-700 tracking-tight group-hover:text-primary-700 transition-colors">
                                                    {viewPolicy.documentUrl ? 'Certificate_of_Insurance.pdf' : 'No Document Attached'}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Uploaded on {viewPolicy.startDate}</p>
                                            </div>
                                        </div>
                                        <Eye size={20} className="text-slate-300 group-hover:text-primary-500 transition-colors" />
                                    </a>
                                </div>

                                <div className="pt-4 grid grid-cols-2 gap-4">
                                    <Button variant="secondary" onClick={() => setViewPolicy(null)} className="py-4">Close View</Button>
                                    <Button variant="primary" onClick={() => navigate('/tenants')} className="py-4">
                                        Manage Tenant
                                        <ArrowRight size={18} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </MainLayout>
    );
};
