import mongoose, { Schema, Model } from 'mongoose';

export interface IVehicle {
  vehicleId: string;
  regNumber: string;
  make: string;
  model: string;
  year: number;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'cng';
  ownerId?: mongoose.Types.ObjectId;
  odometerReading: number;
  pucExpiry: Date;
  insuranceExpiry: Date;
  qrCode?: string;
  createdAt: Date;
}

const VehicleSchema: Schema<IVehicle> = new Schema({
  vehicleId: { type: String, required: true, unique: true, index: true },
  regNumber: { type: String, required: true, unique: true, index: true, uppercase: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  fuelType: { type: String, enum: ['petrol', 'diesel', 'electric', 'cng'], required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
  odometerReading: { type: Number, required: true, default: 0 },
  pucExpiry: { type: Date, required: true },
  insuranceExpiry: { type: Date, required: true },
  qrCode: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Vehicle: Model<IVehicle> = mongoose.models.Vehicle || mongoose.model<IVehicle>('Vehicle', VehicleSchema);

export default Vehicle;
