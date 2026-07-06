'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import * as Y from 'yjs'
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate, removeAwarenessStates } from 'y-protocols/awareness'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import Placeholder from '@tiptap/extension-placeholder'
import { createClient } from '@/lib/supabase/client'

const ROLE_COLOR = { teacher: '#6259e8', student: '#e8590c' } as const

// Chunked base64 <-> Uint8Array (Yjs updates are binary).
function b64encode(u: Uint8Array): string {
  let s = ''
  const CH = 0x8000
  for (let i = 0; i < u.length; i += CH) s += String.fromCharCode.apply(null, Array.from(u.subarray(i, i + CH)))
  return btoa(s)
}
function b64decode(str: string): Uint8Array {
  const bin = atob(str)
  const u = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i)
  return u
}

export default function LiveDoc({ studentId, role, name, fill }: { studentId: string; role: 'teacher' | 'student'; name: string; fill?: boolean }) {
  const ydoc = useMemo(() => new Y.Doc(), [studentId])
  const awareness = useMemo(() => new Awareness(ydoc), [ydoc])
  const color = ROLE_COLOR[role]
  const [peers, setPeers] = useState<string[]>([])
  const [status, setStatus] = useState<'connecting' | 'live'>('connecting')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ history: false }), // Yjs owns history
      Placeholder.configure({ placeholder: 'Start writing the lesson notes…' }),
      Collaboration.configure({ document: ydoc }),
      CollaborationCursor.configure({ provider: { awareness }, user: { name, color } }),
    ],
    editorProps: { attributes: { class: 'livedoc-editor' } },
  }, [ydoc])

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    // Load the persisted snapshot (merges — Yjs is a CRDT).
    supabase.from('lesson_docs').select('state').eq('student_id', studentId).maybeSingle().then(({ data }) => {
      if (!cancelled && data?.state) { try { Y.applyUpdate(ydoc, b64decode(data.state), 'remote') } catch {} }
    })

    const channel = supabase.channel(`doc:${studentId}`, { config: { broadcast: { self: false } } })

    const onLocal = (update: Uint8Array, origin: any) => {
      if (origin === 'remote') return
      channel.send({ type: 'broadcast', event: 'update', payload: { u: b64encode(update) } })
      scheduleSave()
    }
    ydoc.on('update', onLocal)

    // Awareness = live cursors + selections (who is typing, with their name/color).
    const onAware = ({ added, updated, removed }: any, origin: any) => {
      if (origin === 'remote') return
      const changed = added.concat(updated, removed)
      channel.send({ type: 'broadcast', event: 'awareness', payload: { a: b64encode(encodeAwarenessUpdate(awareness, changed)) } })
    }
    awareness.on('update', onAware)
    const broadcastAwareness = () => channel.send({ type: 'broadcast', event: 'awareness', payload: { a: b64encode(encodeAwarenessUpdate(awareness, Array.from(awareness.getStates().keys()))) } })

    const scheduleSave = () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(async () => {
        const s = b64encode(Y.encodeStateAsUpdate(ydoc))
        await supabase.from('lesson_docs').update({ state: s, updated_at: new Date().toISOString() }).eq('student_id', studentId)
      }, 1500)
    }

    channel
      .on('broadcast', { event: 'update' }, ({ payload }) => { try { Y.applyUpdate(ydoc, b64decode(payload.u), 'remote') } catch {} })
      .on('broadcast', { event: 'sync' }, ({ payload }) => { try { Y.applyUpdate(ydoc, b64decode(payload.s), 'remote') } catch {} })
      .on('broadcast', { event: 'awareness' }, ({ payload }) => { try { applyAwarenessUpdate(awareness, b64decode(payload.a), 'remote') } catch {} })
      .on('broadcast', { event: 'request' }, () => {
        channel.send({ type: 'broadcast', event: 'sync', payload: { s: b64encode(Y.encodeStateAsUpdate(ydoc)) } })
        broadcastAwareness()
      })
      .on('presence', { event: 'sync' }, () => {
        const st = channel.presenceState() as Record<string, { name: string }[]>
        setPeers(Object.values(st).flat().map((p) => p.name))
      })
      .subscribe(async (s) => {
        if (s === 'SUBSCRIBED') {
          setStatus('live')
          await channel.track({ name, role })
          channel.send({ type: 'broadcast', event: 'request', payload: {} })
          broadcastAwareness()
        }
      })

    return () => {
      cancelled = true
      ydoc.off('update', onLocal)
      awareness.off('update', onAware)
      // Tell peers our cursor is gone, then tear down.
      removeAwarenessStates(awareness, [awareness.clientID], 'local')
      broadcastAwareness()
      if (saveTimer.current) clearTimeout(saveTimer.current)
      supabase.removeChannel(channel)
    }
  }, [studentId, ydoc, awareness, role, name, color])

  const others = peers.filter((p) => p !== name)

  const Btn = ({ on, run, label }: { on: boolean; run: () => void; label: string }) => (
    <button type="button" className="livedoc-btn" data-on={on} onMouseDown={(e) => { e.preventDefault(); run() }}>{label}</button>
  )

  return (
    <div className={`livedoc${fill ? ' fill' : ''}`}>
      <div className="livedoc-bar">
        {editor && (
          <div className="livedoc-tools">
            <Btn on={editor.isActive('bold')} run={() => editor.chain().focus().toggleBold().run()} label="B" />
            <Btn on={editor.isActive('italic')} run={() => editor.chain().focus().toggleItalic().run()} label="i" />
            <Btn on={editor.isActive('heading', { level: 1 })} run={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} label="H1" />
            <Btn on={editor.isActive('heading', { level: 2 })} run={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} label="H2" />
            <Btn on={editor.isActive('bulletList')} run={() => editor.chain().focus().toggleBulletList().run()} label="• List" />
            <Btn on={editor.isActive('orderedList')} run={() => editor.chain().focus().toggleOrderedList().run()} label="1. List" />
            <Btn on={editor.isActive('blockquote')} run={() => editor.chain().focus().toggleBlockquote().run()} label="❝" />
            <Btn on={editor.isActive('codeBlock')} run={() => editor.chain().focus().toggleCodeBlock().run()} label="</>" />
          </div>
        )}
        <div className="livedoc-status">
          <span className={`status-dot ${status === 'live' ? 'online' : ''}`} />
          {others.length > 0 ? `${others.join(', ')} online` : 'Waiting for the other person…'}
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
