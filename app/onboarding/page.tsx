import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getToken } from '@/lib/store'
import { zoomConnection } from '@/lib/zoom'
import { resolveBrand } from '@/lib/brand'
import OnboardingFlow from '@/components/OnboardingFlow'

export const dynamic = 'force-dynamic'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, teaching_language, timezone, meeting_platform, onboarding_step, onboarding_completed_at, brand')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'teacher') redirect('/student/dashboard')
  // Already set up — nothing to do here.
  if (profile?.onboarding_completed_at) redirect('/')

  const token = await getToken()
  let zoomConnected = false
  try { zoomConnected = Boolean((await zoomConnection())?.connected) } catch { /* optional */ }

  return (
    <OnboardingFlow
      initial={{
        fullName: profile.full_name ?? '',
        teachingLanguage: profile.teaching_language ?? null,
        timezone: profile.timezone ?? 'Asia/Tokyo',
        meetingPlatform: (profile.meeting_platform === 'zoom' ? 'zoom' : 'google_meet'),
        step: profile.onboarding_step ?? 0,
        brand: resolveBrand(profile.brand),
      }}
      googleConnected={Boolean(token)}
      zoomConnected={zoomConnected}
    />
  )
}
