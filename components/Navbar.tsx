'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { UserData } from '@/lib/types';

export default function Navbar() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [pathname]); // Refetch on route change to pick up login/logout immediately

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setUser(null);
        setMobileMenuOpen(false);
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-[#1e293b]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 font-bold text-lg text-white hover:text-blue-400 transition-colors">
          🛡️ VahanVault
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/scan" className="text-slate-400 hover:text-white transition-colors text-sm">Scan QR</Link>
          
          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm">Dashboard</Link>
                  <Link href="/vehicles/new" className="text-slate-400 hover:text-white transition-colors text-sm">Register Vehicle</Link>
                  <div className="h-4 w-px bg-[#334155]" />
                  <span className="text-slate-400 text-xs font-medium">Hello, {user.name}</span>
                  <button 
                    onClick={handleLogout}
                    className="bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  href="/" 
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
              )}
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-3">
          {!loading && !user && (
            <Link 
              href="/" 
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-400 hover:text-white focus:outline-none focus:text-white p-1"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0f172a] border-b border-[#1e293b] px-4 py-4 space-y-3">
          <Link 
            href="/scan" 
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-300 hover:text-white text-sm font-medium py-1"
          >
            Scan QR
          </Link>
          
          {!loading && user && (
            <>
              <Link 
                href="/dashboard" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-300 hover:text-white text-sm font-medium py-1"
              >
                Dashboard
              </Link>
              <Link 
                href="/vehicles/new" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-300 hover:text-white text-sm font-medium py-1"
              >
                Register Vehicle
              </Link>
              <div className="border-t border-[#1e293b] pt-3">
                <p className="text-slate-400 text-xs mb-2">Logged in as {user.name} ({user.role})</p>
                <button
                  onClick={handleLogout}
                  className="w-full bg-[#1e293b] hover:bg-[#334155] border border-[#334155] text-white text-xs font-semibold py-2 rounded-lg transition-colors text-center"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
