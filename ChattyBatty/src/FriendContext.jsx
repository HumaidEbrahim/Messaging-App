import { collection, query, where } from 'firebase/firestore'
import { useContext, createContext } from 'react'
import { useCollection } from 'react-firebase-hooks/firestore'
import { db } from './firebaseConfig'

const FriendContext = createContext([])

export const FriendProvider = ({ user, children }) => {
  const friendIds = user.friends

  const q = query(collection(db, 'users'), where('__name__', 'in', friendIds))
  const [snapshot, error] = useCollection(q)

  const friends  = snapshot?.docs.map(doc => ({
    ...doc.data(),
    id: doc.id
  })) 
  console.log('friendsafterquery', friends)

  if (error) console.log(error.message)

  return (
    <FriendContext.Provider value={friends}>{children}</FriendContext.Provider>
  )
}

export const useFriends = () => useContext(FriendContext)