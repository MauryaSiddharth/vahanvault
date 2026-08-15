export default function ComplianceBadge({ label, status = 'valid', expiryDate }: {
  label: string;
  status?: 'valid' | 'expiring_soon' | 'expired';
  expiryDate: string;
}) {
  const config = {
    valid: { emoji: '🟢', text: 'Valid', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', textColor: 'text-emerald-400' },
    expiring_soon: { emoji: '🟡', text: 'Expiring', bg: 'bg-amber-500/10', border: 'border-amber-500/20', textColor: 'text-amber-400' },
    expired: { emoji: '🔴', text: 'Expired', bg: 'bg-red-500/10', border: 'border-red-500/20', textColor: 'text-red-400' },
  }[status] || { emoji: '⚪', text: 'Unknown', bg: 'bg-slate-500/10', border: 'border-slate-500/20', textColor: 'text-slate-400' };

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-2.5 ${status === 'expired' ? 'animate-pulse' : ''}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <span className={`text-xs font-semibold ${config.textColor}`}>{config.emoji} {config.text}</span>
      </div>
      <div className="text-[11px] text-slate-500">
        Exp: {new Date(expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
      </div>
    </div>
  );
}
