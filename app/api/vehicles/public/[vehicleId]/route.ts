import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import ServiceRecord from '@/models/ServiceRecord';
import { getComplianceStatus } from '@/lib/compliance';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  try {
    const { vehicleId } = await params;
    await dbConnect();
    
    // Normalize registration number (remove spaces, hyphens and uppercase)
    const normalizedReg = vehicleId.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    
    // Support lookup by vehicleId (UUID) OR normalized regNumber
    const vehicle = await Vehicle.findOne({
      $or: [
        { vehicleId: vehicleId },
        { regNumber: normalizedReg }
      ]
    }).lean();

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const records = await ServiceRecord.find({ vehicleId: vehicle._id })
      .sort({ date: -1 })
      .limit(3)
      .lean();

    const publicRecords = records.map(record => ({
      type: record.type,
      description: record.description,
      date: record.date,
      garageName: record.garageName,
      odometerAtService: record.odometerAtService
    }));

    return NextResponse.json({
      vehicle: {
        vehicleId: vehicle.vehicleId,
        regNumber: vehicle.regNumber,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        fuelType: vehicle.fuelType,
        odometerReading: vehicle.odometerReading,
        pucExpiry: vehicle.pucExpiry,
        insuranceExpiry: vehicle.insuranceExpiry,
        pucStatus: getComplianceStatus(vehicle.pucExpiry),
        insuranceStatus: getComplianceStatus(vehicle.insuranceExpiry)
      },
      records: publicRecords
    });
  } catch (error: any) {
    console.error('Get public vehicle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
