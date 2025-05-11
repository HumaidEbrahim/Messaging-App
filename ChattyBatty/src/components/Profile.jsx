import { logout } from '../Login'
import dayjs from 'dayjs'
import { CgAddR } from 'react-icons/cg'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import { useState } from 'react'

const Profile = ({ user, uid }) => {
  const [status, setStatus] = useState(user.status)

  const updateStatus = async () => {
    const docRef = await updateDoc(doc(db, 'users', uid), { status: status })
    console.log('status', docRef)
  }

  return (
    <div className="flex flex-col dropdown dropdown-center dropdown-hover  dropdown-top ">
      <div className="bg-base-200 rounded-2xl p-2 pr-16 pl-8 gap-4 flex items-center ">
        <div className=" flex-1 ">
          <p className="text-xl font-medium">{user?.username}</p>
          <p className="text-sm text-base-content/70">{user?.status}</p>
        </div>

        <img
          className="w-10 h-10  rounded-full object-cover"
          src={user?.photo}
          referrerPolicy="no-referrer"
        />

        <div className="dropdown-content menu bg-base-300 rounded-box z-1 w-full p-2 shadow-sm">
          <div className="  rounded-xl p-6  ">
            <div className="flex flex-col items-center space-y-4">
              <div className="avatar online">
                <div className="w-24 rounded-full">
                  <img src={user.photo} />
                </div>
              </div>
              <div className="text-3xl font-medium ">{user.username}</div>
              <p className="text-base-content/70">
                {' '}
                Member Since:{' '}
                {dayjs(user?.creationDate?.toDate()).format('D MMMM YYYY')}{' '}
              </p>
              <p className="text-base-content/70"> {user.email} </p>
              <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-full border p-4">
                <legend className="fieldset-legend">Status</legend>
                <div className="join">
                  <input
                    type="text"
                    className="input join-item"
                    placeholder={status}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                  <button className="btn join-item" onClick={updateStatus}>
                    <CgAddR size={20} />
                  </button>
                </div>
              </fieldset>
              <button
                className="btn btn-wide btn-primary btn-soft"
                onClick={logout}
              >
                LogOut
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
