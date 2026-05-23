import { useEffect, useState } from 'react'
import { googleMapsPlaceUrl } from './lib/maps.js'

const STATUS_STYLE = {
  upcoming: {
    pillBg: 'bg-ink/5 text-ink/70',
    pillLabel: 'Upcoming · tap when you arrive',
    cardBorder: 'border-pub-green/20',
    cardBg: 'bg-card',
    number: 'bg-pub-green text-white',
    titleClass: 'text-pub-green',
  },
  current: {
    pillBg: 'bg-sun text-white',
    pillLabel: '📍 Here now · tap when leaving',
    cardBorder: 'border-sun',
    cardBg: 'bg-amber-50',
    number: 'bg-sun text-white',
    titleClass: 'text-pub-green-deep',
  },
  done: {
    pillBg: 'bg-pub-green/15 text-pub-green-deep',
    pillLabel: '✓ Done · tap to undo',
    cardBorder: 'border-pub-green/15',
    cardBg: 'bg-card/70',
    number: 'bg-pub-green/40 text-white',
    titleClass: 'text-ink/55',
  },
}

export default function PubList({
  pubs,
  legByPubId,
  hasKey,
  onMove,
  onRemove,
  onCycleVisit,
  onSetNote,
}) {
  return (
    <section className="mt-5">
      <h2 className="px-1 pb-2 font-display text-lg font-bold text-ink">
        The route
      </h2>
      {pubs.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink/25 p-6 text-center text-sm text-ink/55">
          No stops yet — add one below.
        </p>
      ) : (
        <ol className="space-y-3">
          {pubs.map((pub, i) => (
            <PubCard
              key={pub.id}
              pub={pub}
              index={i}
              isFirst={i === 0}
              isLast={i === pubs.length - 1}
              leg={legByPubId[pub.id]}
              hasKey={hasKey}
              onMove={onMove}
              onRemove={onRemove}
              onCycleVisit={onCycleVisit}
              onSetNote={onSetNote}
            />
          ))}
        </ol>
      )}
    </section>
  )
}

function PubCard({
  pub,
  index,
  isFirst,
  isLast,
  leg,
  hasKey,
  onMove,
  onRemove,
  onCycleVisit,
  onSetNote,
}) {
  const visit = pub.visitStatus ?? 'upcoming'
  const style = STATUS_STYLE[visit] ?? STATUS_STYLE.upcoming
  const isDone = visit === 'done'

  return (
    <li
      className={`overflow-hidden rounded-2xl border-2 ${style.cardBorder} ${style.cardBg} shadow-sm transition-colors`}
    >
      <div className="flex gap-3 p-3.5">
        <div className="flex flex-col items-center gap-2">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold shadow ${style.number}`}
          >
            {isDone ? '✓' : index + 1}
          </span>
          <div className="flex flex-col leading-none">
            <button
              type="button"
              aria-label="Move up"
              disabled={isFirst}
              onClick={() => onMove(pub.id, -1)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-sm text-ink/50 hover:bg-ink/5 active:bg-ink/10 disabled:opacity-20 disabled:hover:bg-transparent"
            >
              ▲
            </button>
            <button
              type="button"
              aria-label="Move down"
              disabled={isLast}
              onClick={() => onMove(pub.id, 1)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-sm text-ink/50 hover:bg-ink/5 active:bg-ink/10 disabled:opacity-20 disabled:hover:bg-transparent"
            >
              ▼
            </button>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`font-display text-lg font-bold leading-tight underline decoration-pub-green/30 underline-offset-2 ${style.titleClass} ${isDone ? 'line-through decoration-ink/30' : ''}`}
            >
              {pub.name}
            </h3>
            <button
              type="button"
              aria-label={`Remove ${pub.name}`}
              onClick={() => onRemove(pub.id)}
              className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl leading-none text-ink/30 hover:bg-red-50 hover:text-red-500 active:bg-red-100"
            >
              ×
            </button>
          </div>

          {pub.garden && (
            <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-leaf/15 px-2.5 py-0.5 text-xs font-semibold text-pub-green-deep">
              <span className="h-1.5 w-1.5 rounded-full bg-leaf" />
              {pub.garden}
            </span>
          )}

          {pub.description && (
            <p
              className={`mt-2 text-sm leading-snug ${isDone ? 'text-ink/45' : 'text-ink/75'}`}
            >
              {pub.description}
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            {pub.placeId && (
              <a
                href={googleMapsPlaceUrl(pub)}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-pub-green"
              >
                Open in Maps ↗
              </a>
            )}
            {pub.status === 'failed' && (
              <span className="font-medium text-amber-600">
                Couldn't locate — remove and search to replace
              </span>
            )}
            {hasKey && pub.status === 'pending' && !pub.location && (
              <span className="text-ink/45">Locating…</span>
            )}
          </div>
        </div>

        {pub.photoUri && (
          <img
            src={pub.photoUri}
            alt={pub.name}
            loading="lazy"
            className={`h-20 w-20 shrink-0 rounded-xl object-cover ${isDone ? 'opacity-50' : ''}`}
          />
        )}
      </div>

      <div className="border-t border-pub-green/10 px-3.5 pt-2.5 pb-3">
        <button
          type="button"
          onClick={() => onCycleVisit(pub.id)}
          className={`w-full rounded-xl py-2.5 text-sm font-semibold transition-colors ${style.pillBg}`}
        >
          {style.pillLabel}
        </button>
        <NoteField pub={pub} onSetNote={onSetNote} />
      </div>

      {!isLast && (
        <div className="flex items-center gap-1.5 border-t border-pub-green/15 bg-cream/40 px-3.5 py-1.5 text-xs text-ink/65">
          <span className="font-bold text-pub-green">↓</span>
          {leg
            ? `${leg.durationText} walk to the next stop`
            : 'Walking time loads with the map'}
        </div>
      )}
    </li>
  )
}

// Per-pub shared note. Synced with whatever's in the pub state, but only
// committed on blur so we don't push a Firebase write per keystroke.
function NoteField({ pub, onSetNote }) {
  const [local, setLocal] = useState(pub.note ?? '')

  useEffect(() => {
    setLocal(pub.note ?? '')
  }, [pub.note])

  function commit() {
    const trimmed = local.trim()
    if (trimmed !== (pub.note ?? '')) {
      onSetNote(pub.id, trimmed)
    }
  }

  return (
    <input
      type="text"
      value={local}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
      }}
      placeholder="Add a note (round's on Tom, meet at the bar…)"
      className="mt-2 w-full rounded-lg border border-ink/15 bg-card/80 px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:border-pub-green focus:outline-none"
    />
  )
}
