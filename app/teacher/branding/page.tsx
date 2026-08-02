import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { resolveBrand } from '@/lib/brand'
import BrandStudio from '@/components/BrandStudio'

export const dynamic = 'force-dynamic'

export default async function BrandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, brand')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <header className="k-thead">
        <div>
          <span className="k-phead-eyebrow">Teacher</span>
          <h1>Student view</h1>
          <p>Customise what your students see when they sign in — colour, wording, and which sections appear. Changes preview instantly and publish when you save.</p>
        </div>
        <div className="k-hero-art" style={{ right: -30, opacity: .45 }} aria-hidden>
          <span className="k-crystal" style={{ width: 54, height: 64, right: 26, top: 16 }} />
          <span className="k-ring" style={{ width: 44, height: 44, right: 96, top: 80 }} />
        </div>
      </header>

      <BrandStudio initial={resolveBrand(profile?.brand)} teacherName={(profile?.full_name ?? '').split(' ')[0]} />
    </div>
  )
}
