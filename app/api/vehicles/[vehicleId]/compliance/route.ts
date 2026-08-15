import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import ServiceRecord from '@/models/ServiceRecord';
import { getAuthUser } from '@/lib/auth';
import { complianceUpdateSchema } from '@/lib/validations';
import { getComplianceStatus } from '@/lib/compliance';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ vehicleId: string }> }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vehicleId } = await params;
    const body = await req.json();
    const result = complianceUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    await dbConnect();
    const vehicle = await Vehicle.findOne({ vehicleId });
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Owner can only update their own vehicle compliance
    if (authUser.role === 'owner' && vehicle.ownerId?.toString() !== authUser.userId) {
      return NextResponse.json({ error: 'Unauthorized access to this vehicle' }, { status: 403 });
    }

    let description = 'Compliance renewed: ';
    const updates: string[] = [];

    if (result.data.pucExpiry) {
      vehicle.pucExpiry = result.data.pucExpiry;
      updates.push('PUC');
    }
    if (result.data.insuranceExpiry) {
      vehicle.insuranceExpiry = result.data.insuranceExpiry;
      updates.push('Insurance');
    }
    description += updates.join(' and ');

    await vehicle.save();

    await ServiceRecord.create({
      vehicleId: vehicle._id,
      type: 'compliance_renewal',
      description,
      cost: 0,
      garageName: 'Self-updated',
      odometerAtService: vehicle.odometerReading,
      loggedBy: authUser.userId,
      date: new Date()
    });

    const updatedVehicle = vehicle.toObject();
    return NextResponse.json({
      vehicle: {
        ...updatedVehicle,
        pucStatus: getComplianceStatus(updatedVehicle.pucExpiry),
        insuranceStatus: getComplianceStatus(updatedVehicle.insuranceExpiry),
      }
    });
  } catch (error: any) {
    console.error('Update compliance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
