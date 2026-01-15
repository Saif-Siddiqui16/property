import React from 'react';
import { Menu, User, Bell } from 'lucide-react';

export const TenantTopbar = ({ title = 'Dashboard', onMenuClick }) => {
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40 lg:px-6">
            <div className="flex items-center gap-4">
                <button
                    className="block lg:hidden text-slate-600 p-2"
                    onClick={onMenuClick}
                >
                    <Menu size={24} />
                </button>
                <h1 className="text-lg font-bold text-slate-800">{title}</h1>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-bold text-slate-800">John Smith</span>
                    <span className="text-xs text-slate-500 font-medium">Building A – 301</span>
                </div>

                <div className="flex items-center gap-3">
                    <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-all">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200">
                        JS
                    </div>
                </div>
            </div>
        </header>
    );
};
