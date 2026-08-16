import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const user = await User.findById(authUser.userId).select('-passwordHash');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
    
  } catch (error: any) {
    console.error('Get me error:', error);
    const errorMessage = error instanceof Error ? error.message : '';
    if (
      errorMessage.includes('Database connection failed') ||
      errorMessage.includes('MONGODB_URI') ||
      error.name === 'MongoServerSelectionError' ||
      error.name === 'MongooseServerSelectionError'
    ) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
