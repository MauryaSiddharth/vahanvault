import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import ServiceRecord from '@/models/ServiceRecord';
import { getAuthUser } from '@/lib/auth';
import { serviceRecordSchema } from '@/lib/validations';

export async function POST(
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
    const result = serviceRecordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    await dbConnect();
    const vehicle = await Vehicle.findOne({ vehicleId });
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Owner can only add records to their own vehicle
    if (authUser.role === 'owner' && vehicle.ownerId?.toString() !== authUser.userId) {
      return NextResponse.json({ error: 'Unauthorized access to this vehicle' }, { status: 403 });
    }

    const record = await ServiceRecord.create({
      ...result.data,
      vehicleId: vehicle._id,
      loggedBy: authUser.userId
    });

    if (result.data.odometerAtService > vehicle.odometerReading) {
      vehicle.odometerReading = result.data.odometerAtService;
      await vehicle.save();
    }

    return NextResponse.json({ record }, { status: 201 });
  } catch (error: any) {
    console.error('Create record error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    const vehicle = await Vehicle.findOne({ vehicleId });
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    if (authUser.role === 'owner' && vehicle.ownerId?.toString() !== authUser.userId) {
      return NextResponse.json({ error: 'Unauthorized access to this vehicle' }, { status: 403 });
    }

    const records = await ServiceRecord.find({ vehicleId: vehicle._id })
      .sort({ date: -1 })
      .lean();

    return NextResponse.json({ records });
  } catch (error: any) {
    console.error('Get records error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
