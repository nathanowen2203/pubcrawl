// Approximate centre of the Clifton crawl — the map refits to the real
// stops once Google Places resolves each pub.
export const CLIFTON_CENTER = { lat: 51.4605, lng: -2.619 }

// The 7 stops from the poster. `searchQuery` is what gets sent to Google
// Places to pin each pub precisely; tweak it if a pin lands wrong.
export const DEFAULT_PUBS = [
  {
    id: 'channings',
    name: 'The Channings',
    garden: 'Garden terrace',
    description:
      'First stop out of the gate — a handsome pub-hotel on Pembroke Road with a lovely outdoor area for warm days. Easy stroll from Hampton Park.',
    searchQuery: 'The Channings, Pembroke Road, Clifton, Bristol',
  },
  {
    id: 'port-of-call',
    name: 'Port of Call',
    garden: 'Secret sun-trap garden',
    description:
      'Cosy local at the top of Whiteladies with a sun-trap secret beer garden. Cracking real ales and a charming spot to settle into the day.',
    searchQuery: 'Port of Call pub, York Place, Clifton, Bristol',
  },
  {
    id: 'alma-tavern',
    name: 'The Alma Tavern',
    garden: 'Rear beer garden',
    description:
      'Friendly Clifton institution with a proper beer garden and a theatre upstairs. Comfy seating and a bit of shade if the sun gets fierce.',
    searchQuery: 'The Alma Tavern, Alma Vale Road, Clifton, Bristol',
  },
  {
    id: 'den-terrace',
    name: 'The Den & Terrace',
    garden: 'Sun terrace',
    description:
      'Its namesake terrace is made for sunshine — grab a Lazy Fox lager, settle at a picnic table and watch the afternoon drift by.',
    searchQuery: 'The Den & Terrace, Clifton, Bristol',
  },
  {
    id: 'lansdown',
    name: 'The Lansdown',
    garden: 'Sunny courtyard',
    description:
      'Warm, welcoming and gloriously dog-friendly with a vast array of beers. A real heart-of-Clifton boozer with a sunny courtyard.',
    searchQuery: 'The Lansdown, Lansdown Road, Clifton, Bristol',
  },
  {
    id: 'albion',
    name: 'The Albion',
    garden: 'Outdoor benches',
    description:
      'Tucked down a Clifton Village lane, this gastropub has heated outdoor benches and a buzzy community feel. Worth the detour.',
    searchQuery: 'The Albion, Boyces Avenue, Clifton, Bristol',
  },
  {
    id: 'portcullis',
    name: 'The Portcullis',
    garden: 'Rear courtyard garden',
    description:
      'A taste of Belgium minutes from the Suspension Bridge — eight Belgian beers on draft and a rear courtyard garden. A glorious finish.',
    searchQuery: 'The Portcullis, Wellington Terrace, Clifton, Bristol',
  },
]
