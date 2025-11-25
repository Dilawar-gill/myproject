import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  // clear cookie
  res.cookies.set({ name: 'invoice_token', value: '', httpOnly: true, path: '/', maxAge: 0 })
  return res
}
