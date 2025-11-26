export function safeToBase64(input: string | Uint8Array): string {
  if (typeof input === 'string') return Buffer.from(input).toString('base64');
  return Buffer.from(input).toString('base64');
}
