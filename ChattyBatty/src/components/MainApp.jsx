import SideBar from "./SideBar"
import { BigHeader } from "./Common"
import { logout } from "../Login"
import { getDoc, doc } from "firebase/firestore"
import { db } from '../firebaseConfig'
import { useEffect, useState } from "react"
import FriendsList from "./FriendsList"
import ThemeSelector from "./ThemeSelector"

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
    <div> 
        <ThemeSelector />
      <div className="avatar avatar-online">
    <div className="w-24 rounded-full">
        <img src={user.photo} />
    </div>
    </div>
      <BigHeader text={`Hello ${user.username}`} />
      <h1>{user.status}</h1>
      <input type="text" placeholder="Add Friend" className="input" />
      <FriendsList />
      <button className="btn btn-primary" onClick={logout}>LogOut</button>
    </div>
  )
}

export default MainApp
