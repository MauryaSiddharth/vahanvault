'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { VehicleData, ServiceRecordData } from '@/lib/types';
import ComplianceBadge from '@/components/ComplianceBadge';
import ServiceRecordItem from '@/components/ServiceRecordItem';

export default function VehicleDetailPage({ params }: { params: Promise<{ vehicleId: string }> }) {
  const { vehicleId } = use(params);
  const router = useRouter();
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [records, setRecords] = useState<ServiceRecordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showRenewPuc, setShowRenewPuc] = useState(false);
  const [showRenewIns, setShowRenewIns] = useState(false);
  const [renewDate, setRenewDate] = useState('');
  const [recordForm, setRecordForm] = useState({
    type: 'service', description: '', cost: '0', garageName: '', odometerAtService: '', date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      if (!authRes.ok) {
        router.push('/');
        return;
      }

      const res = await fetch(`/api/vehicles/${vehicleId}`);
      if (res.status === 401 || res.status === 403) {
        router.push('/');
        return;
      }
      if (!res.ok) throw new Error('Vehicle not found');
      const data = await res.json();
      setVehicle(data.vehicle);
      setRecords(data.records || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [vehicleId, router]);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...recordForm, cost: Number(recordForm.cost), odometerAtService: Number(recordForm.odometerAtService) }),
      });
      if (!res.ok) throw new Error('Failed to add record');
      setShowAddRecord(false);
      setRecordForm({ type: 'service', description: '', cost: '0', garageName: '', odometerAtService: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRenew = async (field: 'pucExpiry' | 'insuranceExpiry') => {
    if (!renewDate) return;
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}/compliance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: renewDate }),
      });
      if (!res.ok) throw new Error('Failed to renew');
      setShowRenewPuc(false);
      setShowRenewIns(false);
      setRenewDate('');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;
  if (error || !vehicle) return <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg">{error || 'Vehicle not found'}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">←</Link>
        <h1 className="text-2xl font-bold text-white">Vehicle Passport</h1>
        <Link href={`/v/${vehicle.vehicleId}`} className="ml-auto text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-lg transition-colors">Public View ↗</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Info Card */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-5">
              <div>
                <h2 className="text-3xl font-black text-white tracking-wider">{vehicle.regNumber}</h2>
                <p className="text-slate-400 mt-1">{vehicle.make} {vehicle.model} • {vehicle.year}</p>
              </div>
              <div className="text-right">
                <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded capitalize">{vehicle.fuelType}</span>
                <p className="text-xs text-slate-500 mt-2">{vehicle.odometerReading?.toLocaleString()} km</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <ComplianceBadge label="PUC" status={vehicle.pucStatus} expiryDate={vehicle.pucExpiry} />
                {vehicle.pucStatus !== 'valid' && (
                  showRenewPuc ? (
                    <div className="mt-2 flex gap-2">
                      <input type="date" value={renewDate} onChange={e => setRenewDate(e.target.value)} className="text-sm flex-1" />
                      <button onClick={() => handleRenew('pucExpiry')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg">Save</button>
                    </div>
                  ) : (
                    <button onClick={() => setShowRenewPuc(true)} className="mt-2 text-xs text-emerald-400 hover:text-emerald-300">Renew PUC →</button>
                  )
                )}
              </div>
              <div>
                <ComplianceBadge label="Insurance" status={vehicle.insuranceStatus} expiryDate={vehicle.insuranceExpiry} />
                {vehicle.insuranceStatus !== 'valid' && (
                  showRenewIns ? (
                    <div className="mt-2 flex gap-2">
                      <input type="date" value={renewDate} onChange={e => setRenewDate(e.target.value)} className="text-sm flex-1" />
                      <button onClick={() => handleRenew('insuranceExpiry')} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg">Save</button>
                    </div>
                  ) : (
                    <button onClick={() => setShowRenewIns(true)} className="mt-2 text-xs text-emerald-400 hover:text-emerald-300">Renew Insurance →</button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Service History */}
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#334155]">
              <h3 className="font-semibold text-white">Service History</h3>
              <button onClick={() => setShowAddRecord(!showAddRecord)} className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors">
                {showAddRecord ? 'Cancel' : '+ Add Record'}
              </button>
            </div>

            {showAddRecord && (
              <form onSubmit={handleAddRecord} className="bg-slate-800/50 border border-[#334155] rounded-lg p-4 mb-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500">Type</label>
                    <select value={recordForm.type} onChange={e => setRecordForm({...recordForm, type: e.target.value})}>
                      <option value="service">Service</option>
                      <option value="repair">Repair</option>
                      <option value="tyre">Tyre Change</option>
                      <option value="part_replacement">Part Replacement</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Date</label>
                    <input type="date" required value={recordForm.date} onChange={e => setRecordForm({...recordForm, date: e.target.value})} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-slate-500">Description</label>
                    <input required value={recordForm.description} onChange={e => setRecordForm({...recordForm, description: e.target.value})} placeholder="Oil change, brake pads replaced, etc." />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Garage Name</label>
                    <input required value={recordForm.garageName} onChange={e => setRecordForm({...recordForm, garageName: e.target.value})} placeholder="Service center name" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Odometer (km)</label>
                    <input type="number" required value={recordForm.odometerAtService} onChange={e => setRecordForm({...recordForm, odometerAtService: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Cost (₹)</label>
                    <input type="number" value={recordForm.cost} onChange={e => setRecordForm({...recordForm, cost: e.target.value})} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg">Save Record</button>
                </div>
              </form>
            )}

            <div className="space-y-1">
              {records.length === 0 ? (
                <p className="text-center text-slate-500 py-6 text-sm">No service records yet.</p>
              ) : (
                records.map(r => <ServiceRecordItem key={r._id} record={r} showCost={true} />)
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {vehicle.qrCode && (
            <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5 text-center">
              <h3 className="font-semibold text-white mb-3">Vehicle QR Code</h3>
              <div className="bg-white p-4 rounded-lg inline-block mb-3">
                <img src={vehicle.qrCode} alt="QR" className="w-44 h-44" />
              </div>
              <p className="text-xs text-slate-500 mb-3">Scan to view public passport</p>
              <button onClick={() => window.print()} className="w-full bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-2 rounded-lg transition-colors">Print QR</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
