import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { loginSchema } from '@/lib/validations';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: (result.error as any).errors[0].message }, { status: 400 });
    }
    
    const { email, password } = result.data;
    
    await dbConnect();
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Compare password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Generate token
    const token = signToken(user._id.toString(), user.role);
    
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    
    // Set cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });
    
    return response;
    
  } catch (error: any) {
    console.error('Login error:', error);
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
