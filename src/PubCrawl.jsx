import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Header from './Header.jsx'
import MapPanel from './MapPanel.jsx'
import PubList from './PubList.jsx'
import AddPub from './AddPub.jsx'
import { CLIFTON_CENTER, DEFAULT_PUBS } from './data/pubs.js'
import { loadState, saveState } from './lib/storage.js'
import { SYNC_ENABLED, subscribeCrawl, writeCrawl } from './lib/sync.js'
import { formatDistance, formatDuration, googleMapsRouteUrl } from './lib/maps.js'

function freshPubs() {
  return DEFAULT_PUBS.map((pub) => ({
    ...pub,
    status: 'pending',
    visitStatus: 'upcoming',
    note: '',
  }))
}

function nextVisitStatus(s) {
  return s === 'upcoming' ? 'current' : s === 'current' ? 'done' : 'upcoming'
}

function defaultState() {
  return { pubs: freshPubs(), removed: [] }
}

function initialState() {
  if (SYNC_ENABLED) return defaultState()
  const saved = loadState()
  if (saved && Array.isArray(saved.pubs) && saved.pubs.length) {
    return { pubs: saved.pubs, removed: saved.removed ?? [] }
  }
  return defaultState()
}

export default function PubCrawl({ placesLib, hasKey }) {
  const [{ pubs, removed }, setState] = useState(initialState)
  const [legs, setLegs] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [synced, setSynced] = useState(!SYNC_ENABLED)
  const resolving = useRef(new Set())
  const remoteUpdate = useRef(false)
  const firstSnap = useRef(true)

  // Subscribe to remote state. First snapshot seeds the app; subsequent ones
  // overwrite local state with whatever friends have changed.
  useEffect(() => {
    if (!SYNC_ENABLED) return
    return subscribeCrawl((data) => {
      const firstTime = firstSnap.current
      firstSnap.current = false
      if (firstTime && !data) {
        // Empty room — seed it with defaults so others see them too.
        writeCrawl(defaultState())
        setSynced(true)
        return
      }
      if (data) {
        remoteUpdate.current = true
        setState({
          pubs: Array.isArray(data.pubs) ? data.pubs : freshPubs(),
          removed: Array.isArray(data.removed) ? data.removed : [],
        })
      }
      setSynced(true)
    })
  }, [])

  // Persist every edit. Local edits go to Firebase (or localStorage); remote
  // updates are skipped via the remoteUpdate guard so we don't echo back.
  useEffect(() => {
    if (!synced) return
    if (SYNC_ENABLED) {
      if (remoteUpdate.current) {
        remoteUpdate.current = false
        return
      }
      writeCrawl({ pubs, removed })
    } else {
      saveState({ pubs, removed })
    }
  }, [pubs, removed, synced])

  // Resolve each pub's exact location through Google Places.
  useEffect(() => {
    if (!placesLib) return
    const targets = [...pubs, ...removed].filter(
      (p) => !p.location && p.status !== 'failed' && !resolving.current.has(p.id),
    )
    if (targets.length === 0) return
    targets.forEach((p) => resolving.current.add(p.id))

    ;(async () => {
      for (const pub of targets) {
        let patch
        try {
          const { places } = await placesLib.Place.searchByText({
            textQuery: pub.searchQuery || pub.name,
            fields: ['id', 'displayName', 'location', 'formattedAddress', 'photos'],
            maxResultCount: 1,
            locationBias: { center: CLIFTON_CENTER, radius: 4000 },
          })
          const place = places?.[0]
          patch = place
            ? {
                placeId: place.id,
                location: {
                  lat: place.location.lat(),
                  lng: place.location.lng(),
                },
                address: place.formattedAddress ?? '',
                photoUri:
                  place.photos?.[0]?.getURI({ maxWidth: 320, maxHeight: 320 }) ??
                  null,
                status: 'ok',
              }
            : { status: 'failed' }
        } catch (err) {
          console.error(`Places searchByText failed for "${pub.name}":`, err)
          patch = { status: 'failed' }
        }
        setState((s) => ({
          pubs: s.pubs.map((p) => (p.id === pub.id ? { ...p, ...patch } : p)),
          removed: s.removed.map((p) =>
            p.id === pub.id ? { ...p, ...patch } : p,
          ),
        }))
      }
    })()
  }, [placesLib, pubs, removed])

  const move = useCallback((id, dir) => {
    setState((s) => {
      const i = s.pubs.findIndex((p) => p.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= s.pubs.length) return s
      const next = s.pubs.slice()
      ;[next[i], next[j]] = [next[j], next[i]]
      return { ...s, pubs: next }
    })
  }, [])

  const removePub = useCallback((id) => {
    setState((s) => {
      const pub = s.pubs.find((p) => p.id === id)
      if (!pub) return s
      return {
        pubs: s.pubs.filter((p) => p.id !== id),
        removed: [pub, ...s.removed],
      }
    })
  }, [])

  const restorePub = useCallback((id) => {
    setState((s) => {
      const pub = s.removed.find((p) => p.id === id)
      if (!pub) return s
      return {
        pubs: [...s.pubs, pub],
        removed: s.removed.filter((p) => p.id !== id),
      }
    })
  }, [])

  const addPub = useCallback((pub) => {
    setState((s) => {
      if (s.pubs.some((p) => p.id === pub.id)) return s
      const enriched = {
        visitStatus: 'upcoming',
        note: '',
        ...pub,
      }
      return {
        pubs: [...s.pubs, enriched],
        removed: s.removed.filter((p) => p.id !== pub.id),
      }
    })
  }, [])

  const cycleVisit = useCallback((id) => {
    setState((s) => {
      const target = s.pubs.find((p) => p.id === id)
      if (!target) return s
      const next = nextVisitStatus(target.visitStatus ?? 'upcoming')
      return {
        ...s,
        pubs: s.pubs.map((p) => {
          if (p.id === id) return { ...p, visitStatus: next }
          // Only one pub can be "current" at a time — demote any others.
          if (next === 'current' && p.visitStatus === 'current') {
            return { ...p, visitStatus: 'done' }
          }
          return p
        }),
      }
    })
  }, [])

  const setNote = useCallback((id, note) => {
    setState((s) => ({
      ...s,
      pubs: s.pubs.map((p) => (p.id === id ? { ...p, note } : p)),
    }))
  }, [])

  const share = useCallback(async () => {
    const url = window.location.href
    const payload = {
      title: 'The Stops — Clifton Pub Crawl',
      text: 'Our pub crawl route 🍻',
      url,
    }
    if (navigator.share) {
      try {
        await navigator.share(payload)
        return 'shared'
      } catch {
        return null
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      return 'copied'
    } catch {
      return null
    }
  }, [])

  const reset = useCallback(() => {
    resolving.current = new Set()
    setLegs([])
    setState(defaultState())
  }, [])

  const locate = useCallback(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {},
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }, [])

  const resolvedPubs = useMemo(() => pubs.filter((p) => p.location), [pubs])

  const legByPubId = useMemo(() => {
    const map = {}
    resolvedPubs.forEach((p, i) => {
      if (legs[i]) map[p.id] = legs[i]
    })
    return map
  }, [resolvedPubs, legs])

  const totalDuration = legs.reduce((sum, l) => sum + (l.durationS || 0), 0)
  const totalDistance = legs.reduce((sum, l) => sum + (l.distanceM || 0), 0)
  const routeUrl = useMemo(() => googleMapsRouteUrl(pubs), [pubs])

  const doneCount = useMemo(
    () => pubs.filter((p) => p.visitStatus === 'done').length,
    [pubs],
  )
  const currentPub = useMemo(
    () => pubs.find((p) => p.visitStatus === 'current') ?? null,
    [pubs],
  )

  return (
    <div className="min-h-full pb-12">
      <Header />

      {hasKey ? (
        <MapPanel
          pubs={resolvedPubs}
          userLocation={userLocation}
          onLegs={setLegs}
        />
      ) : (
        <div className="flex h-[150px] items-center justify-center border-b-[3px] border-sun bg-cream-deep/40 px-6 text-center text-sm text-ink/55">
          The map appears once your Google Maps API key is added
        </div>
      )}

      <main className="mx-auto max-w-[520px] px-4">
        {!hasKey && (
          <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
            Google Maps API key not configured — the map and walking times
            won't load until it's added.
          </div>
        )}

        <RouteSummary
          stops={pubs.length}
          doneCount={doneCount}
          currentPub={currentPub}
          totalDuration={totalDuration}
          totalDistance={totalDistance}
          routeUrl={routeUrl}
          onLocate={locate}
          onReset={reset}
          onShare={share}
        />

        <PubList
          pubs={pubs}
          legByPubId={legByPubId}
          hasKey={hasKey}
          onMove={move}
          onRemove={removePub}
          onCycleVisit={cycleVisit}
          onSetNote={setNote}
        />

        <AddPub
          removed={removed}
          placesLib={placesLib}
          onRestore={restorePub}
          onAdd={addPub}
        />

        <p className="mt-8 text-center text-xs leading-relaxed text-ink/55">
          Cheers! Seven gardens from Hampton Park to the Bridge.
          <br />
          Please drink responsibly.
        </p>
      </main>
    </div>
  )
}

