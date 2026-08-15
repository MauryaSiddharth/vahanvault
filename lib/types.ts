export interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'mechanic' | 'admin';
  phone?: string;
}

export interface VehicleData {
  _id: string;
  vehicleId: string;
  regNumber: string;
  make: string;
  model: string;
  year: number;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'cng';
  ownerId: string;
  odometerReading: number;
  pucExpiry: string;
  insuranceExpiry: string;
  qrCode?: string;
  createdAt: string;
  pucStatus?: 'valid' | 'expiring_soon' | 'expired';
  insuranceStatus?: 'valid' | 'expiring_soon' | 'expired';
}

export interface ServiceRecordData {
  _id: string;
  vehicleId: string;
  type: 'service' | 'repair' | 'tyre' | 'part_replacement' | 'compliance_renewal';
  description: string;
  cost: number;
  garageName: string;
  odometerAtService: number;
  loggedBy?: string;
  date: string;
  createdAt: string;
}

export interface PublicVehicleData {
  vehicleId: string;
  regNumber: string;
  make: string;
  model: string;
  year: number;
  fuelType: string;
  odometerReading: number;
  pucExpiry: string;
  insuranceExpiry: string;
  pucStatus: 'valid' | 'expiring_soon' | 'expired';
  insuranceStatus: 'valid' | 'expiring_soon' | 'expired';
  recentRecords: {
    type: string;
    description: string;
    date: string;
    garageName: string;
  }[];
}
