import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['owner', 'mechanic', 'admin']).default('owner'),
  phone: z.string().min(1, 'Phone is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const vehicleSchema = z.object({
  regNumber: z.string().min(1, 'Registration number is required'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  fuelType: z.enum(['petrol', 'diesel', 'electric', 'cng']),
  odometerReading: z.number().min(0).default(0),
  pucExpiry: z.coerce.date(),
  insuranceExpiry: z.coerce.date(),
});

export const serviceRecordSchema = z.object({
  type: z.enum(['service', 'repair', 'tyre', 'part_replacement', 'compliance_renewal']),
  description: z.string().min(1, 'Description is required'),
  cost: z.number().min(0).default(0),
  garageName: z.string().min(1, 'Garage name is required'),
  odometerAtService: z.number().min(0),
  date: z.coerce.date(),
});

export const complianceUpdateSchema = z.object({
  pucExpiry: z.coerce.date().optional(),
  insuranceExpiry: z.coerce.date().optional(),
}).refine(data => data.pucExpiry || data.insuranceExpiry, {
  message: "At least one of pucExpiry or insuranceExpiry must be provided",
});
