import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    CircleDollarSign,
    BarChart3,
    LogOut,
    ShieldCheck,
    MessageSquare // Added
} from 'lucide-react';
import clsx from 'clsx';

export const OwnerSidebar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('isOwnerLoggedIn');
        localStorage.removeItem('ownerId');
        navigate('/owner/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/owner/dashboard' },
        { icon: Building2, label: 'Properties', path: '/owner/properties' },
        { icon: CircleDollarSign, label: 'Financials', path: '/owner/financials' },
        { icon: BarChart3, label: 'Reports', path: '/owner/reports' },
        { icon: MessageSquare, label: 'Messages', path: '/owner/communication' }, // Added
    ];

    return (
        <aside className="w-72 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 shrink-0">
            {/* Logo Section */}
            <div className="p-8 pb-10">
                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/owner/dashboard')}>
                    <img src="/assets/logo.png" alt="Masteko Logo" className="h-10 w-auto object-container" />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                <div className="px-4 mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Menu</p>
                </div>
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => clsx(
                            "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 group",
                            isActive
                                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-100"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                        )}
                    >
                        <item.icon size={20} className={clsx(
                            "transition-transform duration-300 group-hover:scale-110",
                            "isActive" ? "text-white" : "text-slate-400 group-hover:text-indigo-600"
                        )} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="p-6 space-y-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center border-2 border-white shadow-sm">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Mode</p>
                            <p className="text-xs font-black text-slate-700 italic">Read-Only</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all duration-300 group"
                >
                    <LogOut size={20} className="transition-transform group-hover:-translate-x-1" />
                    Secure Logout
                </button>
            </div>
        </aside>
    );
};
