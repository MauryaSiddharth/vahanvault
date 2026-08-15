import Link from 'next/link';
import { VehicleData } from '@/lib/types';
import ComplianceBadge from './ComplianceBadge';

export default function VehicleCard({ vehicle }: { vehicle: VehicleData }) {
  return (
    <Link href={`/vehicles/${vehicle.vehicleId}`}>
      <div className="bg-[#1e293b] hover:bg-[#334155] border border-[#334155] rounded-xl p-5 transition-all duration-200 cursor-pointer h-full flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">{vehicle.regNumber}</h3>
            <p className="text-slate-400 text-sm">{vehicle.make} {vehicle.model} • {vehicle.year}</p>
          </div>
          <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded capitalize">{vehicle.fuelType}</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">Odo: {vehicle.odometerReading?.toLocaleString() || 0} km</p>
        <div className="mt-auto grid grid-cols-2 gap-2">
          <ComplianceBadge label="PUC" status={vehicle.pucStatus} expiryDate={vehicle.pucExpiry} />
          <ComplianceBadge label="Insurance" status={vehicle.insuranceStatus} expiryDate={vehicle.insuranceExpiry} />
        </div>
      </div>
    </Link>
  );
}
