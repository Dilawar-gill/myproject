import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Province } from '@prisma/client';

// Generate invoice number: PREFIX-YYYYMM-XXXX
async function generateInvoiceNumber(province: Province) {
  const now = new Date();
  const month = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const counter = await prisma.invoiceCounter.upsert({
    where: { province_month: { province, month } },
    update: { counter: { increment: 1 } },
    create: { province, month, counter: 1 },
  });

  return `${province}-${month}-${String(counter.counter).padStart(4, '0')}`;
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('invoice_token')?.value;
    const companyFilter: { companyId?: string } = {};
    
    if (token) {
      const jwt = await import('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret';
      try {
        const payload = jwt.verify(token, JWT_SECRET) as { userId?: string };
        if (payload.userId) {
          const user = await prisma.user.findUnique({ where: { id: payload.userId } });
          if (user?.companyId) {
            companyFilter.companyId = user.companyId;
          }
        }
      } catch (e) {
        // Invalid token, return all invoices
      }
    }
    
    const invoices = await prisma.invoice.findMany({
      where: companyFilter,
      include: { company: true, client: true, items: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('[GET /api/invoices] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

interface CreateInvoiceRequest {
  companyId: string;
  client: { name: string; address: string; phone?: string; email?: string };
  province: Province;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    totalPrice: number;
  }>;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: CreateInvoiceRequest = await req.json();
    const { companyId, client, province, items, subtotal, taxRate, taxAmount, total, notes } = body;
    
    if (!companyId || !client?.name || !province || !items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('[INVOICE API] Received items:', JSON.stringify(items, null, 2));

    // Create or find client
    let clientRecord = await prisma.client.findFirst({ where: { name: client.name } });
    if (!clientRecord) {
      clientRecord = await prisma.client.create({ data: client });
    }

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(province);

    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        date: new Date(),
        companyId,
        clientId: clientRecord.id,
        province,
        subtotal,
        taxRate,
        taxAmount,
        total,
        notes: notes || null,
        items: {
          create: items.map((item) => ({
            description: item.description || '',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: { company: true, client: true, items: true },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('[POST /api/invoices] Error:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
