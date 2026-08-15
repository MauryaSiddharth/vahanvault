'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ vehicleId: string; qr: string } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/');
        }
      } catch (err) {
        router.push('/');
      }
    };
    checkAuth();
  }, [router]);
  const [form, setForm] = useState({
    regNumber: '', make: '', model: '', year: new Date().getFullYear().toString(),
    fuelType: 'petrol', odometerReading: '0', pucExpiry: '', insuranceExpiry: ''
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          year: parseInt(form.year),
          odometerReading: parseInt(form.odometerReading) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register');
      setSuccess({ vehicleId: data.vehicle.vehicleId, qr: data.vehicle.qrCode });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
          <div className="text-4xl mb-2">✅</div>
          <h2 className="text-xl font-bold text-white">Vehicle Registered!</h2>
          <p className="text-slate-400 text-sm mt-1">Your vehicle passport QR code is ready.</p>
        </div>
        <div className="bg-white p-6 rounded-xl inline-block">
          <img src={success.qr} alt="QR Code" className="w-48 h-48" />
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={() => window.print()} className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-2 rounded-lg transition-colors">Print QR</button>
          <Link href={`/vehicles/${success.vehicleId}`} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors">View Vehicle</Link>
          <Link href="/dashboard" className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-2 rounded-lg transition-colors">Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">←</Link>
        <h1 className="text-2xl font-bold text-white">Register New Vehicle</h1>
      </div>

      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6">
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Registration Number</label>
              <input required value={form.regNumber} onChange={set('regNumber')} placeholder="MH12AB1234" className="uppercase" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Make (Brand)</label>
              <input required value={form.make} onChange={set('make')} placeholder="Maruti" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Model</label>
              <input required value={form.model} onChange={set('model')} placeholder="Swift" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Year</label>
              <input required type="number" min="1950" max={new Date().getFullYear()} value={form.year} onChange={set('year')} />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Fuel Type</label>
              <select value={form.fuelType} onChange={set('fuelType')}>
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="electric">Electric</option>
                <option value="cng">CNG</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Odometer (km)</label>
              <input required type="number" min="0" value={form.odometerReading} onChange={set('odometerReading')} />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">PUC Expiry</label>
              <input required type="date" value={form.pucExpiry} onChange={set('pucExpiry')} />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Insurance Expiry</label>
              <input required type="date" value={form.insuranceExpiry} onChange={set('insuranceExpiry')} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]">
            <Link href="/dashboard" className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-2 rounded-lg transition-colors">Cancel</Link>
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors">
              {loading ? 'Registering...' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
