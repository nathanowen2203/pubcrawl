// Builds a Google Maps walking-directions URL for the whole route.
export function googleMapsRouteUrl(pubs) {
  const points = pubs.filter((p) => p.location)
  if (points.length < 2) return null

  const coord = (p) => `${p.location.lat},${p.location.lng}`
  const url = new URL('https://www.google.com/maps/dir/')
  url.searchParams.set('api', '1')
  url.searchParams.set('travelmode', 'walking')
  url.searchParams.set('origin', coord(points[0]))
  url.searchParams.set('destination', coord(points[points.length - 1]))

  const waypoints = points.slice(1, -1).map(coord).join('|')
  if (waypoints) url.searchParams.set('waypoints', waypoints)

  return url.toString()
}

// Builds a Google Maps URL that opens a single pub.
export function googleMapsPlaceUrl(pub) {
  const url = new URL('https://www.google.com/maps/search/')
  url.searchParams.set('api', '1')
  url.searchParams.set('query', pub.address || pub.name)
  if (pub.placeId) url.searchParams.set('query_place_id', pub.placeId)
  return url.toString()
}

export function formatDuration(seconds) {
  if (!seconds) return '—'
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins} min`
  const hours = Math.floor(mins / 60)
  const rest = mins % 60
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`
}

export function formatDistance(meters) {
  if (!meters) return ''
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)} km`
    : `${Math.round(meters)} m`
}
