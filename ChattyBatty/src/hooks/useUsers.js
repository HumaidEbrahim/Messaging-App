import { useEffect, useMemo, useReducer } from 'react'
import { peekUser, retainUser } from '../lib/userStore'

const toKey = (ids) =>
  [...new Set((ids || []).filter(Boolean))].sort().join(',')

/**
 * Live user profiles for a list of ids.
 * Returns `byId` (a Map) and `loading` (true until every id has loaded).
 * Missing or unreadable users are left out of the map.
 */
export const useUsers = (ids) => {
  const key = toKey(ids)
  const [version, rerender] = useReducer((count) => count + 1, 0)

  useEffect(() => {
    if (!key) return
    const releases = key.split(',').map((id) => retainUser(id, rerender))
    rerender()
    return () => releases.forEach((release) => release())
  }, [key])

  return useMemo(() => {
    const byId = new Map()
    let loading = false
    if (key) {
      for (const id of key.split(',')) {
        const entry = peekUser(id)
        if (!entry?.loaded) loading = true
        if (entry?.data) byId.set(id, entry.data)
      }
    }
    return { byId, loading }
    // `version` changes whenever any watched user updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, version])
}
