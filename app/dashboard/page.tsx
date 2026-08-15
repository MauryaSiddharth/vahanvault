'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import VehicleCard from '@/components/VehicleCard';
import { VehicleData } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) {
          router.push('/');
          return;
        }

        const res = await fetch('/api/vehicles');
        if (res.status === 401) {
          router.push('/');
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch vehicles');
        const data = await res.json();
        setVehicles(data.vehicles || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, [router]);

  const expiring = vehicles.filter(v => v.pucStatus !== 'valid' || v.insuranceStatus !== 'valid');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Your Vehicles</h1>
          <p className="text-slate-400 text-sm mt-1">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered</p>
        </div>
        <Link href="/vehicles/new" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Register Vehicle
        </Link>
      </div>

      {expiring.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 p-3 rounded-lg flex items-center gap-2 text-sm">
          <span>⚠️</span>
          <span>{expiring.length} vehicle{expiring.length > 1 ? 's have' : ' has'} expiring or expired compliance.</span>
        </div>
      )}

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">{error}</div>}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-[#1e293b] rounded-xl p-5 h-44 animate-pulse">
              <div className="h-5 bg-slate-700 rounded w-2/3 mb-3" />
              <div className="h-4 bg-slate-700/50 rounded w-1/3 mb-6" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-14 bg-slate-700/30 rounded-lg" />
                <div className="h-14 bg-slate-700/30 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-16 bg-[#1e293b] rounded-xl">
          <div className="text-5xl mb-3">🚗</div>
          <h2 className="text-xl font-semibold text-white mb-1">No vehicles yet</h2>
          <p className="text-slate-400 text-sm mb-4">Register your first vehicle to get started.</p>
          <Link href="/vehicles/new" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors inline-block">Register Vehicle</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map(vehicle => <VehicleCard key={vehicle._id} vehicle={vehicle} />)}
        </div>
      )}
    </div>
  );
}
