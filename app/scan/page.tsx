'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const QrScanner = dynamic(() => import('@/components/QrScannerComponent'), { ssr: false });

export default function ScanPage() {
  const router = useRouter();
  const [manualId, setManualId] = useState('');

  const handleScanSuccess = (decodedText: string) => {
    try {
      let vId = decodedText;
      if (decodedText.includes('/v/')) {
        vId = decodedText.split('/v/').pop() || decodedText;
      }
      router.push(`/v/${vId}`);
    } catch (e) {
      console.error('Scan error:', e);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      router.push(`/v/${manualId.trim()}`);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Scan Vehicle QR</h1>
        <p className="text-slate-400 text-sm mt-1">Scan a VahanVault QR code or enter the vehicle ID manually.</p>
      </div>

      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 overflow-hidden relative">
        <div className="aspect-square w-full bg-black/50 rounded-lg overflow-hidden relative border border-[#334155]">
          <QrScanner onScanSuccess={handleScanSuccess} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-[#334155]"></div>
        <span className="text-xs text-slate-500">OR ENTER MANUALLY</span>
        <div className="flex-grow h-px bg-[#334155]"></div>
      </div>

      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5">
        <form onSubmit={handleManualSubmit} className="flex gap-3">
          <input
            type="text"
            value={manualId}
            onChange={e => setManualId(e.target.value)}
            placeholder="Enter Vehicle ID (UUID from QR)"
            className="flex-1"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
            Look Up
          </button>
        </form>
      </div>
    </div>
  );
}
