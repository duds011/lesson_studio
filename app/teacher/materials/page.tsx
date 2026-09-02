import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { listMaterials } from '@/app/actions/materials'
import MaterialsManager from '@/components/portal/MaterialsManager'
import PageHeader from '@/components/PageHeader'

export const dynamic = 'force-dynamic'

export default async function MaterialsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const materials = await listMaterials()
  const used = materials.reduce((n, m) => n + (m.use_count || 0), 0)

  return (
    <div className="k-page" style={{ display: 'grid', gap: 16 }}>
      <PageHeader
        title="Materials"
        meta="Videos, articles and links you reuse — attach them to a recap in two clicks."
        figures={[
          { label: 'Saved', value: materials.length },
          { label: 'Times shared', value: used },
        ]}
      />
      <MaterialsManager initial={materials} />
    </div>
  )
}
