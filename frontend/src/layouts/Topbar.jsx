import React, { useState } from 'react';
import { Bell, Search, Menu, LogOut, Building, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import clsx from 'clsx';

export const Topbar = ({ title = 'Overview', onMenuClick }) => {
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [activeOrg, setActiveOrg] = useState('Demo Owner A');
    const [showOrgDropdown, setShowOrgDropdown] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        navigate('/login');
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40 lg:px-4">
            {/* LEFT */}
            <div className="flex items-center gap-4">
                <button
                    className="block lg:hidden text-slate-600 p-2"
                    onClick={onMenuClick}
                >
                    <Menu size={24} />
                </button>

                <div className="flex items-center gap-6">
                    <h1 className="text-lg ml-5 font-semibold text-slate-800 tracking-[-0.01em] whitespace-nowrap">{title}</h1>

                    {/* Organization Selector */}
                    <div className="hidden md:flex items-center relative gap-2 pl-6 border-l border-slate-200">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                            <Building size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Organization</span>
                            <button
                                onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                                className="flex items-center gap-1.5 text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors"
                            >
                                {activeOrg}
                                <ChevronDown size={14} className={clsx("transition-transform", showOrgDropdown && "rotate-180")} />
                            </button>
                        </div>

                        {showOrgDropdown && (
                            <div className="absolute top-full left-6 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                {['Demo Owner A', 'Demo Owner B'].map(org => (
                                    <button
                                        key={org}
                                        onClick={() => { setActiveOrg(org); setShowOrgDropdown(false); }}
                                        className={clsx(
                                            "w-full text-left px-4 py-2 text-sm font-medium transition-colors",
                                            activeOrg === org ? "text-indigo-600 bg-indigo-50" : "text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        {org}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-4">
                {/* Search Bar - Hidden on mobile */}
                <div className="relative w-80 hidden lg:block">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search properties, tenants..."
                        className="w-full h-10 pl-10 pr-4 rounded-md border border-slate-200 text-sm bg-white text-slate-900 transition-all focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-50 placeholder:text-slate-400 hover:border-slate-300"
                    />
                </div>

                <div className="relative">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="relative text-slate-500 hover:bg-slate-100 hover:text-slate-700 w-10 h-10 flex items-center justify-center p-0 rounded-md"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell size={20} />
                        <span className="absolute top-[6px] right-[6px] w-2 h-2 bg-danger rounded-full border-2 border-white ring-0" />
                    </Button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest pl-2">2 New</span>
                            </div>
                            <div className="divide-y divide-slate-50 max-h-[320px] overflow-y-auto">
                                <div
                                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                                    onClick={() => { navigate('/tenants'); setShowNotifications(false); }}
                                >
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                            <Bell size={14} />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-medium text-slate-600 leading-relaxed">
                                                Tenant <span className="font-bold text-slate-900">ABC Pvt Ltd</span> insurance has <span className="text-red-600 font-bold">expired</span>.
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-medium">2 hours ago</p>
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                                    onClick={() => { navigate('/tenants'); setShowNotifications(false); }}
                                >
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                            <Bell size={14} />
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-medium text-slate-600 leading-relaxed">
                                                Tenant <span className="font-bold text-slate-900">John Smith</span> insurance expires in <span className="text-amber-600 font-bold">12 days</span>.
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-medium">5 hours ago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50/50 border-t border-slate-50 text-center">
                                <button className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">Mark all as read</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* LOGOUT BUTTON */}
                <button
                    className="flex items-center gap-[6px] h-10 px-3 rounded-md border border-slate-200 bg-white text-slate-600 text-sm cursor-pointer transition-all hover:bg-slate-100 hover:text-danger hover:border-slate-300"
                    onClick={handleLogout}
                    title="Logout"
                >
                    <LogOut size={18} />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </div>
        </header>
    );
};
