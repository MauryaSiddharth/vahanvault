import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import qrcode from 'qrcode';
import dbConnect from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import { getAuthUser } from '@/lib/auth';
import { vehicleSchema } from '@/lib/validations';
import { getComplianceStatus } from '@/lib/compliance';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = vehicleSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    await dbConnect();
    
    const existingVehicle = await Vehicle.findOne({ regNumber: result.data.regNumber.toUpperCase() });
    if (existingVehicle) {
      return NextResponse.json({ error: 'Vehicle with this registration number already exists' }, { status: 400 });
    }

    const vehicleId = uuidv4();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const qrCodeDataUrl = await qrcode.toDataURL(`${baseUrl}/v/${vehicleId}`);

    const vehicle = await Vehicle.create({
      ...result.data,
      regNumber: result.data.regNumber.toUpperCase(),
      vehicleId,
      qrCode: qrCodeDataUrl,
      ownerId: authUser.userId
    });

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (error: any) {
    console.error('Create vehicle error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Mechanics/Admins can see all vehicles, Owners see only their own
    const query = authUser.role === 'owner' ? { ownerId: authUser.userId } : {};
    const vehicles = await Vehicle.find(query).lean();
    
    const vehiclesWithCompliance = vehicles.map(v => {
      const pucStatus = getComplianceStatus(v.pucExpiry);
      const insuranceStatus = getComplianceStatus(v.insuranceExpiry);
      const soonestExpiryTime = Math.min(new Date(v.pucExpiry).getTime(), new Date(v.insuranceExpiry).getTime());
      return { ...v, pucStatus, insuranceStatus, soonestExpiryTime };
    });
    
    vehiclesWithCompliance.sort((a, b) => a.soonestExpiryTime - b.soonestExpiryTime);
    return NextResponse.json({ vehicles: vehiclesWithCompliance });
  } catch (error: any) {
    console.error('Get vehicles error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
