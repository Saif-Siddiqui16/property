import React from 'react';
import { TenantLayout } from '../../layouts/TenantLayout';
import { CreditCard, FileText, Wrench, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

const dashboardCards = [
    {
        title: 'Current Rent',
        value: '$1,200.00',
        subValue: 'Due in 5 days',
        icon: CreditCard,
        color: 'bg-blue-500',
        path: '/tenant/invoices'
    },
    {
        title: 'Lease Status',
        value: 'Active',
        subValue: 'Expires Dec 2026',
        icon: FileText,
        color: 'bg-emerald-500',
        path: '/tenant/lease'
    },
    {
        title: 'Maintenance',
        value: '2 Open',
        subValue: '1 In Progress',
        icon: Wrench,
        color: 'bg-amber-500',
        path: '/tenant/tickets'
    },
    {
        title: 'Insurance',
        value: 'Compliant',
        subValue: 'Expires in 45 days',
        icon: ShieldCheck,
        color: 'bg-purple-500',
        path: '/tenant/insurance'
    }
];

export const TenantDashboard = () => {
    const [name, setName] = React.useState('Tenant');
    const [dashboardCards, setDashboardCards] = React.useState([
        { title: 'Current Rent', value: 'Loading...', subValue: '-', icon: CreditCard, color: 'bg-blue-500', path: '/tenant/invoices' },
        { title: 'Lease Status', value: 'Loading...', subValue: '-', icon: FileText, color: 'bg-emerald-500', path: '/tenant/lease' },
        { title: 'Maintenance', value: '0 Open', subValue: '0 In Progress', icon: Wrench, color: 'bg-amber-500', path: '/tenant/tickets' },
        { title: 'Insurance', value: '...', subValue: '-', icon: ShieldCheck, color: 'bg-purple-500', path: '/tenant/insurance' }
    ]);

    React.useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get('/tenant/dashboard');
                const { tenantName, stats } = res.data;

                setName(tenantName || 'Tenant');
                setDashboardCards([
                    {
                        title: 'Current Rent',
                        value: `$${stats.currentRent.toLocaleString('en-CA')}`,
                        subValue: stats.rentDueStatus,
                        icon: CreditCard,
                        color: 'bg-blue-500',
                        path: '/tenant/invoices'
                    },
                    {
                        title: 'Lease Status',
                        value: stats.leaseStatus,
                        subValue: stats.leaseExpiry ? new Date(stats.leaseExpiry).toLocaleDateString() : 'N/A',
                        icon: FileText,
                        color: 'bg-emerald-500',
                        path: '/tenant/lease'
                    },
                    {
                        title: 'Maintenance',
                        value: `${stats.openTickets} Open`,
                        subValue: 'Check Tickets',
                        icon: Wrench,
                        color: 'bg-amber-500',
                        path: '/tenant/tickets'
                    },
                    {
                        title: 'Insurance',
                        value: stats.insuranceStatus,
                        subValue: 'Check Status',
                        icon: ShieldCheck,
                        color: 'bg-purple-500',
                        path: '/tenant/insurance'
                    }
                ]);
            } catch (e) {
                console.error(e);
            }
        };
        fetchDashboard();
    }, []);
    return (
        <TenantLayout title="Dashboard">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* INSURANCE ALERT BANNER */}
                <section className="bg-red-50 border border-red-100 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-center justify-between shadow-sm animate-in slide-in-from-top-4 duration-700">
                    <div className="flex gap-5 items-center">
                        <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-100">
                            <AlertCircle size={24} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-red-900 leading-tight">Action Required: Insurance Expired</h3>
                            <p className="text-red-700/80 font-medium text-sm">
                                Your insurance policy has expired. Please upload a renewed policy document immediately to remain compliant.
                            </p>
                        </div>
                    </div>
                    <Link to="/tenant/insurance" className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all shadow-md active:scale-95 whitespace-nowrap">
                        Upload Insurance
                    </Link>
                </section>

                {/* WELCOME BANNER */}
                <section className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
                    <div className="relative z-10 space-y-2">
                        <h2 className="text-3xl font-bold">Good morning, {name}! 👋</h2>
                        <p className="text-indigo-100 font-medium text-lg">Your next rent payment is due on Feb 1st, 2026.</p>
                        <div className="pt-4">
                            <Link to="/tenant/payments" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg hover:translate-y-[-2px] active:scale-95">
                                Pay Rent Now
                                <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                    {/* Abstract background shapes */}
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute bottom-[-20%] left-[-5%] w-48 h-48 bg-indigo-400 rounded-full blur-2xl opacity-30"></div>
                </section>

                {/* STAT CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {dashboardCards.map((card, idx) => (
                        <Link
                            key={idx}
                            to={card.path}
                            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group active:scale-[0.98]"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                                    <card.icon size={24} />
                                </div>
                                <ArrowRight size={18} className="text-slate-300 group-hover:text-primary transition-colors" />
                            </div>
                            <h4 className="text-slate-500 font-bold text-sm uppercase tracking-wider">{card.title}</h4>
                            <div className="mt-1 space-y-1">
                                <p className="text-2xl font-black text-slate-800 tracking-tight">{card.value}</p>
                                <p className="text-sm font-medium text-slate-400">{card.subValue}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ANNOUNCEMENTS */}
                    <section className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-fit">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-black text-slate-800 text-lg">Announcements</h3>
                            <span className="bg-indigo-50 text-indigo-600 py-1 px-3 rounded-full text-xs font-bold">New</span>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {[
                                { title: 'Elevator Maintenance', date: 'Jan 15', desc: 'Building A elevators will be undergoing maintenance from 10 AM to 2 PM.', type: 'Warning' },
                                { title: 'New Visitor Parking Rules', date: 'Jan 10', desc: 'Please register all visitor vehicles in the lobby kiosk starting Monday.', type: 'Info' },
                            ].map((item, idx) => (
                                <div key={idx} className="p-6 hover:bg-slate-50 transition-colors flex gap-5 items-start">
                                    <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.type === 'Warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                        <AlertCircle size={20} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-slate-800">{item.title}</h4>
                                            <span className="text-xs font-bold text-slate-400 uppercase">{item.date}</span>
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* RECENT TICKETS */}
                    <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden h-fit">
                        <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                            <h3 className="font-black text-slate-800 text-lg">Recent Tickets</h3>
                            <Link to="/tenant/tickets" className="text-xs font-bold text-primary hover:underline">View All</Link>
                        </div>
                        <div className="p-2 space-y-1">
                            {[
                                { id: 'T-1025', title: 'Leaking Sink', status: 'In Progress' },
                                { id: 'T-1024', title: 'AC Filter', status: 'Resolved' },
                            ].map((t, idx) => (
                                <div key={idx} className="p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.id}</p>
                                    <h4 className="font-bold text-slate-700">{t.title}</h4>
                                    <div className="mt-2 flex items-center gap-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'Resolved' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                        <span className={`text-[11px] font-bold uppercase tracking-tight ${t.status === 'Resolved' ? 'text-emerald-600' : 'text-amber-600'}`}>{t.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </TenantLayout>
    );
};
