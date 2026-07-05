import { METHOD_META, type PaymentMethod } from '@/lib/payment-methods'

/**
 * Read-only "How to pay your teacher" panel for the student portal.
 * Renders nothing when the teacher hasn't set up any methods.
 */
export default function PaymentMethodsPanel({ methods, compact = false }: { methods: PaymentMethod[]; compact?: boolean }) {
  if (!methods.length) return null

  return (
    <div className="analytics-card" style={{ padding: compact ? 16 : 18, display: 'grid', gap: 12 }}>
      <div>
        <p className="analytics-label" style={{ marginBottom: 2 }}>💳 How to pay your teacher</p>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Pick whichever works for you. Your teacher confirms once it arrives.</span>
      </div>
      <div style={{ display: 'grid', gap: 10 }}>
        {methods.map((m) => {
          const meta = METHOD_META[m.type]
          return (
            <div key={m.id} style={{ border: '1px solid var(--line)', borderRadius: 11, padding: '11px 13px', display: 'grid', gap: 4, background: 'var(--surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15 }}>{meta.icon}</span>
                <strong style={{ fontSize: 13 }}>{m.label || meta.name}</strong>
              </div>
              {meta.isLink ? (
                <a href={m.value} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: 'var(--brand)', wordBreak: 'break-all' }}>{m.value}</a>
              ) : (
                <span style={{ fontSize: 13, fontFamily: 'ui-monospace, monospace', wordBreak: 'break-all', color: 'var(--ink)' }}>{m.value}</span>
              )}
              {m.note && <span style={{ fontSize: 11, color: 'var(--muted)' }}>{m.note}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
