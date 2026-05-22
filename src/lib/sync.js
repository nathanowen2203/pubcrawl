// Realtime sync via Firebase Realtime Database.
// If the Firebase env vars are not set, sync is disabled and the app falls
// back to per-browser localStorage state.
import { initializeApp } from 'firebase/app'
import { getDatabase, onValue, ref, set } from 'firebase/database'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
}

export const SYNC_ENABLED = Boolean(config.apiKey && config.databaseURL)

const ROOM = 'main'

let db = null
if (SYNC_ENABLED) {
  db = getDatabase(initializeApp(config))
}

export function subscribeCrawl(onUpdate) {
  if (!db) return () => {}
  return onValue(ref(db, `rooms/${ROOM}`), (snap) => onUpdate(snap.val()))
}

export function writeCrawl(data) {
  if (!db) return
  set(ref(db, `rooms/${ROOM}`), data)
}
