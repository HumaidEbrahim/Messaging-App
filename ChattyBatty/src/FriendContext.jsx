import { doc, getDoc } from 'firebase/firestore'
import { useContext, createContext, useState, useEffect } from 'react'
import { db } from './firebaseConfig'

const FriendContext = createContext([])

export const FriendProvider = ({ user, children }) => {
  console.log('friendsbeforequery', user.friends)
  const friendIds = user.friends || []
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true)
        
        const friendPromises = friendIds.map(id => {
          const docRef = doc(db, 'users', id)
          return getDoc(docRef)
        })
        
   
        const friendDocs = await Promise.all(friendPromises)
        
       
        const friendsData = friendDocs.map(doc => {
          if (doc.exists()) {
            return {
              ...doc.data(),
              id: doc.id
            }
          }
          return null
        }).filter(Boolean) 
        
        console.log('friendsafterquery', friendsData)
        setFriends(friendsData)
      } catch (err) {
        console.log(err.message)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    if (friendIds.length > 0) {
      fetchFriends()
   
      setFriends([])
      setLoading(false)
    }
  }, [friendIds])

  console.log('Query state:', { loading, friendsCount: friends.length })
  
  if (error) console.log(error.message)

  return (
    <FriendContext.Provider value={friends}>{children}</FriendContext.Provider>
  )
}

export const useFriends = () => useContext(FriendContext)