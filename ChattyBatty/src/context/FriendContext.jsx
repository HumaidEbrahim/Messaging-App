import { createContext, useContext, useMemo } from 'react'
import { useUsers } from '../hooks/useUsers'

const FriendContext = createContext({
  friends: [],
  friendIds: new Set(),
  requests: [],
  loading: true,
})

const byName = (a, b) =>
  (a.username || '').localeCompare(b.username || '', undefined, {
    sensitivity: 'base',
  })

/** Live friends and incoming friend requests for the signed-in user. */
export const FriendProvider = ({ user, children }) => {
  const friendUsers = useUsers(user.friends)
  const requestUsers = useUsers(user.incomingRequests)

  const value = useMemo(
    () => ({
      friends: [...friendUsers.byId.values()].sort(byName),
      friendIds: new Set(user.friends || []),
      requests: [...requestUsers.byId.values()].sort(byName),
      loading: friendUsers.loading,
    }),
    [friendUsers, requestUsers, user.friends],
  )

  return (
    <FriendContext.Provider value={value}>{children}</FriendContext.Provider>
  )
}

export const useFriends = () => useContext(FriendContext)
