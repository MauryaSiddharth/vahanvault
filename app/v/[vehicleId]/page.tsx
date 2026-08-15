'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import ComplianceBadge from '@/components/ComplianceBadge';

interface PublicVehicle {
  vehicleId: string; regNumber: string; make: string; model: string;
  year: number; fuelType: string; odometerReading: number;
  pucExpiry: string; insuranceExpiry: string;
  pucStatus: 'valid' | 'expiring_soon' | 'expired';
  insuranceStatus: 'valid' | 'expiring_soon' | 'expired';
}

interface PublicRecord {
  type: string; description: string; date: string; garageName: string;
}

export default function PublicVehiclePage({ params }: { params: Promise<{ vehicleId: string }> }) {
  const { vehicleId } = use(params);
  const [vehicle, setVehicle] = useState<PublicVehicle | null>(null);
  const [records, setRecords] = useState<PublicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/vehicles/public/${vehicleId}`)
      .then(res => {
        if (!res.ok) throw new Error('Vehicle not found');
        return res.json();
      })
      .then(data => {
        setVehicle(data.vehicle);
        setRecords(data.records || []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [vehicleId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied!');
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  if (error || !vehicle) return (
    <div className="max-w-md mx-auto text-center py-16 space-y-4">
      <div className="text-5xl">🔍</div>
      <h2 className="text-xl font-bold text-white">Vehicle Not Found</h2>
      <p className="text-slate-400 text-sm">{error || 'This QR code may be invalid.'}</p>
      <Link href="/scan" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors inline-block">Scan Another</Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center justify-center gap-2">
        <span>🛡️</span>
        <span className="text-emerald-400 font-semibold text-sm tracking-wide uppercase">VahanVault Verified</span>
      </div>

      <div className="bg-[#1e293b] border border-[#334155] rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 p-8 text-center border-b border-[#334155] relative">
          <button onClick={handleShare} className="absolute top-3 right-3 text-slate-500 hover:text-white p-1.5 rounded-full bg-black/20 transition-colors text-sm">🔗</button>
          <h1 className="text-4xl font-black text-white tracking-widest">{vehicle.regNumber}</h1>
          <p className="text-lg text-slate-400 mt-1">{vehicle.make} {vehicle.model}</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-[10px] text-slate-500 uppercase">Year</div>
              <div className="font-semibold text-white text-sm">{vehicle.year}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-[10px] text-slate-500 uppercase">Fuel</div>
              <div className="font-semibold text-white text-sm capitalize">{vehicle.fuelType}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-[10px] text-slate-500 uppercase">Odometer</div>
              <div className="font-semibold text-white text-sm">{vehicle.odometerReading.toLocaleString()} km</div>
            </div>
          </div>

          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Compliance</h3>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <ComplianceBadge label="PUC" status={vehicle.pucStatus} expiryDate={vehicle.pucExpiry} />
            <ComplianceBadge label="Insurance" status={vehicle.insuranceStatus} expiryDate={vehicle.insuranceExpiry} />
          </div>

          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Recent Service</h3>
          <div className="space-y-3">
            {records.length > 0 ? records.map((r, i) => (
              <div key={i} className="bg-slate-800 rounded-lg p-3 flex items-start gap-3">
                <span className="text-lg">{r.type === 'service' ? '🔧' : r.type === 'repair' ? '🛠️' : r.type === 'tyre' ? '🛞' : '📝'}</span>
                <div>
                  <p className="text-sm text-slate-200 font-medium capitalize">{r.type.replace('_', ' ')}</p>
                  <p className="text-xs text-slate-400">{r.description}</p>
                  <div className="flex gap-3 text-[11px] text-slate-500 mt-1">
                    <span>📅 {new Date(r.date).toLocaleDateString('en-IN')}</span>
                    <span>🏢 {r.garageName}</span>
                  </div>
                </div>
              </div>
            )) : <p className="text-center text-slate-500 text-sm py-4">No records available.</p>}
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-600">
        🛡️ Powered by <strong>VahanVault</strong> •
        <Link href="/" className="text-blue-400 hover:underline ml-1">Get your passport</Link>
      </div>
    </div>
  );
}
