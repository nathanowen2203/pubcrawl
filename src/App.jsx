import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps'
import PubCrawl from './PubCrawl.jsx'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

export default function App() {
  if (!API_KEY) {
    return <PubCrawl placesLib={null} hasKey={false} />
  }
  return (
    <APIProvider apiKey={API_KEY}>
      <MapsBridge />
    </APIProvider>
  )
}

// Lives inside APIProvider so it can load the Places library and hand it down.
function MapsBridge() {
  const placesLib = useMapsLibrary('places')
  return <PubCrawl placesLib={placesLib} hasKey />
}
