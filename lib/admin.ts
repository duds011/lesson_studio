/**
 * Who may open /admin.
 *
 * An env allowlist rather than a role column: the admin is the operator of the
 * service, not a kind of user — there is exactly one today, the list changes
 * by deploy rather than by signup, and an allowlist cannot be granted to
 * anyone by a bug in signup code the way a role could.
 */
const clean = (s?: string) => (s ?? '').replace(/^﻿/, '').trim()

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  const list = clean(process.env.ADMIN_EMAILS)
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return list.includes(email.trim().toLowerCase())
}
