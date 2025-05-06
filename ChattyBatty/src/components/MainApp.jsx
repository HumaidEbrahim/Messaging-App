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
  <div className='p-6 bg-base-300 '>
    
    <div className="grid grid-cols-5 grid-rows-[auto_1fr] gap-0.5 h-screen rounded-4xl overflow-hidden shadow-lg">

    <div className="col-span-5">  
  <Header photo={user.photo} username={user.username} />
  </div>

  
    <div className="col-start-1 bg-base-100">
      <SideBar chats={chats} uid={uid} setSelectedChat={setSelectedChat} friendIds={user.friends} />
      
    </div>

    <div className="col-span-3 bg-base-100">
      <Chat selectedChat={selectedChat} uid={uid}/>
    </div>
    
    <div className="col-start-5 bg-base-100">
      {selectedChat?
       <DetailBar selectedChat={selectedChat}/>
      : null}
     
     </div>
  </div>

</div>
  </FriendProvider>
  )
}

export default MainApp
