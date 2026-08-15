import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import { getAuthUser } from '@/lib/auth';
import { getComplianceStatus } from '@/lib/compliance';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const query = authUser.role === 'owner' ? { ownerId: authUser.userId } : {};
    const vehicles = await Vehicle.find(query).lean();
    
    const expiringVehicles = vehicles.map(v => {
      const pucStatus = getComplianceStatus(v.pucExpiry);
      const insuranceStatus = getComplianceStatus(v.insuranceExpiry);
      return { ...v, pucStatus, insuranceStatus };
    }).filter(v => 
      v.pucStatus === 'expired' || 
      v.pucStatus === 'expiring_soon' || 
      v.insuranceStatus === 'expired' || 
      v.insuranceStatus === 'expiring_soon'
    );

    return NextResponse.json({ vehicles: expiringVehicles });
  } catch (error: any) {
    console.error('Get expiring error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
