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

        <div className="flex flex-1 overflow-hidden">
          <aside className=" bg-base-100  overflow-y-auto">
            <SideBar uid={uid} />
            <FriendsList />
          </aside>

          <main className="flex-1 overflow-y-auto p-10">
            <Chat />
          </main>
        </div>
        <footer className="footer  footer-center bg-base-300 text-base-content">
          <input type="text" placeholder="Message" className="input input-xl" />
        </footer>
      </div>
    </FriendProvider>
  )
}

export default MainApp
