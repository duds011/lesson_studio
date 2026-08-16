import Link from 'next/link'
import { invitePreview } from '@/app/actions/join'
import { createClient } from '@/lib/supabase/server'
import JoinCard from '@/components/portal/JoinCard'

// Public by design — this is the one page a student reaches before they have
// an account, so it is deliberately outside the middleware matcher.
export const dynamic = 'force-dynamic'

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const invite = await invitePreview(code)

  // A spent, revoked or mistyped link are all the same answer — a page that
  // distinguished them would tell a stranger which codes are real.
  if (!invite) {
    return (
      <main className="k-join">
        <div className="k-join-card k-join-in">
          <div className="k-join-mark" aria-hidden>✉️</div>
          <h1>This link isn’t valid</h1>
          <p>It may have already been used, or your teacher may have replaced it. Ask them for a fresh one.</p>
          <Link href="/login" className="k-join-btn k-join-btn-quiet">Go to sign in</Link>
        </div>
      </main>
    )
  }

  // Already signed in as a student → they can attach this to the account they
  // have, instead of being told their email is taken by themselves.
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <JoinCard code={code} invite={invite} signedInAs={user?.email ?? null} />
}
