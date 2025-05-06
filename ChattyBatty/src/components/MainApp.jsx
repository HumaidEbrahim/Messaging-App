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
import Profile from './Profile'

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
    <div className="h-screen p-4 box-border bg-base-300">
      <div className="grid grid-rows-[auto_1fr] h-full rounded-4xl overflow-hidden shadow-lg">
  
        {/* Header */}
        <div >
          <Header photo={user.photo} username={user.username} />
        </div>
  
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-0.5 overflow-hidden ">
          
          {/* Sidebar */}
          <div className="bg-base-100 hidden md:block">
            <SideBar
              chats={chats}
              uid={uid}
              setSelectedChat={setSelectedChat}
              friendIds={user.friends}
            />
            <Profile user={user}/>
          </div>
  
          {/* Chat */}
          <div className="bg-base-100  col-span-1 md:col-span-2 lg:col-span-3">
            {<Chat selectedChat={selectedChat} uid={uid} /> }
          </div>
  
          {/* Detail Bar */}
          <div className="bg-base-100 overflow-auto hidden lg:block">
            {selectedChat ? <DetailBar selectedChat={selectedChat} /> : null}
          </div>
        </div>
  
      </div>
    </div>
  </FriendProvider>
  
  )  
}

export default MainApp