function RouteSummary({
  stops,
  doneCount,
  currentPub,
  totalDuration,
  totalDistance,
  routeUrl,
  onLocate,
  onReset,
  onShare,
}) {
  const [shareMsg, setShareMsg] = useState('')
  const walkingLine =
    totalDuration > 0
      ? `${formatDuration(totalDuration)} walking${
          totalDistance ? ` · ${formatDistance(totalDistance)}` : ''
        }`
      : 'Walking times load with the map'

  const progressPct = stops > 0 ? Math.round((doneCount / stops) * 100) : 0
  const allDone = stops > 0 && doneCount === stops

  async function handleShare() {
    const result = await onShare()
    if (result === 'copied') {
      setShareMsg('Link copied!')
      setTimeout(() => setShareMsg(''), 1800)
    } else if (result === 'shared') {
      setShareMsg('')
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-pub-green/25 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {currentPub ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-sun">
                📍 Now at
              </p>
              <p className="truncate font-display text-xl font-bold text-pub-green-deep">
                {currentPub.name}
              </p>
            </>
          ) : allDone ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-pub-green">
                🍻 All stops complete
              </p>
              <p className="font-display text-xl font-bold text-ink">
                Nicely done
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-xl font-bold text-ink">
                {stops} {stops === 1 ? 'stop' : 'stops'}
              </p>
              <p className="mt-0.5 text-sm text-ink/70">{walkingLine}</p>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={onLocate}
          className="shrink-0 rounded-full bg-pub-green px-3.5 py-2 text-xs font-semibold text-cream active:bg-pub-green-deep"
        >
          My location
        </button>
      </div>

      {stops > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs font-medium text-ink/65">
            <span>
              {doneCount} of {stops} visited
            </span>
            <span>{walkingLine}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full bg-pub-green transition-[width] duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <a
          href={routeUrl || undefined}
          target="_blank"
          rel="noreferrer"
          aria-disabled={!routeUrl}
          className={
            routeUrl
              ? 'flex-1 rounded-xl bg-pub-green-deep py-2.5 text-center text-sm font-semibold text-cream active:bg-pub-green'
              : 'pointer-events-none flex-1 rounded-xl bg-ink/10 py-2.5 text-center text-sm font-semibold text-ink/40'
          }
        >
          Open in Google Maps
        </a>
        <button
          type="button"
          onClick={handleShare}
          className="rounded-xl bg-pub-green px-4 py-2.5 text-sm font-semibold text-cream active:bg-pub-green-deep"
        >
          Share
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-xs text-pub-green-deep">{shareMsg}</span>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink/55 hover:text-ink active:bg-ink/5"
        >
          Reset all
        </button>
      </div>
    </section>
  )
}
