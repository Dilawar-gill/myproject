import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface UpdateServiceRequest {
  defaultPrice: number;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body: UpdateServiceRequest = await req.json();
    
    if (body.defaultPrice === undefined) {
      return NextResponse.json({ error: 'defaultPrice is required' }, { status: 400 });
    }
    
    const service = await prisma.service.update({
      where: { id },
      data: { defaultPrice: body.defaultPrice },
    });
    return NextResponse.json(service);
  } catch (error) {
    console.error('[PUT /api/services/[id]] Error:', error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ message: 'Service deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
