import React from 'react';
import { OwnerLayout } from '../../layouts/owner/OwnerLayout';
import {
    Building2,
    Users,
    TrendingUp,
    CircleDollarSign,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle2
} from 'lucide-react';
import api from '../../api/client';

export const OwnerDashboard = () => {
    const [stats, setStats] = React.useState([]);
    const [recentFinancials, setRecentFinancials] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [insuranceExpiryCount, setInsuranceExpiryCount] = React.useState(0);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, finRes] = await Promise.all([
                    api.get('/owner/dashboard/stats'),
                    api.get('/owner/dashboard/financial-pulse')
                ]);

                const data = statsRes.data;
                const financials = finRes.data;

                // 1. Map Stats
                setStats([
                    {
                        label: 'Total Properties',
                        value: data.propertyCount.toString(),
                        icon: Building2,
                        color: 'text-indigo-600',
                        bg: 'bg-indigo-50',
                        trend: 'Active Portfolio',
                        trendUp: true
                    },
                    {
                        label: 'Total Units',
                        value: data.unitCount.toString(),
                        icon: Building2,
                        color: 'text-blue-600',
                        bg: 'bg-blue-50',
                        trend: 'Across locations',
                        trendUp: null
                    },
                    {
                        label: 'Occupancy Rate',
                        value: `${data.unitCount > 0 ? Math.round((data.occupancy.occupied / data.unitCount) * 100) : 0}%`,
                        icon: Users,
                        color: 'text-emerald-600',
                        bg: 'bg-emerald-50',
                        trend: 'Current status',
                        trendUp: true
                    },
                    {
                        label: 'Monthly Revenue',
                        value: `$ ${data.monthlyRevenue ? data.monthlyRevenue.toLocaleString('en-CA') : '0'}`,
                        icon: CircleDollarSign,
                        color: 'text-violet-600',
                        bg: 'bg-violet-50',
                        trend: 'Collected this month',
                        trendUp: true
                    },
                    {
                        label: 'Outstanding Dues',
                        value: `$ ${data.outstandingDues ? data.outstandingDues.toLocaleString('en-CA') : '0'}`,
                        icon: AlertCircle,
                        color: 'text-rose-600',
                        bg: 'bg-rose-50',
                        trend: 'Pending collection',
                        trendUp: false
                    },
                ]);

                setInsuranceExpiryCount(data.insuranceExpiryCount || 0);

                // 2. Map Financial Pulse
                setRecentFinancials(financials);

            } catch (error) {
                console.error("Failed to fetch owner dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <OwnerLayout title="Portfolio Overview">
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </OwnerLayout>
        );
    }

    return (
        <OwnerLayout title="Portfolio Overview">
            <div className="space-y-8 pb-12">
                {/* Welcome Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight italic">Welcome back, Owner.</h3>
                        <p className="text-slate-500 font-medium mt-1">Here is the update on your property portfolio performance.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Portfolio Value Index</p>
                        <div className="flex items-center gap-2 text-emerald-600 font-black text-xl italic drop-shadow-sm">
                            <TrendingUp size={24} />
                            +12.4% <span className="text-slate-400 text-sm font-bold not-italic font-sans underline decoration-emerald-200">YoY</span>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm shadow-slate-200/50 hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative">
                            <div className="relative z-10 flex flex-col h-full">
                                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-500`}>
                                    <stat.icon size={24} />
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                                <h4 className="text-2xl font-black text-slate-800 tracking-tight italic mb-2 leading-none">{stat.value}</h4>
                                <div className="mt-auto pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-1">
                                        {stat.trendUp === true && <ArrowUpRight size={14} className="text-emerald-500" />}
                                        {stat.trendUp === false && <ArrowDownRight size={14} className="text-rose-500" />}
                                        <span className={`text-[10px] font-bold ${stat.trendUp === true ? 'text-emerald-600' : stat.trendUp === false ? 'text-rose-600' : 'text-slate-500'}`}>
                                            {stat.trend}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative Background Icon */}
                            <stat.icon size={120} className={`absolute -right-8 -bottom-8 opacity-[0.03] ${stat.color} group-hover:scale-110 transition-transform duration-700`} />
                        </div>
                    ))}
                </div>

                {/* Secondary Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Financial Pulse */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <h4 className="text-xl font-black text-slate-800 tracking-tight italic uppercase">Recent Financial Pulse</h4>
                            <button className="text-xs font-black text-indigo-600 hover:underline decoration-2">View Full Financials</button>
                        </div>
                        <div className="overflow-hidden bg-slate-50 rounded-2xl border border-slate-100">
                            <table className="w-full text-left">
                                <thead className="bg-slate-100/50">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Month</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Target</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actual Collected</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Remaining Dues</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentFinancials.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-white transition-colors group">
                                            <td className="px-6 py-4 text-xs font-black text-slate-700 italic">{row.month}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-slate-400 text-right font-mono">${row.expected.toLocaleString('en-CA')}</td>
                                            <td className="px-6 py-4 text-sm font-black text-slate-800 text-right font-mono italic">${row.collected.toLocaleString('en-CA')}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${row.dues > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                    {row.dues > 0 ? `$${row.dues.toLocaleString('en-CA')}` : 'CLEAR'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Access / Notice */}
                    {insuranceExpiryCount > 0 ? (
                        <div className="bg-indigo-600 rounded-3xl p-8 flex flex-col justify-between text-white shadow-2xl shadow-indigo-200 overflow-hidden relative group">
                            <div className="relative z-10 space-y-6">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                    <AlertCircle size={24} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black italic tracking-tight uppercase">Compliance Notice</h4>
                                    <p className="text-indigo-100 text-sm font-medium leading-relaxed">
                                        {insuranceExpiryCount} properties have insurance policies expiring within the next 30 days. Please review the Insurance Alerts.
                                    </p>
                                </div>
                                <button className="w-full bg-white text-indigo-600 h-14 rounded-2xl font-black text-sm shadow-xl hover:bg-slate-50 transition-colors uppercase tracking-widest">
                                    Acknowledge & Archive
                                </button>
                            </div>
                            {/* Background SVG Decor */}
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                        </div>
                    ) : (
                        <div className="bg-emerald-600 rounded-3xl p-8 flex flex-col justify-between text-white shadow-2xl shadow-emerald-200 overflow-hidden relative group">
                            <div className="relative z-10 space-y-6">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black italic tracking-tight uppercase">All Good!</h4>
                                    <p className="text-emerald-100 text-sm font-medium leading-relaxed">
                                        Your portfolio is fully compliant. No actions needed at this time.
                                    </p>
                                </div>
                            </div>
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                        </div>
                    )}
                </div>
            </div>
        </OwnerLayout>
    );
};
