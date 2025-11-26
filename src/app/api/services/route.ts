import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ServiceCategory } from '@prisma/client';

interface CreateServiceRequest {
  nameEn: string;
  nameFr?: string;
  defaultPrice: number;
  category: ServiceCategory;
}

export async function GET() {
  try {
    const services = await prisma.service.findMany({ orderBy: { category: 'asc' } });
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data: CreateServiceRequest = await req.json();
    
    if (!data.nameEn || data.defaultPrice === undefined || !data.category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const service = await prisma.service.create({ data });
    return NextResponse.json(service);
  } catch (error) {
    console.error('[POST /api/services] Error:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
