import React from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/Card';

import { useState, useEffect } from 'react';
import api from '../api/client';

export const VacancyDashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    vacant: 0,
    occupied: 0,
    vacancyByBuilding: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/analytics/vacancy');
        setStats(res.data);
      } catch (e) { console.error(e); }
    };
    fetchStats();
  }, []);

  return (
    <MainLayout title="Vacancy Dashboard">
      <div className="flex flex-col gap-8">

        {/* TOP STATS */}
        <section className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
          <Card className="p-6 rounded-[18px] bg-white shadow-[0_20px_45px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] hover:rotate-1">
            <span className="text-sm text-gray-500">Total Units</span>
            <h2 className="text-[2.2rem] font-bold mt-2 leading-tight">{stats.total}</h2>
            <p className="mt-2 text-gray-700">Across all buildings</p>
          </Card>

          <Card className="p-6 rounded-[18px] bg-white shadow-[0_20px_45px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] hover:rotate-1 border-l-[6px] border-red-500">
            <span className="text-sm text-gray-500">Vacant Units</span>
            <h2 className="text-[2.2rem] font-bold mt-2 leading-tight">{stats.vacant}</h2>
            <p className="mt-2 text-gray-700">Needs attention</p>
          </Card>

          <Card className="p-6 rounded-[18px] bg-white shadow-[0_20px_45px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] hover:rotate-1 border-l-[6px] border-emerald-500">
            <span className="text-sm text-gray-500">Occupied Units</span>
            <h2 className="text-[2.2rem] font-bold mt-2 leading-tight">{stats.occupied}</h2>
            <p className="mt-2 text-gray-700">Generating revenue</p>
          </Card>
        </section>

        {/* DETAILS */}
        <section className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
          {/* Vacancy by Building */}
          <Card title="Vacancy by Building" className="p-6 rounded-[18px] bg-white shadow-[0_20px_45px_rgba(0,0,0,0.08)]">
            <ul className="p-0 list-none">
              {stats.vacancyByBuilding.map((b, index) => (
                <li key={index} className="flex justify-between py-2 border-b border-dashed border-gray-200">
                  <span>{b.name}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${b.vacant > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'}`}>
                    {b.vacant > 0 ? `${b.vacant} Vacant` : 'Fully Occupied'}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Unit vs Bedroom Mode - Mocked in backend response not supported yet, keeping static or hiding. I'll hide for now or keep static as placeholder */}
          <Card title="Unit vs Bedroom Rental Mode" className="p-6 rounded-[18px] bg-white shadow-[0_20px_45px_rgba(0,0,0,0.08)]">
            <div className="flex gap-4 mt-4">
              <div className="flex-1 p-5 rounded-xl text-center transition-transform duration-300 hover:scale-105 bg-blue-50">
                <h4 className="font-semibold text-slate-900">Full Unit Rental</h4>
                <p className="text-slate-600">{stats.total} Units</p>
              </div>
            </div>
          </Card>
        </section>

      </div>
    </MainLayout>
  );
};
