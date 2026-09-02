'use server'

/**
 * The teacher's library of links.
 *
 * Files already had a home (lesson_attachments, one lesson each). Links had
 * none — and the materials a teacher reuses are mostly links: a YouTube video,
 * an article, a worksheet on someone else's site. They were living in her
 * bookmarks and being hunted down again every time.
 */
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { previewLink, safeUrl } from '@/lib/link-preview'

type Result = { success: boolean; error?: string }

async function requireTeacher() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' as const }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'teacher') return { error: 'Unauthorized' as const }
  return { supabase, user }
}

export type Material = {
  id: string
  url: string
  title: string
  kind: string
  site: string | null
  thumbnail: string | null
  note: string | null
  tags: string[]
  use_count: number
  last_used_at: string | null
}

export async function listMaterials(): Promise<Material[]> {
  const auth = await requireTeacher()
  if ('error' in auth) return []
  const { data } = await auth.supabase
    .from('teacher_materials')
    .select('id, url, title, kind, site, thumbnail, note, tags, use_count, last_used_at')
    // What she reached for most recently, first — a library is used from the
    // top, and alphabetical would bury this month's material under 2024's.
    .eq('teacher_id', auth.user.id)
    .order('last_used_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
  return (data ?? []) as Material[]
}

/**
 * Save a pasted URL. The title and thumbnail are fetched, not typed.
 *
 * A link already in the library is not an error — it is the same material, so
 * the existing one is returned and the picker simply finds it.
 */
export async function addMaterial(rawUrl: string, note?: string): Promise<Result & { id?: string }> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }

  const u = safeUrl(rawUrl)
  if (!u) return { success: false, error: 'That does not look like a web address.' }

  const { data: dupe } = await auth.supabase
    .from('teacher_materials').select('id').eq('teacher_id', auth.user.id).eq('url', u.href).maybeSingle()
  if (dupe) return { success: true, id: dupe.id }

  const preview = await previewLink(u.href)
  if (!preview) return { success: false, error: 'That does not look like a web address.' }

  const { data, error } = await createAdminClient()
    .from('teacher_materials')
    .insert({
      teacher_id: auth.user.id,
      url: preview.url,
      title: preview.title,
      kind: preview.kind,
      site: preview.site,
      thumbnail: preview.thumbnail,
      note: note?.trim() || null,
    })
    .select('id')
    .single()
  if (error) return { success: false, error: error.message }

  revalidatePath('/teacher/materials')
  return { success: true, id: data.id }
}

/**
 * Paste a whole list at once.
 *
 * A library is worth nothing until it has things in it, and Akio's materials
 * are spread across bookmarks and documents. Fetching each title takes a
 * moment, so they are previewed a few at a time rather than all at once —
 * twenty URLs should not open twenty sockets.
 */
export async function addMaterialsBulk(text: string): Promise<Result & { added?: number; failed?: number }> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }

  const urls = Array.from(new Set(
    String(text || '').split(/[\s,]+/).map((s) => safeUrl(s)?.href).filter(Boolean) as string[],
  )).slice(0, 40)
  if (!urls.length) return { success: false, error: 'No web addresses found in that.' }

  let added = 0
  let failed = 0
  for (let i = 0; i < urls.length; i += 4) {
    const batch = await Promise.all(urls.slice(i, i + 4).map((u) => addMaterial(u)))
    for (const r of batch) r.success ? added++ : failed++
  }

  revalidatePath('/teacher/materials')
  return { success: true, added, failed }
}

export async function updateMaterial(id: string, patch: { title?: string; note?: string }): Promise<Result> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }

  const update: Record<string, unknown> = {}
  if (typeof patch.title === 'string' && patch.title.trim()) update.title = patch.title.trim().slice(0, 200)
  if (typeof patch.note === 'string') update.note = patch.note.trim() || null
  if (!Object.keys(update).length) return { success: true }

  const { error } = await auth.supabase
    .from('teacher_materials').update(update).eq('id', id).eq('teacher_id', auth.user.id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/teacher/materials')
  return { success: true }
}

export async function deleteMaterial(id: string): Promise<Result> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }

  // Lessons keep their own copy (see attachMaterial), so removing a material
  // from the library never changes a recap a student has already been sent.
  const { error } = await auth.supabase
    .from('teacher_materials').delete().eq('id', id).eq('teacher_id', auth.user.id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/teacher/materials')
  return { success: true }
}

/**
 * Put a material on a lesson.
 *
 * SNAPSHOTS it: the url, title and thumbnail are copied onto the attachment.
 * A live reference would mean editing a library entry silently rewrites what a
 * student was sent in August, which is the kind of bug nobody ever reports
 * because nobody can see it happen.
 */
export async function attachMaterial(materialId: string, lessonId: string): Promise<Result> {
  const auth = await requireTeacher()
  if ('error' in auth) return { success: false, error: auth.error }

  const { data: material } = await auth.supabase
    .from('teacher_materials').select('id, url, title, kind, thumbnail, use_count')
    .eq('id', materialId).eq('teacher_id', auth.user.id).maybeSingle()
  if (!material) return { success: false, error: 'Material not found' }

  const { data: lesson } = await auth.supabase
    .from('lessons').select('id, student_id').eq('id', lessonId).eq('teacher_id', auth.user.id).maybeSingle()
  if (!lesson) return { success: false, error: 'Lesson not found' }

  const admin = createAdminClient()
  const { data: already } = await admin
    .from('lesson_attachments').select('id').eq('lesson_id', lessonId).eq('url', material.url).maybeSingle()
  if (already) return { success: true }

  const { error } = await admin.from('lesson_attachments').insert({
    lesson_id: lessonId,
    student_id: lesson.student_id,
    uploaded_by: auth.user.id,
    url: material.url,
    kind: material.kind,
    thumbnail: material.thumbnail,
    file_name: material.title,
    content_type: 'text/uri-list',
    bucket: null,
    path: null,
  })
  if (error) return { success: false, error: error.message }

  // What she reaches for, so the picker can lead with it next time. Read and
  // written rather than incremented in SQL — a teacher does not attach the
  // same material twice at once, and the count is a sort hint, not a ledger.
  await admin
    .from('teacher_materials')
    .update({ use_count: ((material as any).use_count ?? 0) + 1, last_used_at: new Date().toISOString() })
    .eq('id', materialId)

  revalidatePath(`/teacher/students/${lesson.student_id}/lessons/${lessonId}`)
  return { success: true }
}
