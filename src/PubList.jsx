import { googleMapsPlaceUrl } from './lib/maps.js'

export default function PubList({ pubs, legByPubId, hasKey, onMove, onRemove }) {
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
            />
          ))}
        </ol>
      )}
    </section>
  )
}

function PubCard({ pub, index, isFirst, isLast, leg, hasKey, onMove, onRemove }) {
  return (
    <li className="overflow-hidden rounded-2xl border border-pub-green/20 bg-card shadow-sm">
      <div className="flex gap-3 p-3.5">
        <div className="flex flex-col items-center gap-1.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pub-green text-base font-bold text-white shadow">
            {index + 1}
          </span>
          <div className="flex flex-col leading-none">
            <button
              type="button"
              aria-label="Move up"
              disabled={isFirst}
              onClick={() => onMove(pub.id, -1)}
              className="px-1 py-0.5 text-xs text-ink/40 disabled:opacity-20"
            >
              ▲
            </button>
            <button
              type="button"
              aria-label="Move down"
              disabled={isLast}
              onClick={() => onMove(pub.id, 1)}
              className="px-1 py-0.5 text-xs text-ink/40 disabled:opacity-20"
            >
              ▼
            </button>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg font-bold leading-tight text-pub-green underline decoration-pub-green/30 underline-offset-2">
              {pub.name}
            </h3>
            <button
              type="button"
              aria-label={`Remove ${pub.name}`}
              onClick={() => onRemove(pub.id)}
              className="-mr-1 shrink-0 rounded-full px-1.5 text-xl leading-none text-ink/30 hover:text-red-500"
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
            <p className="mt-2 text-sm leading-snug text-ink/75">
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
            className="h-20 w-20 shrink-0 rounded-xl object-cover"
          />
        )}
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
