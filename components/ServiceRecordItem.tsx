import { ServiceRecordData } from '@/lib/types';

const typeConfig: Record<string, { icon: string; label: string; color: string }> = {
  service: { icon: '🔧', label: 'Service', color: 'border-blue-500' },
  repair: { icon: '🛠️', label: 'Repair', color: 'border-red-500' },
  tyre: { icon: '🛞', label: 'Tyres', color: 'border-slate-500' },
  part_replacement: { icon: '⚙️', label: 'Parts', color: 'border-purple-500' },
  compliance_renewal: { icon: '📋', label: 'Renewal', color: 'border-emerald-500' },
};

export default function ServiceRecordItem({ record, showCost = false }: { record: ServiceRecordData; showCost?: boolean }) {
  const cfg = typeConfig[record.type] || { icon: '📝', label: 'Other', color: 'border-slate-600' };

  return (
    <div className={`border-l-2 ${cfg.color} pl-4 py-3 hover:bg-white/[0.02] transition-colors rounded-r`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span>{cfg.icon}</span>
            <span className="font-medium text-sm text-slate-200">{cfg.label}</span>
            <span className="text-xs text-slate-500">{new Date(record.date).toLocaleDateString('en-IN')}</span>
          </div>
          <p className="text-xs text-slate-400 mb-1">{record.description}</p>
          <div className="flex gap-3 text-[11px] text-slate-500">
            <span>📍 {record.garageName}</span>
            <span>📏 {record.odometerAtService?.toLocaleString()} km</span>
          </div>
        </div>
        {showCost && record.cost > 0 && (
          <span className="text-sm font-medium text-emerald-400 whitespace-nowrap">₹{record.cost.toLocaleString()}</span>
        )}
      </div>
    </div>
  );
}
