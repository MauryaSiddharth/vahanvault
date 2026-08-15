import mongoose, { Schema, Model } from 'mongoose';

export interface IServiceRecord {
  vehicleId: mongoose.Types.ObjectId;
  type: 'service' | 'repair' | 'tyre' | 'part_replacement' | 'compliance_renewal';
  description: string;
  cost: number;
  garageName: string;
  odometerAtService: number;
  loggedBy?: mongoose.Types.ObjectId;
  date: Date;
  createdAt: Date;
}

const ServiceRecordSchema: Schema<IServiceRecord> = new Schema({
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
  type: { 
    type: String, 
    enum: ['service', 'repair', 'tyre', 'part_replacement', 'compliance_renewal'], 
    required: true 
  },
  description: { type: String, required: true },
  cost: { type: Number, required: true, default: 0 },
  garageName: { type: String, required: true },
  odometerAtService: { type: Number, required: true },
  loggedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

const ServiceRecord: Model<IServiceRecord> = mongoose.models.ServiceRecord || mongoose.model<IServiceRecord>('ServiceRecord', ServiceRecordSchema);

export default ServiceRecord;
