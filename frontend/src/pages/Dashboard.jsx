import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/Card';
import api from '../api/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard/stats');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <MainLayout title="Dashboard Overview"><div className="p-8">Loading dashboard...</div></MainLayout>;
  }

  // Fallback to initial structure if API fails or returns partial
  const { totalProperties, totalUnits, occupancy, monthlyRevenue, projectedRevenue, actualRevenue, insuranceAlerts, recentActivity } = stats || {
    totalProperties: 0,
    totalUnits: 0,
    occupancy: { occupied: 0, vacant: 0 },
    monthlyRevenue: 0,
    projectedRevenue: 0,
    actualRevenue: 0,
    insuranceAlerts: { expired: 0, expiringSoon: 0 },
    recentActivity: []
  };

  const revenueData = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 14500 },
    { month: 'Mar', revenue: 13200 },
    { month: 'Apr', revenue: 15800 },
    { month: 'May', revenue: monthlyRevenue }, // Dynamic current month
  ];
  return (
    <MainLayout title="Dashboard Overview">
      <div className="flex flex-col gap-8">

        {/* TOP SUMMARY CARDS */}
        <section className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
          <Card className="p-6 rounded-[18px] bg-white shadow-[0_20px_45px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] hover:rotate-1">
            <span className="text-sm text-gray-500 tracking-wide">Total Properties</span>
            <h2 className="text-[2.2rem] font-bold mt-2 leading-tight">{totalProperties}</h2>
          </Card>

          <Card className="p-6 rounded-[18px] bg-white shadow-[0_20px_45px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] hover:rotate-1">
            <span className="text-sm text-gray-500 tracking-wide">Total Units</span>
            <h2 className="text-[2.2rem] font-bold mt-2 leading-tight">{totalUnits}</h2>
          </Card>

          <Card className="p-6 rounded-[18px] bg-white shadow-[0_20px_45px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] hover:rotate-1">
            <span className="text-sm text-gray-500 tracking-wide">Occupancy</span>
            <p className="mt-2 text-gray-700">
              <strong>Occupied:</strong> {occupancy.occupied} <br />
              <strong>Vacant:</strong> {occupancy.vacant}
            </p>
          </Card>

          <Card className="p-6 rounded-[18px] bg-white shadow-[0_20px_45px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] hover:rotate-1 border-l-[6px] border-indigo-500">
            <span className="text-sm text-gray-500 tracking-wide">Projected Revenue</span>
            <h2 className="text-[2.2rem] font-bold mt-2 leading-tight">${(projectedRevenue || monthlyRevenue || 0).toLocaleString()}</h2>
          </Card>

          <Card className="p-6 rounded-[18px] bg-white shadow-[0_20px_45px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] hover:rotate-1 border-l-[6px] border-emerald-500">
            <span className="text-sm text-gray-500 tracking-wide">Actual Revenue (YTD)</span>
            <h2 className="text-[2.2rem] font-bold mt-2 leading-tight">${(actualRevenue || 0).toLocaleString()}</h2>
          </Card>

          <Card
            className="p-6 rounded-[18px] bg-white shadow-[0_20px_45px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] hover:rotate-1 border-l-[6px] border-red-500 cursor-pointer"
            onClick={() => window.location.href = '/insurance-alerts'}
          >
            <span className="text-sm text-gray-500 tracking-wide font-medium">Insurance Alerts</span>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-600 uppercase tracking-tight">Expired</span>
                <span className="text-lg font-black text-red-700">{insuranceAlerts.expired}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-tight">Expiring Soon</span>
                <span className="text-lg font-black text-amber-700">{insuranceAlerts.expiringSoon}</span>
              </div>
            </div>
          </Card>
        </section>

        {/* LOWER CONTENT */}
        <section className="grid grid-cols-[repeat(auto-fit,minmax(360px,1fr))] gap-6">
          <Card title="Recent Activity" className="p-6 rounded-[20px] bg-white shadow-[0_18px_35px_rgba(0,0,0,0.07)]">
            <ul className="pl-4 text-gray-700 space-y-2 list-disc marker:text-gray-400">
              {recentActivity.map((activity, index) => (
                <li key={index}>{activity}</li>
              ))}
            </ul>
          </Card>

          <Card title="Revenue Trends" className="p-6 rounded-[20px] bg-white shadow-[0_18px_35px_rgba(0,0,0,0.07)]">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueData}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar
                  dataKey="revenue"
                  radius={[6, 6, 0, 0]}
                  fill="#6366f1"
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </section>

      </div>
    </MainLayout>
  );
};
