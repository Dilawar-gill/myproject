import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret';

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    console.log('[LOGIN] body received →', { email: body.email, password: body.password });
    
    // Normalize email (trim + lowercase)
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    // Validate input
    if (!email || !password) {
      console.log('[LOGIN] validation failed - missing email or password');
      return NextResponse.json({ message: 'Email and password required' }, { status: 400 });
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        name: true,
        role: true,
        companyId: true
      }
    });
    console.log('[LOGIN] prisma returned →', user ? { id: user.id, email: user.email, hasHash: !!user.passwordHash } : null);
    
    // Check if user exists
    if (!user) {
      console.log('[LOGIN] no user found - sending 401');
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Compare password with bcrypt
    const isValid = await bcrypt.compare(password, user.passwordHash);
    console.log('[LOGIN] bcrypt compare →', isValid);
    
    // Check if password is valid
    if (!isValid) {
      console.log('[LOGIN] password mismatch - sending 401');
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
    
    console.log('[LOGIN] authentication successful');

    // Generate JWT token with userId and role
    const token = jwt.sign(
      { userId: user.id, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );

    // Return success response with token and user data
    const response = NextResponse.json({ 
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        role: user.role
      } 
    });
    
    // Set HTTP-only cookie for additional security
    response.cookies.set('invoice_token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;
  } catch (error: any) {
    // Log error and return 500
    console.error('❌ Login error:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
