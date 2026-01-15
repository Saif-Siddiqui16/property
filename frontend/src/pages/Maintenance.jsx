import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/Button';
import {
    Search,
    Plus,
    Filter,
    Calendar,
    Building,
    User,
    CheckCircle2,
    Clock,
    AlertCircle,
    MoreVertical,
    Wrench,
    X,
    ClipboardList,
    TrendingUp,
    TrendingDown,
    Activity,
    ChevronDown
} from 'lucide-react';
import clsx from 'clsx';
import api from '../api/client';

const statusStyles = {
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    Upcoming: 'bg-amber-50 text-amber-700 border-amber-100',
    Overdue: 'bg-red-50 text-red-700 border-red-100',
};

const statusIcons = {
    Completed: <CheckCircle2 size={14} className="text-emerald-500" />,
    Upcoming: <Clock size={14} className="text-amber-500" />,
    Overdue: <AlertCircle size={14} className="text-red-500" />,
};

export const Maintenance = () => {
    const [tasks, setTasks] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [search, setSearch] = useState('');
    const [filterBuildingId, setFilterBuildingId] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    useEffect(() => {
        fetchTasks();
        fetchBuildings();
    }, [filterBuildingId]);

    const fetchTasks = async () => {
        try {
            const res = await api.get(`/admin/maintenance?propertyId=${filterBuildingId}`);
            setTasks(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchBuildings = async () => {
        try {
            const res = await api.get('/admin/properties');
            setBuildings(res.data);
        } catch (e) { console.error(e); }
    };

    const stats = {
        total: tasks.length,
        upcoming: tasks.filter(t => t.status === 'Upcoming').length,
        overdue: tasks.filter(t => t.status === 'Overdue').length,
        completed: tasks.filter(t => t.status === 'Completed').length,
    };

    const filteredTasks = tasks.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.building.toLowerCase().includes(search.toLowerCase()) ||
        t.vendor.toLowerCase().includes(search.toLowerCase())
    );

    const handleMarkCompleted = async (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        try {
            await api.put(`/admin/maintenance/${task.dbId}`, { status: 'Completed' });
            fetchTasks();
        } catch (e) { alert('Failed'); }
    };

    const handleSaveTask = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        try {
            const payload = {
                name: formData.get('name'),
                buildingId: formData.get('buildingId'),
                type: formData.get('type'),
                frequency: formData.get('frequency'),
                dueDate: formData.get('dueDate'),
                vendor: formData.get('vendor'),
                status: formData.get('status') || 'Upcoming',
                notes: formData.get('notes'),
            };

            if (editingTask) {
                await api.put(`/admin/maintenance/${editingTask.dbId}`, payload);
            } else {
                await api.post('/admin/maintenance', payload);
            }
            fetchTasks();
            setShowAddModal(false);
            setEditingTask(null);
        } catch (e) {
            alert('Failed to save task');
        }
    };

    return (
        <MainLayout title="Maintenance Management">
            <div className="flex flex-col gap-6">

                {/* STATS */}
                <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard label="Total Tasks" value={stats.total} icon={ClipboardList} color="indigo" />
                    <StatCard label="Upcoming" value={stats.upcoming} icon={Clock} color="amber" />
                    <StatCard label="Overdue" value={stats.overdue} icon={AlertCircle} color="red" />
                    <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} color="emerald" />
                </section>

                {/* TOP BAR */}
                <section className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 gap-4">
                    <div className="flex items-center gap-4 flex-1 w-full">
                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all w-full md:w-auto md:min-w-[320px]">
                            <Search size={18} className="text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search tasks, buildings, or vendors..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 w-full text-sm font-medium"
                            />
                        </div>

                        <div className="relative min-w-[200px]">
                            <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select
                                value={filterBuildingId}
                                onChange={(e) => setFilterBuildingId(e.target.value)}
                                className="w-full pl-12 pr-10 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 bg-slate-50 text-sm font-medium appearance-none"
                            >
                                <option value="all">All Buildings</option>
                                {buildings.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm">
                            <Filter size={16} />
                            Filters
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
                            <Plus size={16} />
                            Add Task
                        </Button>
                    </div>
                </section>

                {/* TASKS TABLE */}
                <section className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_0.8fr_0.5fr] bg-slate-50 border-b border-slate-200 px-6 py-4">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Task Details</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Building</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Frequency</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Next Due Date</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Vendor</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</span>
                    </div>

                    <div className="divide-y divide-slate-100 text-sm">
                        {filteredTasks.map((task) => (
                            <div key={task.id} className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_0.8fr_0.5fr] px-6 py-4 items-center hover:bg-slate-50/50 transition-colors">
                                <div className="flex flex-col">
                                    <span className="font-bold text-indigo-600 mb-0.5">{task.id}</span>
                                    <span className="font-semibold text-slate-700">{task.name}</span>
                                    <span className="text-xs text-slate-400 line-clamp-1">{task.notes}</span>
                                </div>

                                <span className="flex items-center gap-2 text-slate-600 font-medium">
                                    <Building size={14} className="text-slate-400" />
                                    {task.building}
                                </span>

                                <span className="text-slate-600 font-medium">{task.frequency}</span>

                                <span className="flex items-center gap-2 text-slate-600 font-medium">
                                    <Calendar size={14} className="text-slate-400" />
                                    {task.dueDate}
                                </span>

                                <span className="flex items-center gap-2 text-slate-600 font-medium truncate">
                                    <User size={14} className="text-slate-400" />
                                    {task.vendor}
                                </span>

                                <div>
                                    <span className={clsx("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border w-fit", statusStyles[task.status])}>
                                        {statusIcons[task.status]}
                                        {task.status}
                                    </span>
                                </div>

                                <div className="flex justify-end gap-2 text-slate-400">
                                    {task.status !== 'Completed' && (
                                        <button
                                            onClick={() => handleMarkCompleted(task.id)}
                                            className="p-2 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors"
                                            title="Mark as Completed"
                                        >
                                            <CheckCircle2 size={16} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            setEditingTask(task);
                                            setShowAddModal(true);
                                        }}
                                        className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                                        title="Edit Task"
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {(showAddModal || editingTask) && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-slate-800">
                                {editingTask ? 'Edit Maintenance Task' : 'Add New Maintenance Task'}
                            </h3>
                            <button onClick={() => { setShowAddModal(false); setEditingTask(null); }} className="text-slate-400 hover:text-slate-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveTask} className="p-8 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Task Name</label>
                                    <input name="name" required defaultValue={editingTask?.name} className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-medium" placeholder="e.g. Elevator Inspection" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Building</label>
                                    <select name="buildingId" required defaultValue={editingTask?.buildingId} className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-medium bg-white">
                                        <option value="">Select Building</option>
                                        {buildings.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Task Type</label>
                                    <input name="type" required defaultValue={editingTask?.type} className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-medium" placeholder="e.g. HVAC, Fire, etc." />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Frequency</label>
                                    <select name="frequency" required defaultValue={editingTask?.frequency} className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-medium bg-white">
                                        <option value="One-time">One-time</option>
                                        <option value="Monthly">Monthly</option>
                                        <option value="Yearly">Yearly</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Next Due Date</label>
                                    <input name="dueDate" type="date" required defaultValue={editingTask?.dueDate} className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-medium" />
                                </div>
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vendor Name</label>
                                    <input name="vendor" defaultValue={editingTask?.vendor} className="w-full h-11 px-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-medium" placeholder="Contractor or Service Provider" />
                                </div>
                                <div className="space-y-1.5 col-span-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Notes</label>
                                    <textarea name="notes" defaultValue={editingTask?.notes} className="w-full h-24 p-4 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-medium resize-none text-sm" placeholder="Any specific details..." />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-slate-50 mt-4">
                                <Button type="button" variant="secondary" className="flex-1" onClick={() => { setShowAddModal(false); setEditingTask(null); }}>Cancel</Button>
                                <Button type="submit" variant="primary" className="flex-1">Save Task</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

const StatCard = ({ label, value, icon: Icon, color }) => {
    const colorStyles = {
        indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
        amber: 'text-amber-600 bg-amber-50 border-amber-100',
        red: 'text-red-600 bg-red-50 border-red-100',
        emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-800 tracking-tight">{value}</span>
                </div>
            </div>
            <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center border", colorStyles[color])}>
                <Icon size={28} />
            </div>
        </div>
    );
};
