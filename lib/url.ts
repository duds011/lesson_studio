import { NextRequest } from 'next/server'

/**
 * Public base URL of the app, honoring ngrok / proxy forwarding headers.
 * Behind ngrok, req.url's host is "localhost:3000" but the browser is on the
 * https ngrok domain — so we must rebuild redirects from the forwarded headers,
 * or the browser gets bounced to https://localhost (SSL error).
 */
export function publicBase(req: NextRequest): string {
  const proto = req.headers.get('x-forwarded-proto') || 'http'
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000'
  return `${proto}://${host}`
}
