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
    .select('full_name, brand, teaching_language')
    .eq('id', user.id)
    .single()

  return (
    <BrandStudio
      initial={resolveBrand(profile?.brand)}
      teacherName={(profile?.full_name ?? '').split(' ')[0]}
      teachingLanguage={(profile as any)?.teaching_language ?? null}
    />
  )
}
