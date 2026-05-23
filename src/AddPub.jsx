import { useState } from 'react'
import { CLIFTON_CENTER } from './data/pubs.js'

export default function AddPub({ removed, placesLib, onRestore, onAdd }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSearch(e) {
    e.preventDefault()
    const text = query.trim()
    if (!text || !placesLib) return
    setSearching(true)
    setMessage('')
    setResults([])
    try {
      const { places } = await placesLib.Place.searchByText({
        textQuery: text,
        fields: ['id', 'displayName', 'location', 'formattedAddress', 'photos'],
        maxResultCount: 6,
        locationBias: { center: CLIFTON_CENTER, radius: 8000 },
      })
      setResults(places ?? [])
      if (!places || places.length === 0) {
        setMessage('No matches — try a more specific name.')
      }
    } catch (err) {
      console.error('Places searchByText failed:', err)
      setMessage(
        `Search failed: ${err?.message || 'unknown error'} — see browser console for details.`,
      )
    } finally {
      setSearching(false)
    }
  }

  function choose(place) {
    onAdd({
      id: place.id,
      name: place.displayName ?? 'Unnamed pub',
      garden: '',
      description: place.formattedAddress ?? '',
      placeId: place.id,
      address: place.formattedAddress ?? '',
      location: { lat: place.location.lat(), lng: place.location.lng() },
      photoUri:
        place.photos?.[0]?.getURI({ maxWidth: 320, maxHeight: 320 }) ?? null,
      status: 'ok',
      custom: true,
    })
    setQuery('')
    setResults([])
    setMessage('')
  }

  return (
    <section className="mt-6">
      <h2 className="px-1 pb-2 font-display text-lg font-bold text-ink">
        Add a stop
      </h2>

      {removed.length > 0 && (
        <div className="mb-3">
          <p className="px-1 pb-1.5 text-xs font-medium text-ink/55">
            Removed — tap to add back
          </p>
          <div className="flex flex-wrap gap-2">
            {removed.map((pub) => (
              <button
                key={pub.id}
                type="button"
                onClick={() => onRestore(pub.id)}
                className="rounded-full border border-pub-green/40 bg-card px-3 py-1.5 text-xs font-semibold text-pub-green-deep"
              >
                + {pub.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for any pub…"
          className="min-w-0 flex-1 rounded-xl border border-ink/20 bg-card px-3 py-2.5 text-sm text-ink outline-none focus:border-pub-green"
        />
        <button
          type="submit"
          disabled={searching || !placesLib}
          className="shrink-0 rounded-xl bg-pub-green px-4 py-2.5 text-sm font-semibold text-cream disabled:opacity-50"
        >
          {searching ? 'Searching' : 'Search'}
        </button>
      </form>

      {!placesLib && (
        <p className="mt-2 px-1 text-xs text-ink/50">
          Search needs the Google Maps API key.
        </p>
      )}
      {message && <p className="mt-2 px-1 text-xs text-amber-600">{message}</p>}

      {results.length > 0 && (
        <ul className="mt-2 space-y-2">
          {results.map((place) => (
            <li key={place.id}>
              <button
                type="button"
                onClick={() => choose(place)}
                className="w-full rounded-xl border border-pub-green/20 bg-card p-3 text-left active:bg-cream"
              >
                <p className="text-sm font-semibold text-pub-green">
                  {place.displayName}
                </p>
                {place.formattedAddress && (
                  <p className="mt-0.5 text-xs text-ink/60">
                    {place.formattedAddress}
                  </p>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
