import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const PROVINCE_PREFIX: Record<string, string> = {
  ON: 'ON',
  QC: 'QC',
  NB: 'NB',
  NS: 'NS',
}

function pad(num: number, size = 4) {
  return String(num).padStart(size, '0')
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const province = (searchParams.get('province') || 'ON').toUpperCase()

    if (!PROVINCE_PREFIX[province]) {
      return NextResponse.json({ error: 'Unsupported province' }, { status: 400 })
    }

    const now = new Date()
    const yyyyMM = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
    const prefix = `${PROVINCE_PREFIX[province]}-${yyyyMM}-`

    // Count existing invoices that start with the prefix
    const count = await db.invoice.count({ where: { invoiceNumber: { startsWith: prefix } } })
    const next = count + 1
    const invoiceNumber = `${prefix}${pad(next)}`

    return NextResponse.json({ invoiceNumber })
  } catch (error) {
    console.error('Error generating next invoice number:', error)
    return NextResponse.json({ error: 'Failed to generate invoice number' }, { status: 500 })
  }
}
