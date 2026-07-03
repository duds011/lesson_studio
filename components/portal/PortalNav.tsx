'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type NavLink = { href: string; label: string }

export default function PortalNav({
  brand,
  email,
  links,
}: {
  brand: string
  email: string
  links: NavLink[]
}) {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="portal-header">
      <div className="portal-header-inner">
        <div className="logo">
          <span className="mark"><span style={{ fontSize: 15 }}>📚</span></span>
          <span className="brand-word">
            {brand}
            <small>{email}</small>
          </span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + '/')
            return (
              <Link
                key={l.href}
                href={l.href}
                className="btn btn-ghost btn-sm"
                style={active ? { borderColor: 'var(--brand)', color: 'var(--brand)', background: 'var(--brand-soft)' } : undefined}
              >
                {l.label}
              </Link>
            )
          })}
          <button onClick={signOut} className="btn btn-ghost btn-sm" style={{ marginLeft: 4 }}>
            Sign out
          </button>
        </nav>
      </div>
    </header>
  )
}
