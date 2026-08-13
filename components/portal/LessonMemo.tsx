type Row = { id: string; file_name: string | null; created_at: string; content_type?: string | null }

/**
 * Teacher voice memos are audio attachments; documents are everything else.
 *
 * This file used to export a LessonMemo block that rendered inside the recap's
 * tabs — recorder and all, on the published page. The memo lives in the page
 * header now (MemoPlayer), and recording belongs to review/edit, so only the
 * classifier survives. Both the file drawer and the header read it, which is
 * what keeps a memo out of the general file list.
 */
export const isMemo = (f: Row) => (f.content_type ?? '').startsWith('audio/')
