const KEY = 'pubcrawl.state.v1'

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // storage unavailable (private mode / quota) — edits just won't persist
  }
}

export function clearState() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // no-op
  }
}
