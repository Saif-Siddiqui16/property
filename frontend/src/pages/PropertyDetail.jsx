import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Table } from '../components/Table';
import { ArrowLeft, Home } from 'lucide-react';
import api from '../api/client';

export const PropertyDetail = () => {
    const { id } = useParams();
    const [property, setProperty] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/admin/properties/${id}`);
                setProperty(res.data);
            } catch (e) { console.error(e); }
        };
        fetchDetails();
    }, [id]);

    if (!property) return <div>Loading...</div>;

    return (
        <DashboardLayout title="Property Details">
            <div className="mb-6">
                <Link to="/properties/buildings" className="inline-flex items-center gap-2 text-slate-500 no-underline text-sm mb-2 hover:text-blue-600 transition-colors">
                    <ArrowLeft size={16} /> Back to Properties
                </Link>
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold mt-2 text-slate-900">{property.name}</h2>
                    <Button size="sm">Edit Property</Button>
                </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-6">
                <Card className="p-4 text-center">
                    <div className="text-slate-500 text-sm">Total Units</div>
                    <div className="text-2xl font-bold text-slate-900">{property.totalUnits}</div>
                </Card>
                <Card className="p-4 text-center">
                    <div className="text-slate-500 text-sm">Occupancy</div>
                    <div className="text-2xl font-bold text-emerald-600">{property.occupancyRate}%</div>
                </Card>
                <Card className="p-4 text-center">
                    <div className="text-slate-500 text-sm">Revenue (YTD)</div>
                    <div className="text-2xl font-bold text-slate-900">$ {property.revenue.toLocaleString('en-CA')}</div>
                </Card>
            </div>

            <Card title="Units" className="mt-6">
                <Table
                    headers={['Unit', 'Type', 'Rental Mode', 'Status', 'Tenant', 'Actions']}
                    data={property.units}
                    renderRow={(unit) => (
                        <>
                            <td>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                                        <Home size={16} />
                                    </div>
                                    <span className="font-medium text-slate-900">{unit.name}</span>
                                </div>
                            </td>
                            <td className="text-slate-700">{unit.type}</td>
                            <td>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${unit.mode === 'Full Unit'
                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                    : 'bg-purple-50 border-purple-200 text-purple-700'
                                    }`}>
                                    {unit.mode}
                                </span>
                            </td>
                            <td>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${unit.status === 'Occupied' ? 'bg-emerald-100 text-emerald-700' :
                                    unit.status === 'Vacant' ? 'bg-red-100 text-red-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`}>
                                    {unit.status}
                                </span>
                            </td>
                            <td className="text-slate-700">{unit.tenant}</td>
                            <td>
                                <Link to={`/units/${unit.id}`}>
                                    <Button variant="outline" size="sm">Manage</Button>
                                </Link>
                            </td>
                        </>
                    )}
                />
            </Card>
        </DashboardLayout>
    );
};
