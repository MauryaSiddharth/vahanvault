import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import ServiceRecord from '@/models/ServiceRecord';
import { getAuthUser } from '@/lib/auth';
import { getComplianceStatus } from '@/lib/compliance';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vehicleId } = await params;
    await dbConnect();
    
    const vehicle = await Vehicle.findOne({ vehicleId }).lean();
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Owner can only view their own vehicle
    if (authUser.role === 'owner' && vehicle.ownerId?.toString() !== authUser.userId) {
      return NextResponse.json({ error: 'Unauthorized access to this vehicle' }, { status: 403 });
    }

    const records = await ServiceRecord.find({ vehicleId: vehicle._id })
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({
      vehicle: {
        ...vehicle,
        pucStatus: getComplianceStatus(vehicle.pucExpiry),
        insuranceStatus: getComplianceStatus(vehicle.insuranceExpiry),
      },
      records
    });
  } catch (error: any) {
    console.error('Get vehicle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
