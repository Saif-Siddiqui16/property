import React from 'react';
import { OwnerLayout } from '../../layouts/owner/OwnerLayout';
import {
    BarChart3,
    PieChart,
    Download,
    FileText,
    TrendingUp,
    Users,
    CircleDollarSign,
    ExternalLink
} from 'lucide-react';
import { Button } from '../../components/Button';

import api from '../../api/client';

export const OwnerReports = () => {
    const [availableReports, setAvailableReports] = React.useState([]);

    React.useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await api.get('/owner/reports');
                // Map backend type to icons/colors locally or expect backend to send them?
                // Backend sends basic info. Let's map icons here.
                const mapped = res.data.map(r => ({
                    ...r,
                    icon: r.type === 'monthly_summary' ? BarChart3 :
                        r.type === 'annual_overview' ? CircleDollarSign :
                            r.type === 'occupancy_stats' ? Users : FileText,
                    color: r.type === 'monthly_summary' ? 'text-indigo-600' :
                        r.type === 'annual_overview' ? 'text-emerald-600' :
                            r.type === 'occupancy_stats' ? 'text-blue-600' : 'text-violet-600',
                    bg: r.type === 'monthly_summary' ? 'bg-indigo-50' :
                        r.type === 'annual_overview' ? 'bg-emerald-50' :
                            r.type === 'occupancy_stats' ? 'bg-blue-50' : 'bg-violet-50',
                }));
                setAvailableReports(mapped);
            } catch (e) { console.error(e); }
        };
        fetchReports();
    }, []);

    const stats = [
        { label: 'Reports Viewable', value: '14 Total', sub: 'Last 12 months' },
        { label: 'Export Limit', value: 'Unlimited', sub: 'PDF / CSV Formats' },
        { label: 'Data Latency', value: 'Real-time', sub: 'Synced with Admin' },
    ];

    return (
        <OwnerLayout title="Performance Reports">
            <div className="space-y-8 pb-12">
                {/* Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase">Portfolio Analytics</h3>
                        <p className="text-slate-500 font-medium mt-1">Export-ready reports generated from managed property data.</p>
                    </div>
                </div>

                {/* Sub-Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((s, i) => (
                        <div key={i} className="bg-white px-8 py-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                            <p className="text-xl font-black text-slate-800 italic">{s.value}</p>
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter mt-1">{s.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Reports Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {availableReports.map((report, idx) => (
                        <div key={idx} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 group flex gap-8">
                            <div className={`w-20 h-20 shrink-0 rounded-[2rem] ${report.bg} ${report.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-inner`}>
                                <report.icon size={36} />
                            </div>
                            <div className="flex flex-col justify-between flex-1">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-xl font-black text-slate-800 tracking-tight italic uppercase group-hover:text-indigo-600 transition-colors leading-tight">{report.title}</h4>
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic group-hover:text-indigo-400 transition-colors">
                                            <TrendingUp size={12} />
                                            Active
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{report.description}</p>
                                </div>
                                <div className="flex items-center justify-between mt-8">
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Run: {report.lastGenerated}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100">
                                            <ExternalLink size={18} />
                                        </button>
                                        <Button
                                            variant="secondary"
                                            className="gap-2 h-11 px-6 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] border-2"
                                            onClick={async () => {
                                                try {
                                                    // Placeholder for report download - connecting to a potential endpoint
                                                    const res = await api.get(`/admin/reports/${report.id || idx}/download`, { responseType: 'blob' });
                                                    const url = window.URL.createObjectURL(new Blob([res.data]));
                                                    const link = document.createElement('a');
                                                    link.href = url;
                                                    link.setAttribute('download', `${report.title.toLowerCase().replace(/\s+/g, '_')}.pdf`);
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    link.remove();
                                                } catch (e) { alert('Report download failed'); }
                                            }}
                                        >
                                            <Download size={16} />
                                            Export
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Notice Card */}
                <div className="bg-slate-900 rounded-[2.5rem] p-10 flex items-center justify-between text-white overflow-hidden relative group">
                    <div className="relative z-10 space-y-4 max-w-xl">
                        <h4 className="text-2xl font-black italic tracking-tight uppercase">Custom Report Requests</h4>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                            Need a specific data extract or a consolidated tax statement not listed here? Contact your relationship manager directly from the Admin panel to request custom reporting modules.
                        </p>
                        <button className="h-12 px-8 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/20 active:scale-95">
                            Contact Admin Support
                        </button>
                    </div>
                    <PieChart size={240} className="absolute -right-20 -top-20 opacity-10 group-hover:scale-110 transition-transform duration-1000 rotate-12" />
                </div>
            </div>
        </OwnerLayout>
    );
};
