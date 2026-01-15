import React, { useState, useEffect, useRef } from 'react';
import { TenantLayout } from '../../layouts/TenantLayout';
import { ShieldCheck, AlertTriangle, Calendar, Info, Eye, X, FileText, Upload } from 'lucide-react';
import { Button } from '../../components/Button';
import api from '../../api/client';

export const TenantInsurance = () => {
    const [insurance, setInsurance] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);

    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        provider: '',
        policyNumber: '',
        startDate: '',
        endDate: ''
    });
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const fetchInsurance = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/tenant/insurance');
            setInsurance(res.data);
            if (res.data) {
                setFormData({
                    provider: res.data.provider,
                    policyNumber: res.data.policyNumber,
                    startDate: res.data.startDate,
                    endDate: res.data.endDate
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInsurance();
    }, []);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('provider', formData.provider);
        data.append('policyNumber', formData.policyNumber);
        data.append('startDate', formData.startDate);
        data.append('endDate', formData.endDate);
        if (selectedFile) {
            data.append('file', selectedFile);
        }

        try {
            setIsUploading(true);
            await api.post('/tenant/insurance', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowUploadModal(false);
            fetchInsurance();
        } catch (error) {
            console.error(error);
            alert('Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) return <div className="p-10 text-center">Loading insurance details...</div>;

    const isExpired = insurance?.status === 'EXPIRED';
    const isExpiringSoon = insurance?.status === 'EXPIRING_SOON';
    const statusColor = isExpired ? 'red' : isExpiringSoon ? 'amber' : 'emerald';

    return (
        <TenantLayout title="Insurance">
            <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* STATUS ALERT */}
                {(isExpired || isExpiringSoon) && (
                    <div className={`bg-${statusColor}-50 border border-${statusColor}-100 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-center justify-between shadow-sm`}>
                        <div className="flex gap-5 items-start">
                            <div className={`w-12 h-12 bg-${statusColor}-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-${statusColor}-100`}>
                                <AlertTriangle size={24} />
                            </div>
                            <div className="space-y-1">
                                <h3 className={`text-lg font-black text-${statusColor}-900 leading-tight`}>
                                    Action Required: Policy {isExpired ? 'Expired' : 'Expiring Soon'}
                                </h3>
                                <p className={`text-${statusColor}-700/80 font-medium text-sm leading-relaxed`}>
                                    Your policy # {insurance.policyNumber} {isExpired ? 'expired' : 'expires soon'}.
                                    Please upload a renewed certificate to maintain compliance.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* POLICY CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {insurance ? (
                        <section className={`bg-white rounded-3xl border-2 border-${statusColor}-500 p-8 shadow-xl shadow-${statusColor}-50 relative overflow-hidden`}>
                            <div className={`absolute top-0 right-0 bg-${statusColor}-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl`}>
                                {insurance.status.replace('_', ' ')}
                            </div>

                            <div className="flex items-center gap-4 mb-8">
                                <div className={`w-14 h-14 rounded-2xl bg-${statusColor}-50 text-${statusColor}-600 flex items-center justify-center border border-${statusColor}-100 italic font-black text-xl text-center`}>
                                    {insurance.provider.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="text-lg font-black text-slate-800">{insurance.provider}</h3>
                                    <p className="text-sm font-bold text-slate-400">Policy # {insurance.policyNumber}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <Calendar size={18} className="text-slate-400" />
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Expires On</span>
                                    </div>
                                    <span className={`text-sm font-black text-${statusColor}-600`}>
                                        {new Date(insurance.endDate).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className={`flex items-center gap-2.5 text-${statusColor}-600 bg-${statusColor}-50 p-4 rounded-2xl border border-${statusColor}-100`}>
                                    {insurance.status === 'ACTIVE' ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
                                    <span className="text-sm font-black uppercase tracking-tight">
                                        {insurance.status === 'ACTIVE' ? 'Compliant' : 'Non-Compliant'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <button
                                    onClick={() => setShowPreview(true)}
                                    disabled={!insurance.documentUrl}
                                    className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm disabled:opacity-50"
                                >
                                    <Eye size={18} />
                                    View Policy
                                </button>
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    className="py-3.5 rounded-2xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-all text-sm shadow-lg shadow-primary-50"
                                >
                                    Upload New
                                </button>
                            </div>
                        </section>
                    ) : (
                        <section className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                                <ShieldCheck size={32} />
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-bold text-slate-500 text-lg">No Active Policy</h4>
                                <p className="text-sm text-slate-400 font-medium px-4">
                                    Please upload your insurance certificate to comply with your lease agreement.
                                </p>
                            </div>
                            <Button onClick={() => setShowUploadModal(true)}>Upload Policy</Button>
                        </section>
                    )}

                    <section className="bg-slate-50 rounded-3xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center space-y-6 border-dashed">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm">
                            <ShieldCheck size={32} />
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-500 text-lg">Switch Provider</h4>
                            <p className="text-sm text-slate-400 font-medium px-4">
                                Switching to a new insurance company? Upload the new policy here.
                            </p>
                        </div>
                        <button className="px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm hover:border-primary-300 hover:text-primary-600 transition-all shadow-sm">
                            Compare Quotes
                        </button>
                    </section>
                </div>

                {/* HELP CARD */}
                <section className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shrink-0">
                        <Info size={36} />
                    </div>
                    <div className="space-y-2 flex-1">
                        <h3 className="text-xl font-black text-slate-800">Why do I need Insurance?</h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                            Tenant insurance protects your personal belongings and provides liability coverage if someone is injured in your unit. Most lease agreements require a minimum of $1M liability coverage.
                        </p>
                    </div>
                </section>
            </div>

            {/* UPLOAD MODAL */}
            {
                showUploadModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Upload Policy</h3>
                                <button onClick={() => setShowUploadModal(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleUpload} className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Insurance Provider</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.provider}
                                        onChange={e => setFormData({ ...formData, provider: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary-500 font-medium"
                                        placeholder="e.g. State Farm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Policy Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.policyNumber}
                                        onChange={e => setFormData({ ...formData, policyNumber: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary-500 font-medium"
                                        placeholder="e.g. SF-12345"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.startDate.substring(0, 10)}
                                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary-500 font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">End Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.endDate.substring(0, 10)}
                                            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-primary-500 font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Policy Document (PDF/Image)</label>
                                    <div
                                        onClick={() => fileInputRef.current.click()}
                                        className="w-full p-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center gap-2 cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all"
                                    >
                                        <Upload size={24} className="text-slate-400" />
                                        <p className="text-sm font-bold text-slate-500">{selectedFile ? selectedFile.name : 'Select Certificate'}</p>
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept=".pdf,image/*" />
                                </div>
                                <Button className="w-full h-12 mt-4" disabled={isUploading}>
                                    {isUploading ? 'Uploading...' : 'Save Policy Details'}
                                </Button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* DOCUMENT PREVIEW MODAL */}
            {
                showPreview && insurance?.documentUrl && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                        <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText className="text-primary" size={24} />
                                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Policy Document</h3>
                                </div>
                                <button onClick={() => setShowPreview(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-12 h-[60vh] bg-slate-100 flex items-center justify-center">
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm text-slate-300">
                                        <FileText size={40} />
                                    </div>
                                    <p className="text-slate-400 font-bold">PDF Preview available for download</p>
                                    <a
                                        href={`${api.defaults.baseURL.replace('/api', '')}${insurance.documentUrl}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-block"
                                    >
                                        <Button variant="primary">Download Actual PDF</Button>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </TenantLayout >
    );
};
