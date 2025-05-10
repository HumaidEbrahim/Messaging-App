import { logout } from '../Login'

const Profile = ({ user }) => {
  return (

      <div className="flex felx-col dropdown dropdown-start dropdown-hover  dropdown-top pl-10 pr-10">
    <div className="bg-base-200 rounded-2xl p-2 gap-4 flex items-center ">
      <div className=" flex-1 pl-2">
        <p className="text-xl font-medium">{user?.username}</p>
        <p className="text-sm text-base-content/70">{user?.status}</p>
      </div>
    
        <img
          className="w-10 h-10  rounded-full object-cover"
          src={user?.photo}
          referrerPolicy='no-referrer'
        />

        <div className="dropdown-content menu bg-base-300 rounded-box z-1 w-22 p-2 shadow-sm">
           <div className=" bg-base-100  rounded-xl p-6  ">
      <div className="flex flex-col items-center space-y-4">
        <div className="avatar online">
          <div className="w-24 rounded-full">
            <img src={user.photo}  />
          </div>
        </div>
              <div className="text-3xl font-medium">{user.username}</div>
              <p> {user.email} </p>
              <p> {user.status} </p>
         </div>
      </div>
       </div>
    </div>

     </div>
  )
}

export default Profile
