import React from 'react'

type Section = { title?: string; content?: any }

const asText = (c: any) => (Array.isArray(c) ? c.join('\n') : typeof c === 'string' ? c : '')
const cleanTitle = (t: string) => t.replace(/^\s*\d+\.\s*/, '').trim()

// One-line gist of a section: first real sentence, stripped of markdown/bullets.
function firstSentence(content: any): string {
  const lines = asText(content).split('\n').map((l) => l.trim()).filter(Boolean)
  const line = lines.find((l) => !/^[-•→*]/.test(l) && !/^\*\*?pattern/i.test(l)) || lines[0] || ''
  const plain = line.replace(/\*\*?([^*]+)\*\*?/g, '$1').replace(/[#>`]/g, '').trim()
  const m = plain.match(/^[^。.!?！？]*[。.!?！？]?/)
  const sentence = (m ? m[0] : plain).trim() || plain
  return sentence.length > 110 ? sentence.slice(0, 108).trim() + '…' : sentence
}

/** Compact "at a glance" table: main topics of the lesson + a one-line note each. */
export default function LessonTopics({ sections }: { sections: Section[] }) {
  const topics = (sections || [])
    .filter((s) => s?.title && !/main corrections|refinement|takeaway/i.test(s.title))
    .map((s) => ({ topic: cleanTitle(s.title as string), note: firstSentence(s.content) }))
    .filter((t) => t.topic)

  if (topics.length === 0) return null

  return (
    <div className="topics-table">
      {topics.map((t, i) => (
        <div className="topics-row" key={i}>
          <div className="topics-topic">{t.topic}</div>
          <div className="topics-note">{t.note}</div>
        </div>
      ))}
    </div>
  )
}
