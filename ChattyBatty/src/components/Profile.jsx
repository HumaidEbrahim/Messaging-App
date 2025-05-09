import { logout } from '../Login'

const Profile = ({ user }) => {
  return (
    <div className="bg-base-200 rounded-2xl p-2 gap-4 flex items-center ">
      <div className="flex flex-col pl-2">
        <p className="text-xl font-medium">{user.username}</p>
        <p className="text-sm text-base-content/70">{user.status}</p>
      </div>
      <div className="flex-1 dropdown dropdown-hover dropdown-start pl-10 pr-10">
        <img
          className="w-10 h-10  rounded-full object-cover"
          src={user.photo}
        />

        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-100 rounded-box z-1 w-22 p-2 shadow-sm"
        >
          <li>
            <button class="btn btn-soft btn-primary" onClick={logout}>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Profile
