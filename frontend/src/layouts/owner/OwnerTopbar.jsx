import React from 'react';
import { User, Bell, Search, Settings } from 'lucide-react';

export const OwnerTopbar = ({ title }) => {
    return (
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex flex-col">
                <h2 className="text-xl font-black text-slate-800 tracking-tight italic uppercase">{title}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Live Portfolio View</span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Search Placeholder */}
                <div className="hidden lg:flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl text-slate-400 focus-within:bg-white focus-within:border-indigo-200 transition-all w-64 group">
                    <Search size={16} className="group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search portfolio..."
                        className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 w-full placeholder:text-slate-300"
                        disabled
                    />
                </div>

                <div className="flex items-center gap-4 border-l border-slate-100 pl-6">
                    <button className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all relative">
                        <Bell size={20} />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                    </button>

                    <div className="flex items-center gap-3 pl-2 group cursor-default">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-black text-slate-800 italic">Owner Demo</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID: owner_demo_1</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-slate-200">
                            OD
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
