import SideBar from "./SideBar"
import { BigHeader } from "./Common"
import { logout } from "../Login"

const MainApp = ({ user }) => {
    return(
        <div> 
            <BigHeader text={`Hello ${user.displayName}`} />
            <button className="btn btn-primary" onClick={logout}>LogOut</button>
        </div>
    )
}

export default MainApp