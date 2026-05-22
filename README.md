# The Stops &mdash; Clifton Pub Crawl

A mobile-first web app that plots a walking pub crawl across Clifton, Bristol on a
Google Map. Reorder, remove, or search-and-add stops and the route and walking
times update live.

Built with React + Vite + Tailwind CSS, using the Google Maps JavaScript API.

## Run locally

1. Install dependencies:

   ```
   npm install
   ```

2. Add your Google Maps API key. Open `.env.local` and paste your key:

   ```
   VITE_GOOGLE_MAPS_API_KEY=your_key_here
   ```

   The key needs these APIs enabled in Google Cloud: **Maps JavaScript API**,
   **Directions API**, and **Places API (New)**.

3. Start the dev server:

   ```
   npm run dev
   ```

The app still loads the pub list without a key &mdash; you just won't see the
map or walking times until the key is added.

## Deploy to GitHub Pages

Deployment runs automatically via GitHub Actions on every push to `main`.

One-time setup in the GitHub repo:

1. **Settings &rarr; Pages &rarr; Build and deployment &rarr; Source: GitHub Actions**.
2. **Settings &rarr; Secrets and variables &rarr; Actions &rarr; New repository secret**:
   name `VITE_GOOGLE_MAPS_API_KEY`, value your key.
3. In Google Cloud, allow the key's website restrictions to include
   `https://<your-username>.github.io/*`.

The live site is published at `https://<your-username>.github.io/pubcrawl/`.
