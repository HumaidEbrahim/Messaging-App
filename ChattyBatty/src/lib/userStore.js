import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebaseConfig'

// A shared, reference-counted cache of live user documents. Components that
// need the same user share one Firestore listener, and recently released
// users stay cached briefly so switching chats doesn't flash empty avatars.

const RELEASE_DELAY_MS = 30_000
const entries = new Map()

const notify = (entry) => entry.subscribers.forEach((callback) => callback())

export const retainUser = (id, callback) => {
  let entry = entries.get(id)
  if (!entry) {
    entry = {
      refs: 0,
      data: undefined,
      loaded: false,
      subscribers: new Set(),
      releaseTimer: null,
    }
    entry.unsubscribe = onSnapshot(
      doc(db, 'users', id),
      (snap) => {
        entry.data = snap.exists() ? { ...snap.data(), id: snap.id } : null
        entry.loaded = true
        notify(entry)
      },
      () => {
        entry.data = null
        entry.loaded = true
        notify(entry)
      },
    )
    entries.set(id, entry)
  }

  clearTimeout(entry.releaseTimer)
  entry.refs += 1
  entry.subscribers.add(callback)

  return () => {
    entry.subscribers.delete(callback)
    entry.refs -= 1
    if (entry.refs <= 0) {
      entry.releaseTimer = setTimeout(() => {
        if (entry.refs > 0) return
        entry.unsubscribe()
        entries.delete(id)
      }, RELEASE_DELAY_MS)
    }
  }
}

export const peekUser = (id) => entries.get(id)

export const clearUserCache = () => {
  entries.forEach((entry) => {
    clearTimeout(entry.releaseTimer)
    entry.unsubscribe()
  })
  entries.clear()
}
