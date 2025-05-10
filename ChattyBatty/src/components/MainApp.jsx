import SideBar from './SideBar'
import Header from './Header'
import Chat from './Chat'
import { FriendProvider } from '../FriendContext'
import { useDocumentData, useCollection } from 'react-firebase-hooks/firestore'
import { db } from '../firebaseConfig'
import { doc, collection, query, where, orderBy, getDoc
 } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import DetailBar from './DetailBar'
import Profile from './Profile'

const MainApp = ({ uid }) => {
  // user info
  const [user] = useDocumentData(doc(db, 'users', uid))
  console.log('user', user)
  console.log('uid', uid)

  // selected chat
  const [selectedChat, setSelectedChat] = useState(null)
  const [participants, setParticipants] = useState([])
 

 
  // get chats
  const chatQuery = query(
    collection(db, 'chat'),
    where('participants', 'array-contains', uid),
  )

  const [chatSnapshot] = useCollection(chatQuery)

  const chats = chatSnapshot?.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
  }))


//   useEffect(() => {
//   if (selectedChat && chats.length > 0) {
//     const details = chats.find(chat => chat.id === selectedChat)
//     setSelectedChatDetails(details);
//   }
// }, [selectedChat, chats])



  // get chat participant details
  useEffect(() => {
  const fetchParticipants = async () => {
    if (!selectedChat?.participants?.length) return;

    const participantPromises = selectedChat.participants.map((id) => {
      const docRef = doc(db, "users", id);
      return getDoc(docRef);
    });

    const participantDocs = await Promise.all(participantPromises);

    const participants = participantDocs
      .map((docSnap) => {
        if (docSnap.exists()) {
          return { ...docSnap.data(), id: docSnap.id };
        }
        return null;
      })
      .filter(Boolean);

    setParticipants(participants);
  };

  fetchParticipants();
}, [selectedChat?.participants])

 console.log("participants", participants)

  console.log('selectedChat', selectedChat)
  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <FriendProvider user={user}>
      <div className="h-screen p-4 box-border bg-base-300">
        <div className="grid grid-rows-[auto_1fr] h-full rounded-4xl overflow-hidden shadow-lg">
          {/* Header */}
          <div>
            <Header photo={user.photo} username={user.username} />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-0.5 h-full min-h-0">
            {/* Sidebar */}
            <div className="bg-base-100 hidden md:block overflow-y-auto">
              <SideBar
                chats={chats}
                uid={uid}
                setSelectedChat={setSelectedChat}
                friendIds={user.friends}
                user={user}
              />
             
            </div>

            {/* Chat */}
            <div className="bg-base-100 col-span-1 md:col-span-2 lg:col-span-3 flex flex-col min-h-0">
              {selectedChat && <Chat selectedChat={selectedChat} participants={participants} uid={uid} />}
            </div>

            {/* Detail Bar */}
            <div className="bg-base-100 overflow-y-auto hidden lg:block">
              {selectedChat && <DetailBar participants={participants} selectedChat={selectedChat} uid={uid} />}
            </div>
          </div>
        </div>
      </div>
    </FriendProvider>
  )
}

export default MainApp
