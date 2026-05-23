import { useEffect, useRef } from 'react'
import {
  AdvancedMarker,
  Map,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps'
import { CLIFTON_CENTER } from './data/pubs.js'

const MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'

export default function MapPanel({ pubs, userLocation, onLegs }) {
  return (
    <div className="h-[44vh] min-h-[260px] w-full border-b-[3px] border-sun">
      <Map
        defaultCenter={CLIFTON_CENTER}
        defaultZoom={15}
        mapId={MAP_ID}
        disableDefaultUI
        clickableIcons={false}
        gestureHandling="greedy"
        style={{ width: '100%', height: '100%' }}
      >
        {pubs.map((pub, i) => (
          <AdvancedMarker key={pub.id} position={pub.location} title={pub.name}>
            <NumberPin
              n={i + 1}
              visitStatus={pub.visitStatus ?? 'upcoming'}
            />
          </AdvancedMarker>
        ))}

        {userLocation && (
          <AdvancedMarker position={userLocation} title="You are here">
            <span className="block h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-md" />
          </AdvancedMarker>
        )}

        <RouteLine pubs={pubs} onLegs={onLegs} />
        <FitBounds pubs={pubs} userLocation={userLocation} />
      </Map>
    </div>
  )
}

const PIN_STYLE = {
  upcoming: 'bg-pub-green h-8 w-8 text-sm',
  current: 'bg-sun h-10 w-10 text-base ring-4 ring-sun/30',
  done: 'bg-pub-green/40 h-8 w-8 text-sm',
}

function NumberPin({ n, visitStatus }) {
  const style = PIN_STYLE[visitStatus] ?? PIN_STYLE.upcoming
  const isDone = visitStatus === 'done'
  return (
    <span
      className={`flex -translate-y-1/2 items-center justify-center rounded-full border-2 border-white font-bold text-white shadow-[0_2px_6px_rgba(0,0,0,0.4)] ${style}`}
    >
      {isDone ? '✓' : n}
    </span>
  )
}

// Draws the walking route and reports back the per-leg distance/duration.
function RouteLine({ pubs, onLegs }) {
  const map = useMap()
  const routesLib = useMapsLibrary('routes')
  const rendererRef = useRef(null)

  useEffect(() => {
    if (!routesLib || !map) return
    const renderer = new routesLib.DirectionsRenderer({
      map,
      suppressMarkers: true,
      preserveViewport: true,
      polylineOptions: {
        strokeColor: '#385a29',
        strokeOpacity: 0.9,
        strokeWeight: 5,
      },
    })
    rendererRef.current = renderer
    return () => {
      renderer.setMap(null)
      rendererRef.current = null
    }
  }, [routesLib, map])

  useEffect(() => {
    const renderer = rendererRef.current
    if (!routesLib || !renderer) return

    if (pubs.length < 2) {
      renderer.setMap(null)
      onLegs([])
      return
    }
    renderer.setMap(map)

    let cancelled = false
    const service = new routesLib.DirectionsService()
    service
      .route({
        origin: pubs[0].location,
        destination: pubs[pubs.length - 1].location,
        waypoints: pubs.slice(1, -1).map((p) => ({
          location: p.location,
          stopover: true,
        })),
        travelMode: google.maps.TravelMode.WALKING,
      })
      .then((result) => {
        if (cancelled) return
        renderer.setDirections(result)
        onLegs(
          result.routes[0].legs.map((leg) => ({
            durationS: leg.duration?.value ?? 0,
            durationText: leg.duration?.text ?? '',
            distanceM: leg.distance?.value ?? 0,
            distanceText: leg.distance?.text ?? '',
          })),
        )
      })
      .catch(() => {
        if (!cancelled) onLegs([])
      })

    return () => {
      cancelled = true
    }
  }, [routesLib, map, pubs, onLegs])

  return null
}

// Keeps every stop (and the user) inside the visible map.
function FitBounds({ pubs, userLocation }) {
  const map = useMap()

  useEffect(() => {
    if (!map || pubs.length === 0) return
    if (pubs.length === 1 && !userLocation) {
      map.setCenter(pubs[0].location)
      map.setZoom(16)
      return
    }
    const bounds = new google.maps.LatLngBounds()
    pubs.forEach((p) => bounds.extend(p.location))
    if (userLocation) bounds.extend(userLocation)
    map.fitBounds(bounds, 56)
  }, [map, pubs, userLocation])

  return null
}
