import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

interface CreateUserRequest {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
  companyId?: string;
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, companyId: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateUserRequest = await req.json();
    const { email, password, name, role, companyId } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: { 
        email, 
        passwordHash, 
        name: name || null, 
        role: role || UserRole.USER,
        companyId: companyId || null
      },
      select: { id: true, email: true, name: true, role: true, companyId: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('[POST /api/users] Error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
