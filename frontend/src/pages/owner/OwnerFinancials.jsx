import React from 'react';
import { OwnerLayout } from '../../layouts/owner/OwnerLayout';
import {
    Download,
    CircleDollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Clock,
    CheckCircle2,
    FileText
} from 'lucide-react';
import { Button } from '../../components/Button';
import api from '../../api/client';

export const OwnerFinancials = () => {
    const [financialStats, setFinancialStats] = React.useState([
        { label: 'Rent Collected (MTD)', value: '$ 0', icon: CircleDollarSign, color: 'text-emerald-600', trend: '...', trendUp: true },
        { label: 'Service Fees (MTD)', value: '$ 0', icon: CircleDollarSign, color: 'text-indigo-600', trend: '...', trendUp: true },
        { label: 'Outstanding Dues', value: '$ 0', icon: Clock, color: 'text-rose-600', trend: '...', trendUp: true },
        { label: 'Net Earnings (MTD)', value: '$ 0', icon: CheckCircle2, color: 'text-violet-600', trend: '...', trendUp: true },
    ]);
    const [transactions, setTransactions] = React.useState([]);

    React.useEffect(() => {
        const fetchFin = async () => {
            try {
                const res = await api.get('/owner/financials');
                const { collected, transactions: txns } = res.data;

                setFinancialStats([
                    { label: 'Rent Collected (MTD)', value: `$ ${collected.toLocaleString('en-CA')}`, icon: CircleDollarSign, color: 'text-emerald-600', trend: '+4.2%', trendUp: true },
                    { label: 'Service Fees (MTD)', value: '$ 0', icon: CircleDollarSign, color: 'text-indigo-600', trend: '+1.5%', trendUp: true },
                    { label: 'Outstanding Dues', value: '$ 0', icon: Clock, color: 'text-rose-600', trend: 'Unknown', trendUp: true },
                    { label: 'Net Earnings (MTD)', value: `$ ${collected.toLocaleString('en-CA')}`, icon: CheckCircle2, color: 'text-violet-600', trend: '+3.8%', trendUp: true },
                ]);
                setTransactions(txns);
            } catch (e) {
                console.error(e);
            }
        };
        fetchFin();
    }, []);

    return (
        <OwnerLayout title="Financial Summary">
            <div className="space-y-8 pb-12">
                {/* Header Action */}
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight italic uppercase">Revenue Streams</h3>
                        <p className="text-slate-500 font-medium mt-1">Real-time tracking of your portfolio's financial health.</p>
                    </div>
                    <Button variant="secondary" className="gap-2 h-12 rounded-2xl font-black text-xs uppercase tracking-widest border-2">
                        <Download size={18} />
                        Download YTD Statement
                    </Button>
                </div>

                {/* Financial KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {financialStats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm border-b-4 border-b-slate-50 hover:border-b-indigo-500 transition-all duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-10 h-10 rounded-xl bg-slate-50 ${stat.color} flex items-center justify-center`}>
                                    <stat.icon size={20} />
                                </div>
                                <div className={`flex items-center gap-0.5 text-[10px] font-black ${stat.trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {stat.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {stat.trend}
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h4 className="text-xl font-black text-slate-800 tracking-tight italic">{stat.value}</h4>
                        </div>
                    ))}
                </div>

                {/* Recent Transactions Table */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                        <div className="flex items-center gap-3">
                            <h4 className="text-lg font-black text-slate-800 tracking-tight italic uppercase">Ledger Activity</h4>
                            <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-widest border border-indigo-100 italic">January 2026</span>
                        </div>
                        <div className="flex items-center gap-4 bg-white border border-slate-100 px-4 py-2 rounded-xl text-slate-400 w-64 group">
                            <Search size={14} className="group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search ledger..."
                                className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-600 w-full placeholder:text-slate-300"
                                disabled
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Property</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {transactions.map((txn, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5 text-xs font-mono font-bold text-indigo-600">{txn.id}</td>
                                        <td className="px-8 py-5 text-sm font-black text-slate-700 italic">{txn.property}</td>
                                        <td className="px-8 py-5 text-xs font-bold text-slate-400">{txn.date}</td>
                                        <td className="px-8 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">{txn.type}</td>
                                        <td className="px-8 py-5 text-sm font-black text-slate-800 text-right italic font-mono">${txn.amount.toLocaleString('en-CA')}</td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${txn.status === 'Paid'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                                                }`}>
                                                {txn.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <button className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                                                <FileText size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-6 bg-slate-50/30 border-t border-slate-50 flex justify-center">
                        <button className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-[0.2em] transition-all">Load Historical Archives</button>
                    </div>
                </div>
            </div>
        </OwnerLayout>
    );
};
