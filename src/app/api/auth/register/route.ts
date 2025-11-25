import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    // check existing
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'User exists' }, { status: 409 })

    const user = await db.user.create({ data: { email, passwordHash: hashPassword(password), name } })

    const token = signToken({ id: user.id, email: user.email, role: user.role })

    const res = NextResponse.json({ ok: true })
    res.cookies.set({ name: 'invoice_token', value: token, httpOnly: true, path: '/' })
    return res
  } catch (err) {
    console.error('Register error', err)
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
  }
}
