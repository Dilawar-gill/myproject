import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Province } from '@prisma/client';

interface CreateCompanyRequest {
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  province: Province;
}

export async function GET() {
  try {
    const companies = await prisma.company.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(companies);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data: CreateCompanyRequest = await req.json();
    
    if (!data.name || !data.address || !data.province) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const company = await prisma.company.create({ data });
    return NextResponse.json(company);
  } catch (error) {
    console.error('[POST /api/companies] Error:', error);
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}
