import SideBar from './SideBar'
import FriendsList from './FriendsList'
import Header from './Header'
import Chat from './Chat'
import { FriendProvider } from '../FriendContext'
import { useDocumentData, useCollection } from 'react-firebase-hooks/firestore'
import { db } from '../firebaseConfig'
import { doc, collection, query, where, orderBy} from 'firebase/firestore'
import { useState } from 'react'
import DetailBar from './DetailBar'

const MainApp = ({ uid }) => {
  const [user] = useDocumentData(doc(db, 'users', uid))
  console.log('user', user)
  const [selectedChat, setSelectedChat] = useState(null)

  console.log("uid",uid)

  // get chats
  const chatQuery = query(
    collection(db, 'chat'),
    where('participants', 'array-contains', uid),
  )

  const [chatSnapshot] = useCollection(chatQuery

  )

  const chats = chatSnapshot?.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
  })) 
  

  console.log('selected', selectedChat)
  if (!user) {
    return <div>Loading...</div>
  }
  
  return (
    <FriendProvider user={user}>
  
  <div className="flex flex-col h-screen">
  <Header photo={user.photo} username={user.username} />

  <div className="flex flex-row flex-1 overflow-hidden">
    <div className="flex flex-1">
      <SideBar chats={chats} uid={uid} setSelectedChat={setSelectedChat} friendIds={user.friends} />
    </div>
    <div className="flex flex-2">
      <Chat selectedChat={selectedChat}/>
    </div>
    <div className="flex flex-1">
      <DetailBar selectedChat={selectedChat}/>
    </div>
  </div>
</div>

  </FriendProvider>
  )
}

export default MainApp
