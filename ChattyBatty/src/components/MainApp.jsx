import SideBar from './SideBar'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import { createContext } from 'react'
import FriendsList from './FriendsList'
import Header from './Header'
import Chat from './Chat'
import { collection, query, where, orderBy } from 'firebase/firestore'
import {
  useCollectionData,
  useDocumentData,
} from 'react-firebase-hooks/firestore'

const FriendContext = createContext()

const MainApp = ({ user }) => {


  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex flex-col h-screen">
      <Header photo={user.photo} username={user.displayName} />

      <div className="flex flex-1 overflow-hidden">
        <aside className=" bg-base-100  overflow-y-auto">
          {/* <SideBar uid={uid} />
          <FriendsList friends={friends} /> */}
        </aside>

        <main className="flex-1 overflow-y-auto p-10">
          <Chat />
        </main>
      </div>
      <footer className="footer  footer-center bg-base-300 text-base-content">
        <input type="text" placeholder="Message" className="input input-xl" />
      </footer>
    </div>
  )
}

export default MainApp
