import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Generate invoice number: PREFIX-YYYYMM-XXXX
async function generateInvoiceNumber(province: string) {
  const now = new Date();
  const month = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const counter = await prisma.invoiceCounter.upsert({
    where: { province_month: { province: province as any, month } },
    update: { counter: { increment: 1 } },
    create: { province: province as any, month, counter: 1 },
  });

  return `${province}-${month}-${String(counter.counter).padStart(4, '0')}`;
}

export async function GET(req: NextRequest) {
  try {
    // Get current user from token
    const token = req.cookies.get('invoice_token')?.value;
    let companyFilter = {};
    
    if (token) {
      const jwt = await import('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret';
      try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        if (payload.userId) {
          const user = await prisma.user.findUnique({ where: { id: payload.userId } });
          // If user has companyId (USER role), filter by that company
          if (user?.companyId) {
            companyFilter = { companyId: user.companyId };
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
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { companyId, client, province, items, subtotal, taxRate, taxAmount, total, notes } = await req.json();
    
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
        notes,
        items: {
          create: items.map((item: any) => {
            const itemData = {
              description: item.description || '',
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
              totalPrice: item.totalPrice,
            };
            console.log('[INVOICE API] Creating item:', itemData);
            return itemData;
          }),
        },
      },
      include: { company: true, client: true, items: true },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
