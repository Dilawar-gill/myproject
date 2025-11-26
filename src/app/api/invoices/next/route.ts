import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Province } from '@prisma/client'

const PROVINCE_PREFIX: Record<Province, string> = {
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
    const provinceParam = (searchParams.get('province') || 'ON').toUpperCase() as Province

    if (!PROVINCE_PREFIX[provinceParam]) {
      return NextResponse.json({ error: 'Unsupported province' }, { status: 400 })
    }

    const now = new Date()
    const yyyyMM = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
    const prefix = `${PROVINCE_PREFIX[provinceParam]}-${yyyyMM}-`

    // Count existing invoices that start with the prefix
    const count = await prisma.invoice.count({ where: { invoiceNumber: { startsWith: prefix } } })
    const next = count + 1
    const invoiceNumber = `${prefix}${pad(next)}`

    return NextResponse.json({ invoiceNumber })
  } catch (error) {
    console.error('Error generating next invoice number:', error)
    return NextResponse.json({ error: 'Failed to generate invoice number' }, { status: 500 })
  }
}
