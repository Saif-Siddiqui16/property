import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/Card';

export const UnitDetail = () => {
    const { id } = useParams();
    const [unit, setUnit] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchUnitDetails();
    }, [id]);

    const fetchUnitDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/admin/units/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUnit(data);
            } else {
                console.error('Failed to fetch unit details');
            }
        } catch (error) {
            console.error('Error fetching unit:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !unit) {
        return (
            <MainLayout title="Unit Details - Loading...">
                <div className="flex flex-col gap-6">
                    {/* Top Info Section Skeleton */}
                    <section className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Card key={i} className="p-4 flex flex-col gap-2">
                                <div className="h-4 bg-slate-100 rounded animate-pulse w-24"></div>
                                <div className="h-6 bg-slate-100 rounded animate-pulse w-16"></div>
                            </Card>
                        ))}
                    </section>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title={`Unit ${unit.unitNumber}`}>
            <div className="flex flex-col gap-6">

                {/* Top Info Section */}
                <section className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4">
                    <Card className="p-4 flex flex-col gap-2">
                        <div className="text-xs text-slate-500 uppercase font-semibold">Unit Number</div>
                        <div className="text-lg font-bold text-slate-800">{unit.unitNumber}</div>
                    </Card>
                    <Card className="p-4 flex flex-col gap-2">
                        <div className="text-xs text-slate-500 uppercase font-semibold">Building</div>
                        <div className="text-lg font-bold text-slate-800">{unit.building}</div>
                    </Card>
                    <Card className="p-4 flex flex-col gap-2">
                        <div className="text-xs text-slate-500 uppercase font-semibold">Floor</div>
                        <div className="text-lg font-bold text-slate-800">{unit.floor || '-'}</div>
                    </Card>
                    <Card className="p-4 flex flex-col gap-2 border-l-4 border-l-indigo-500">
                        <div className="text-xs uppercase font-semibold text-indigo-600">Rental Mode</div>
                        <div className="text-lg font-bold text-slate-800">{unit.rentalMode}</div>
                    </Card>
                    <Card className="p-4 flex flex-col gap-2">
                        <div className="text-xs text-slate-500 uppercase font-semibold">Status</div>
                        <div className={`text-lg font-bold ${unit.status === 'Occupied' ? 'text-green-600' : 'text-slate-800'}`}>{unit.status}</div>
                    </Card>
                </section>

                {/* Actions Placeholder */}
                <section className="flex gap-4 items-center py-4 border-b border-dashed border-slate-200">
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">Edit Unit</button>
                    <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors">Manage Lease</button>
                </section>

                {/* Detail Sections */}
                <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
                    {/* Left: Lease Summary */}
                    <div className="flex flex-col gap-6">
                        <Card title="Lease Summary" className="min-h-[200px]">
                            {unit.activeLease ? (
                                <div className="flex flex-col gap-4 pt-4">
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-slate-500">Tenant</span>
                                        <span className="font-semibold">{unit.activeLease.tenantName}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-slate-500">Period</span>
                                        <span className="font-semibold">{new Date(unit.activeLease.startDate).toLocaleDateString()} - {new Date(unit.activeLease.endDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-100 pb-2">
                                        <span className="text-slate-500">Monthly Rent</span>
                                        <span className="font-semibold text-green-600">${unit.activeLease.amount}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-slate-400 py-8 text-center italic">No active lease</div>
                            )}
                        </Card>

                        <Card title="Tenant History" className="min-h-[200px]">
                            <div className="flex flex-col gap-4 pt-4">
                                {unit.tenantHistory && unit.tenantHistory.length > 0 ? (
                                    unit.tenantHistory.map(h => (
                                        <div key={h.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                            <div>
                                                <p className="font-semibold text-slate-800">{h.tenantName}</p>
                                                <p className="text-xs text-slate-500">{new Date(h.startDate).toLocaleDateString()} - {new Date(h.endDate).toLocaleDateString()}</p>
                                            </div>
                                            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded">Past</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-slate-400 text-center italic">No history available</div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Right: Bedroom/Availability */}
                    <div className="h-full">
                        <Card title="Bedrooms / Availability" className="h-full">
                            <div className="pt-4 text-slate-600">
                                <p className="mb-4">Configuration: <span className="font-semibold text-slate-900">{unit.bedrooms || 1} Bedroom(s)</span></p>
                                <div className="space-y-3">
                                    {Array.from({ length: unit.bedrooms || 1 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                                            <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">{i + 1}</div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Bedroom {i + 1}</p>
                                                <p className="text-xs text-slate-500">Standard Room</p>
                                            </div>
                                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>
                </section>

            </div>
        </MainLayout>
    );
};
