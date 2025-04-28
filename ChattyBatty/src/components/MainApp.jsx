import SideBar from "./SideBar"
import { BigHeader } from "./Common"
import { logout } from "../Login"
import { getDoc, doc } from "firebase/firestore"
import { db } from '../firebaseConfig'
import { useEffect, useState } from "react"

const getUser = async (uid) => {
    const userRef = doc(db, 'users', uid)
    const user = await getDoc(userRef)
    console.log("data",user.data())
    return user.data()
}
   

const MainApp = ({ uid }) => {

    const[user, setUser] = useState(null)

    useEffect(() => {
        
    },[uid])

    return(
        <div> 
            <img src={user.photo}/>
            <BigHeader text={`Hello ${user.displayName}`} />
            <h1>{user.status}</h1>
            <button className="btn btn-primary" onClick={logout}>LogOut</button>
        </div>
    )
}

export default MainApp