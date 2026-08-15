'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'owner' | 'mechanic'>('owner');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const endpoint = activeTab === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = activeTab === 'login' 
        ? { email, password }
        : { name, email, phone, password, role };
        
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col lg:flex-row items-center justify-center gap-12 py-6 relative overflow-hidden">
      {/* Decorative blurred shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/5 rounded-full blur-3xl -z-10"></div>

      {/* Hero text */}
      <div className="flex-1 text-center lg:text-left space-y-6 max-w-xl">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
          Vahan<span className="text-blue-500">Vault</span>
        </h1>
        <h2 className="text-xl sm:text-2xl text-slate-300 font-medium">
          The Vehicle Maintenance Passport
        </h2>
        <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto lg:mx-0 leading-relaxed">
          Complete service history. Compliance tracking. One scan away. Keep your vehicle's service history transparent and instantly verify PUC/insurance records.
        </p>
        
        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <Link 
            href="/scan" 
            className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-6 py-3 rounded-xl transition-all border border-slate-700 text-center flex items-center justify-center gap-2 hover:border-slate-500 shadow-lg"
          >
            🔍 Scan Vehicle QR or Plate
          </Link>
        </div>
      </div>

      {/* Login/Register Card */}
      <div className="w-full max-w-md">
        <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Tabs header */}
          <div className="flex mb-6 bg-slate-800 p-1 rounded-xl">
            <button 
              className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${activeTab === 'login' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setActiveTab('login')}
            >
              Sign In
            </button>
            <button 
              className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${activeTab === 'register' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              onClick={() => setActiveTab('register')}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs sm:text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="John Doe" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    placeholder="+91 9876543210" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Select Role</label>
                  <select 
                    value={role} 
                    onChange={e => setRole(e.target.value as any)}
                  >
                    <option value="owner">Vehicle Owner</option>
                    <option value="mechanic">Mechanic / Garage</option>
                  </select>
                </div>
              </>
            )}
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="you@example.com" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 mt-6 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg disabled:opacity-50 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                activeTab === 'login' ? 'Sign In' : 'Register'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
