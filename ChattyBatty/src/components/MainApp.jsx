import SideBar from "./SideBar"
import { BigHeader } from "./Common"
import { getDoc, doc } from "firebase/firestore"
import { db } from '../firebaseConfig'
import { useEffect, useState } from "react"
import FriendsList from "./FriendsList"
import ThemeSelector from "./ThemeSelector"
import Header from "./Header"
import Chat from "./Chat"

const MainApp = ({ uid }) => {
  const [user, setUser] = useState()

  useEffect(() => {
    const fetchUser = async () => {
      const userRef = doc(db, 'users', uid)
      const userSnap = await getDoc(userRef)
      if (userSnap.exists()) {
        setUser(userSnap.data())
      }
    }
    fetchUser()
  }, [uid])

  if (!user) {
    return <div>Loading...</div>
  }
 
  return (
    <div className="flex flex-col h-screen">

    <Header photo={user.photo} />
  
  <div className="flex flex-1 overflow-hidden">

    <aside className=" bg-base-100  overflow-y-auto">
      <SideBar />
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
