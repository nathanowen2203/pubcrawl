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

## Cross-device sync (optional)

By default, each browser keeps its own copy of the route in `localStorage`. To
make edits sync in real time across friends' phones, add Firebase Realtime
Database.

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and
   create a project (you can keep Google Analytics off).
2. In the left sidebar: **Build &rarr; Realtime Database &rarr; Create Database**.
   Pick a region close to you (e.g. `europe-west1`) and start in **test mode**
   for the simplest setup.
3. After creating, go to **Rules** and paste:

   ```json
   {
     "rules": {
       "rooms": {
         "$room": {
           ".read": true,
           ".write": true
         }
       }
     }
   }
   ```

   This lets anyone with the app URL read and edit the shared crawl. For a
   private crawl with friends that is fine; tighten the rules later if needed.

4. In the Firebase console: **Project settings &rarr; General &rarr; Your apps
   &rarr; Web** (the `</>` icon) to register a web app. Copy these values from
   the config snippet into your `.env.local`:

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...projectId.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://...firebaseio.com
   VITE_FIREBASE_PROJECT_ID=...
   ```

5. Restart `npm run dev`. Open the app in two browsers (or your phone +
   laptop) &mdash; edits in one show up in the other within a second.

6. To make it work on the deployed site too, add the same four values as
   GitHub Actions secrets (**Settings &rarr; Secrets and variables &rarr;
   Actions**) and re-run the deploy workflow.

Leave the four Firebase env vars blank to disable sync and use local storage
only.
