import SideBar from './SideBar'
import FriendsList from './FriendsList'
import Header from './Header'
import Chat from './Chat'
import { FriendProvider } from '../FriendContext'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import { db } from '../firebaseConfig'
import { doc } from 'firebase/firestore'

const MainApp = ({ uid }) => {
  const [user] = useDocumentData(doc(db, 'users', uid))
  console.log('user', user)
  if (!user) {
    return <div>Loading...</div>
  }
  

  return (
    <FriendProvider user={user}>
  
  <div className="flex flex-col h-screen">
  <Header photo={user.photo} username={user.username} />

  <div className="flex flex-row flex-1">
    <div className="flex flex-1">
      <SideBar uid={uid} />
    </div>
    <div className="flex flex-2">
      <Chat />
    </div>
  </div>
</div>

    </FriendProvider>
  )
}

export default MainApp
