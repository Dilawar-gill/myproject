import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import puppeteer from 'puppeteer';
import { TAX_RATES, Province } from '@/types';
import type { Invoice, Company, Client, InvoiceItem } from '@prisma/client';

type InvoiceWithRelations = Invoice & {
  company: Company;
  client: Client;
  items: InvoiceItem[];
};

// Generate bilingual PDF HTML for Quebec, English-only for other provinces
function generateInvoiceHTML(invoice: InvoiceWithRelations) {
  const { company, client, items } = invoice;
  const isQuebec = invoice.province === 'QC';
  const taxInfo = TAX_RATES[invoice.province as Province];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
    .logo { max-width: 150px; max-height: 80px; }
    .company-info { text-align: right; }
    .invoice-title { font-size: 32px; font-weight: bold; color: #333; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #666; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f5f5f5; padding: 12px; text-align: left; font-weight: bold; border-bottom: 2px solid #333; }
    td { padding: 10px; border-bottom: 1px solid #ddd; }
    .text-right { text-align: right; }
    .totals { margin-top: 30px; margin-left: auto; width: 300px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .totals-row.total { font-size: 20px; font-weight: bold; border-top: 2px solid #333; padding-top: 12px; margin-top: 8px; }
    .notes { margin-top: 40px; padding: 20px; background: #f9f9f9; border-left: 4px solid #333; }
    ${isQuebec ? '.bilingual { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }' : ''}
    ${isQuebec ? '.lang-en { border-right: 1px solid #ddd; padding-right: 10px; }' : ''}
  </style>
</head>
<body>
  <div class="header">
    <div>
      ${company.logo ? `<img src="${company.logo}" class="logo" alt="Logo" />` : ''}
      <div style="margin-top: 10px;">
        <strong>${company.name}</strong><br/>
        ${company.address}<br/>
        ${company.phone || ''}<br/>
        ${company.email || ''}<br/>
        ${company.website || ''}
      </div>
    </div>
    <div class="company-info">
      <div class="invoice-title">${isQuebec ? 'INVOICE / FACTURE' : 'INVOICE'}</div>
      <div style="margin-top: 10px;">
        <strong>${isQuebec ? 'Invoice # / Facture #' : 'Invoice #'}:</strong> ${invoice.invoiceNumber}<br/>
        <strong>${isQuebec ? 'Date / Date' : 'Date'}:</strong> ${new Date(invoice.date).toLocaleDateString()}<br/>
        ${invoice.dueDate ? `<strong>${isQuebec ? 'Due Date / Date d\'échéance' : 'Due Date'}:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}<br/>` : ''}
      </div>
    </div>
  </div>

  <div class="info-grid">
    <div class="section">
      <div class="section-title">${isQuebec ? 'BILL TO / FACTURER À' : 'BILL TO'}</div>
      <strong>${client.name}</strong><br/>
      ${client.address || ''}<br/>
      ${client.phone || ''}<br/>
      ${client.email || ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>${isQuebec ? 'Description / Description' : 'Description'}</th>
        <th class="text-right">${isQuebec ? 'Qty / Qté' : 'Quantity'}</th>
        <th class="text-right">${isQuebec ? 'Unit Price / Prix unitaire' : 'Unit Price'}</th>
        <th class="text-right">${isQuebec ? 'Discount / Rabais' : 'Discount'}</th>
        <th class="text-right">${isQuebec ? 'Total / Total' : 'Total'}</th>
      </tr>
    </thead>
    <tbody>
      ${items.map(item => `
        <tr>
          <td>${item.description || 'No description'}</td>
          <td class="text-right">${item.quantity}</td>
          <td class="text-right">$${item.unitPrice.toFixed(2)}</td>
          <td class="text-right">$${item.discount.toFixed(2)}</td>
          <td class="text-right">$${item.totalPrice.toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>${isQuebec ? 'Subtotal / Sous-total' : 'Subtotal'}:</span>
      <span>$${invoice.subtotal.toFixed(2)}</span>
    </div>
    <div class="totals-row">
      <span>${isQuebec ? `${taxInfo.name} / ${taxInfo.nameFr}` : taxInfo.name} (${(invoice.taxRate * 100).toFixed(2)}%):</span>
      <span>$${invoice.taxAmount.toFixed(2)}</span>
    </div>
    <div class="totals-row total">
      <span>${isQuebec ? 'TOTAL / TOTAL' : 'TOTAL'}:</span>
      <span>$${invoice.total.toFixed(2)}</span>
    </div>
  </div>

  ${invoice.notes ? `
    <div class="notes">
      <strong>${isQuebec ? 'Notes / Notes' : 'Notes'}:</strong><br/>
      ${invoice.notes}
    </div>
  ` : ''}
</body>
</html>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const invoiceId = body?.invoiceId;

    if (!invoiceId || typeof invoiceId !== 'string') {
      return NextResponse.json({ error: 'Invalid invoice ID' }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { company: true, client: true, items: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    console.log('[PDF] Invoice items:', JSON.stringify(invoice.items, null, 2));
    
    const html = generateInvoiceHTML(invoice);

    const browser = await puppeteer.launch({ 
      headless: true, 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({ format: 'A4', printBackground: true });

      return new NextResponse(Buffer.from(pdf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
        },
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('[PDF] Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
