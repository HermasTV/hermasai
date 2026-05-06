import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

const causeLabels: Record<string, string> = {
  airstrike: 'Airstrike',
  shelling: 'Artillery / Shelling',
  gunshot: 'Gunshot',
  explosion: 'Explosion',
  targeted: 'Targeted Killing',
  torture: 'Torture',
  'medical-neglect': 'Medical Neglect',
  starvation: 'Starvation',
  other: 'Other',
}

export default async function VictimProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'victim-profiles',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })

  if (!docs.length) notFound()

  const p = docs[0]

  // Picture URL
  const pictureUrl =
    p.picture && typeof p.picture === 'object' && 'url' in p.picture
      ? (p.picture as { url: string }).url
      : null

  // Related victims
  const related = Array.isArray(p.relatedVictims)
    ? p.relatedVictims.filter((v): v is NonNullable<typeof v> => typeof v === 'object')
    : []

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: "'Inter', 'Noto Kufi Arabic', sans-serif" }}>

      {/* ── Notch navbar (same as visualization page) ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 44, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)',
        backdropFilter: 'blur(8px)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.75, textDecoration: 'none' }}>
          <img src="/i-am-not-a-number/Handala.png" alt="Handala" style={{ height: 22, filter: 'invert(1)' }} />
          <span style={{ fontSize: '0.7rem', letterSpacing: '0.12em', color: '#fff', fontWeight: 400, textTransform: 'uppercase' }}>
            hermas.ai
          </span>
        </Link>
        <Link
          href="/projects/i-am-not-a-number"
          style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}
        >
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Memorial
        </Link>
      </div>

      {/* ── Hero ── */}
      <div style={{ paddingTop: 44, position: 'relative' }}>
        {pictureUrl ? (
          <div style={{ position: 'relative', width: '100%', height: '60vh', maxHeight: 500, overflow: 'hidden' }}>
            <img
              src={pictureUrl}
              alt={p.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', filter: 'brightness(0.55)' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, #000 100%)' }} />
            <div style={{ position: 'absolute', bottom: 32, left: 0, right: 0, textAlign: 'center', padding: '0 24px' }}>
              <Name name={p.name} arabicName={p.arabicName} />
            </div>
          </div>
        ) : (
          <div style={{ paddingTop: 80, paddingBottom: 40, textAlign: 'center', background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.04) 0%, transparent 70%)' }}>
            {/* Stylised silhouette */}
            <svg width={80} height={120} viewBox="0 0 40 60" fill="rgba(255,255,255,0.15)" style={{ marginBottom: 24 }}>
              {p.sex === 'f' ? (
                <>
                  <circle cx="20" cy="8" r="7" />
                  <path d="M13 17 Q11 22 12 28 Q14 32 15 34 L25 34 Q26 32 28 28 Q29 22 27 17 Z" />
                  <path d="M15 34 Q8 42 9 52 L31 52 Q32 42 25 34 Z" />
                  <path d="M13 18 Q7 26 9 34 L12 34 Q10 26 15 20 Z" />
                  <path d="M27 18 Q33 26 31 34 L28 34 Q30 26 25 20 Z" />
                </>
              ) : (
                <>
                  <circle cx="20" cy="10" r="7" />
                  <path d="M12 20 Q11 28 13 34 L15 38 L25 38 L27 34 Q29 28 28 20 Z" />
                  <path d="M12 20 Q7 28 9 36 L12 36 Q10 28 15 22 Z" />
                  <path d="M28 20 Q33 28 31 36 L28 36 Q30 28 25 22 Z" />
                  <path d="M15 38 Q14 46 13 54 L17 54 Q18 46 20 38 Z" />
                  <path d="M25 38 Q26 46 27 54 L23 54 Q22 46 20 38 Z" />
                </>
              )}
            </svg>
            <Name name={p.name} arabicName={p.arabicName} />
          </div>
        )}
      </div>

      {/* ── Key facts strip ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0, borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)', margin: '0', background: 'rgba(255,255,255,0.02)' }}>
        {p.age && <Fact label="Age" value={p.age} />}
        {p.killDate && <Fact label="Date of Death" value={new Date(p.killDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />}
        {p.location && <Fact label="Location" value={p.location} />}
        {p.occupation && <Fact label="Occupation" value={p.occupation} />}
        {p.neighborhood && <Fact label="Neighborhood" value={p.neighborhood} />}
        {p.causeOfDeath && <Fact label="Cause of Death" value={causeLabels[p.causeOfDeath] ?? p.causeOfDeath} highlight />}
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Circumstances */}
        {p.circumstances && (
          <Section title="What Happened">
            <p style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.75)', fontSize: '1rem' }}>{p.circumstances}</p>
          </Section>
        )}

        {/* Story */}
        {p.story && (
          <Section title="Their Story">
            <RichText content={p.story} />
          </Section>
        )}

        {/* Family */}
        {(p.relativesKilledCount || p.familyNote || related.length > 0) && (
          <Section title="Family">
            {!!p.relativesKilledCount && p.relativesKilledCount > 0 && (
              <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
                <strong style={{ color: '#fff', fontSize: '1.5rem' }}>{p.relativesKilledCount}</strong>
                {' '}family member{p.relativesKilledCount !== 1 ? 's' : ''} also killed.
              </p>
            )}
            {p.familyNote && (
              <p style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.75)', marginBottom: 16 }}>{p.familyNote}</p>
            )}
            {related.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                {related.map((v) => (
                  <Link
                    key={v.id}
                    href={`/projects/i-am-not-a-number/profile/${(v as { slug?: string }).slug ?? ''}`}
                    style={{
                      padding: '8px 14px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 6,
                      color: 'rgba(255,255,255,0.8)',
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      transition: 'border-color 0.2s, color 0.2s',
                    }}
                  >
                    {(v as { name?: string }).name ?? 'Unknown'}
                  </Link>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* Sources */}
        {Array.isArray(p.sources) && p.sources.length > 0 && (
          <Section title="Sources">
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {p.sources.map((s, i) => (
                <li key={i}>
                  <a
                    href={(s as { url: string }).url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem', textDecoration: 'underline', textUnderlineOffset: 3 }}
                  >
                    {(s as { label: string }).label}
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Back to memorial */}
        <div style={{ marginTop: 56, textAlign: 'center' }}>
          <Link
            href="/projects/i-am-not-a-number"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem',
              letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 20px',
            }}
          >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx={12} cy={12} r={10} /><path d="M12 8v4M12 16h.01" />
            </svg>
            Find their light in the memorial
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Name({ name, arabicName }: { name: string; arabicName?: string | null }) {
  return (
    <div>
      <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 300, letterSpacing: '0.05em', marginBottom: 8, lineHeight: 1.2 }}>
        {name}
      </h1>
      {arabicName && (
        <p dir="rtl" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.5rem)', fontWeight: 300, opacity: 0.6, fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
          {arabicName}
        </p>
      )}
    </div>
  )
}

function Fact({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ padding: '16px 28px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.4, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '0.95rem', fontWeight: 500, color: highlight ? 'rgba(255,180,180,0.9)' : '#fff' }}>{value}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.35, marginBottom: 20, fontWeight: 400 }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function RichText({ content }: { content: unknown }) {
  // Lexical JSON → plain paragraph rendering (no external dep needed for basic text)
  if (!content || typeof content !== 'object') return null
  const root = (content as { root?: { children?: unknown[] } }).root
  if (!root?.children) return null

  return (
    <div style={{ lineHeight: 1.8, color: 'rgba(255,255,255,0.75)', fontSize: '1rem' }}>
      {root.children.map((node: unknown, i: number) => {
        const n = node as { type?: string; children?: { text?: string; bold?: boolean; italic?: boolean }[] }
        if (n.type === 'paragraph') {
          return (
            <p key={i} style={{ marginBottom: 16 }}>
              {n.children?.map((child, j) => {
                let el: React.ReactNode = child.text ?? ''
                if (child.bold) el = <strong key={j}>{el}</strong>
                if (child.italic) el = <em key={j}>{el}</em>
                return el
              })}
            </p>
          )
        }
        if (n.type === 'heading') {
          return <h3 key={i} style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8, marginTop: 24 }}>{n.children?.map(c => c.text).join('')}</h3>
        }
        return null
      })}
    </div>
  )
}
