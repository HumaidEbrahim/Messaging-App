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
        
        // Create an array of promises for each friend document
        const friendPromises = friendIds.map(id => {
          const docRef = doc(db, 'users', id)
          return getDoc(docRef)
        })
        
        // Wait for all promises to resolve
        const friendDocs = await Promise.all(friendPromises)
        
        // Map the documents to the required format
        const friendsData = friendDocs.map(doc => {
          if (doc.exists()) {
            return {
              ...doc.data(),
              id: doc.id
            }
          }
          return null
        }).filter(Boolean) // Remove any null values (documents that don't exist)
        
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
    } else {
      // If there are no friends, set an empty array and mark as not loading
      setFriends([])
      setLoading(false)
    }
  }, [friendIds]) // Re-fetch when friendIds change

  console.log('Query state:', { loading, friendsCount: friends.length })
  
  if (error) console.log(error.message)

  return (
    <FriendContext.Provider value={friends}>{children}</FriendContext.Provider>
  )
}

export const useFriends = () => useContext(FriendContext)