import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import qrcode from 'qrcode';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Setup basic models directly in script to ensure they are loaded
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['owner', 'mechanic', 'admin'], default: 'owner', required: true },
  phone: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const VehicleSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true, unique: true, index: true },
  regNumber: { type: String, required: true, unique: true, index: true, uppercase: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  fuelType: { type: String, enum: ['petrol', 'diesel', 'electric', 'cng'], required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  odometerReading: { type: Number, required: true, default: 0 },
  pucExpiry: { type: Date, required: true },
  insuranceExpiry: { type: Date, required: true },
  qrCode: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);

const ServiceRecordSchema = new mongoose.Schema({
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true, index: true },
  type: { type: String, enum: ['service', 'repair', 'tyre', 'part_replacement', 'compliance_renewal'], required: true },
  description: { type: String, required: true },
  cost: { type: Number, required: true, default: 0 },
  garageName: { type: String, required: true },
  odometerAtService: { type: Number, required: true },
  loggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});
const ServiceRecord = mongoose.models.ServiceRecord || mongoose.model('ServiceRecord', ServiceRecordSchema);

async function seed() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in .env.local');
  }

  console.log('Connecting to database...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  console.log('Clearing existing data...');
  await User.deleteMany({});
  await Vehicle.deleteMany({});
  await ServiceRecord.deleteMany({});
  console.log('Data cleared.');

  console.log('Creating users...');
  const passwordHash = await bcrypt.hash('password123', 12);
  
  const owner = await User.create({
    name: 'John Owner',
    email: 'john@example.com',
    passwordHash,
    role: 'owner',
    phone: '9876543210'
  });

  const mechanic = await User.create({
    name: 'Mike Mechanic',
    email: 'mechanic@example.com',
    passwordHash,
    role: 'mechanic',
    phone: '8765432109'
  });

  console.log('Creating vehicles...');
  const now = new Date();
  
  const v1Id = uuidv4();
  const v2Id = uuidv4();
  const v3Id = uuidv4();
  const v4Id = uuidv4();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  const v1 = await Vehicle.create({
    vehicleId: v1Id,
    regNumber: 'MH12AB1234',
    make: 'Maruti',
    model: 'Swift',
    year: 2022,
    fuelType: 'petrol',
    ownerId: owner._id,
    odometerReading: 15000,
    pucExpiry: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // expired 30 days ago
    insuranceExpiry: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000), // valid 6 months
    qrCode: await qrcode.toDataURL(`${baseUrl}/v/${v1Id}`)
  });

  const v2 = await Vehicle.create({
    vehicleId: v2Id,
    regNumber: 'MH14CD5678',
    make: 'Honda',
    model: 'City',
    year: 2023,
    fuelType: 'petrol',
    ownerId: owner._id,
    odometerReading: 8000,
    pucExpiry: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // expiring in 10 days
    insuranceExpiry: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
    qrCode: await qrcode.toDataURL(`${baseUrl}/v/${v2Id}`)
  });

  const v3 = await Vehicle.create({
    vehicleId: v3Id,
    regNumber: 'KA01EF9012',
    make: 'Tata',
    model: 'Nexon',
    year: 2024,
    fuelType: 'diesel',
    ownerId: owner._id,
    odometerReading: 2000,
    pucExpiry: new Date(now.getTime() + 200 * 24 * 60 * 60 * 1000), // valid
    insuranceExpiry: new Date(now.getTime() + 200 * 24 * 60 * 60 * 1000),
    qrCode: await qrcode.toDataURL(`${baseUrl}/v/${v3Id}`)
  });

  const v4 = await Vehicle.create({
    vehicleId: v4Id,
    regNumber: 'DL05GH3456',
    make: 'Hyundai',
    model: 'i20',
    year: 2021,
    fuelType: 'petrol',
    ownerId: owner._id,
    odometerReading: 35000,
    pucExpiry: new Date(now.getTime() + 100 * 24 * 60 * 60 * 1000),
    insuranceExpiry: new Date(now.getTime() + 150 * 24 * 60 * 60 * 1000),
    qrCode: await qrcode.toDataURL(`${baseUrl}/v/${v4Id}`)
  });

  console.log('Creating service records...');
  const records = [
    { vehicleId: v1._id, type: 'service', description: 'Regular maintenance and oil change', cost: 4500, garageName: 'Maruti Authorized Service', odometerAtService: 10000, loggedBy: mechanic._id, date: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000) },
    { vehicleId: v1._id, type: 'tyre', description: 'Replaced front two tyres', cost: 9000, garageName: 'Tyre Experts', odometerAtService: 12000, loggedBy: owner._id, date: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) },
    { vehicleId: v1._id, type: 'repair', description: 'Fixed AC cooling issue', cost: 2500, garageName: 'Cool Motors', odometerAtService: 14500, loggedBy: mechanic._id, date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000) },
    
    { vehicleId: v2._id, type: 'service', description: 'First free service', cost: 0, garageName: 'Honda Service', odometerAtService: 1000, loggedBy: mechanic._id, date: new Date(now.getTime() - 300 * 24 * 60 * 60 * 1000) },
    { vehicleId: v2._id, type: 'service', description: 'Second free service', cost: 0, garageName: 'Honda Service', odometerAtService: 5000, loggedBy: mechanic._id, date: new Date(now.getTime() - 100 * 24 * 60 * 60 * 1000) },
    { vehicleId: v2._id, type: 'part_replacement', description: 'Wiper blades replaced', cost: 800, garageName: 'Honda Service', odometerAtService: 7500, loggedBy: mechanic._id, date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) },
    
    { vehicleId: v3._id, type: 'service', description: 'PDI and first checkup', cost: 0, garageName: 'Tata Motors', odometerAtService: 500, loggedBy: mechanic._id, date: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000) },
    { vehicleId: v3._id, type: 'compliance_renewal', description: 'Initial Insurance and PUC issued', cost: 25000, garageName: 'Dealer', odometerAtService: 10, loggedBy: owner._id, date: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000) },
    
    { vehicleId: v4._id, type: 'service', description: 'Yearly major service', cost: 8500, garageName: 'Hyundai Care', odometerAtService: 30000, loggedBy: mechanic._id, date: new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000) },
    { vehicleId: v4._id, type: 'repair', description: 'Brake pad replacement', cost: 3200, garageName: 'Quick Fix Garage', odometerAtService: 32000, loggedBy: mechanic._id, date: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000) },
    { vehicleId: v4._id, type: 'compliance_renewal', description: 'PUC renewal', cost: 150, garageName: 'RTO Center', odometerAtService: 33000, loggedBy: owner._id, date: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) },
    { vehicleId: v4._id, type: 'service', description: 'Oil filter and air filter', cost: 2100, garageName: 'Hyundai Care', odometerAtService: 34500, loggedBy: mechanic._id, date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
  ];

  await ServiceRecord.insertMany(records);

  console.log('Seed completed successfully!');
  console.log(`Created 2 users, 4 vehicles, and ${records.length} service records.`);
  
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
