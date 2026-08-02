/**
 * Which teacher's data the current work belongs to.
 *
 * Every runtime doc (Google token, Zoom token, bots, recaps, settings,
 * availability) is namespaced per teacher. Most code runs inside a request
 * that has a teacher session, so the id is resolved from that automatically.
 *
 * Contexts with no session — the daily cron, the public booking page — must
 * say who they are acting for by wrapping their work in `runAsTeacher`.
 * Anything that reaches the store without either will throw rather than
 * silently read or write another teacher's data.
 */
import { AsyncLocalStorage } from 'node:async_hooks'

const storage = new AsyncLocalStorage<string>()

/** Run `fn` with an explicit teacher id in scope. */
export function runAsTeacher<T>(teacherId: string, fn: () => Promise<T>): Promise<T> {
  return storage.run(teacherId, fn)
}

/** The explicitly-scoped teacher id, if we are inside `runAsTeacher`. */
export function scopedTeacherId(): string | undefined {
  return storage.getStore()
}
