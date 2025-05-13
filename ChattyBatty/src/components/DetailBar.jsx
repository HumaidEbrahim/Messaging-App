import { doc, deleteDoc, updateDoc, arrayRemove, getDoc } from 'firebase/firestore'
import { db } from '../firebaseConfig'
import { MdGroupAdd } from 'react-icons/md'
import FriendContext from '../FriendContext'
import { useContext, useState } from 'react'

const FriendDetails = ({ friend }) => {
  return (
    <>
    <div className="mb-4 p-3 bg-base-200 rounded-lg text-center">
      <div className="text-lg text-base-content/70 ">{friend?.status}</div>

        <div className="text-md text-base-content/50">{friend?.email}</div>
        </div>
    </>
  )
}

const GroupDetails = ({ participants, groupCreator, uid, groupId, setSelectedChat, groupDesc, groupName }) => {

    const deleteGroup = async () => {
        await deleteDoc(doc(db, 'chat', groupId)) 
        setSelectedChat(null)
    }

    // const leaveGroup = async () => {
    //   await updateDoc(doc(db, 'chat', groupId), {
    //     participants: arrayRemove(uid)
    //   } )
    //   setSelectedChat(null)
    // }
  

  return (
    <div className="w-full mt-4 space-y-3">
      {groupDesc && (
        <div className="mb-4 p-3 bg-base-200 rounded-lg text-center">
          <div className="text-sm font-semibold text-base-content/70">Group Description</div>
          <div className="text-base-content/90">{groupDesc}</div>
          </div>
      )}

       {groupCreator === uid && (
      // <button className="btn btn-soft btn-error btn-wide" onClick={leaveGroup}>Leave Group</button>
      
      <div> 
      <button className="btn btn-soft btn-error btn-wide" onClick={deleteGroup}>
        Delete Group
      </button>
      <EditMembers participants={participants} groupName={groupName} />
       </div>
    )}
    
    <div className="mb-4 p-3 bg-base-200 rounded-lg">
      <div className="text-sm font-semibold text-base-content/70">Participants - {participants.length} </div>
      {participants.map((p) => (
        <div key={p.id} className="flex items-center space-x-3 py-2">
          <div className="avatar">
            <div className="w-10 rounded-full">
              <img src={p.photo} alt={p.username} />
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm font-medium">{p.username}</span>
            {p.id === groupCreator && (
              <span className="text-xs text-primary">Group Admin</span>
            )}
          </div>
        </div>
      )
    )}
    </div>
      
    </div>
  )
}

const EditMembers = ({ participants }) => {
  const [groupMembers, setGroupMembers] = useState(participants)
  const friends = useContext(FriendContext)
  return (
     <div className="dropdown dropdown-bottom dropdown-end ">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-circle btn-primary m-1"
          >
            <MdGroupAdd size={20} />
          </div>
          <div className="dropdown-content menu bg-base-300 rounded-box z-1 w-52 p-2 shadow-2xl">
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-4 w-full">
              {/* <legend className="fieldset-legend">Group Name?</legend>
              <div className="join">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="input join-item"
                  placeholder="Name"
                />
                <button onClick={createGroup} className="btn join-item">
                  <CgAddR size={20} />
                </button>
              </div> */}
            </fieldset>
            <ul tabIndex={0}>
              {friends.map((friend) => (
                <GroupChatItem
                  key={friend.id}
                  friend={friend}
                  setGroupMembers={setGroupMembers}
                  groupMembers={groupMembers}
                  
                />
              ))}
            </ul>
          </div>
        </div>
  )
}

const GroupChatItem = ({ friend, setGroupMembers, groupMembers }) => {
  const isChecked = groupMembers.includes(friend.id)

  const selectMember = (event) => {
    if (event.currentTarget.checked)
      setGroupMembers([...groupMembers, friend.id])
    else setGroupMembers(groupMembers.filter((id) => id !== friend.id))
  }
  return (
    <li onClick={() => {}} className="border-b border-base-content/10 ">
      <div>
        <img
          className="w-10 h-10 rounded-full object-cover "
          src={friend.photo}
        />
        <div className="text-xs uppercase font-medium">{friend.username}</div>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={selectMember}
          className="checkbox checkbox-sm"
        />
      </div>
    </li>
  )
}

const DetailBar = ({ selectedChat, participants, uid, setSelectedChat }) => {
  const friend = participants.find((p) => p.id !== uid)
  if (!selectedChat) return <div> Error getting details </div>

  return (
    <div className=" bg-base-100  rounded-xl p-6  ">
      <div className="flex flex-col items-center space-y-4">
        <div className="text-3xl font-medium">
          {selectedChat.isGroup ? selectedChat.groupName : friend?.username}
        </div>

        <div className="avatar online">
          <div className="w-24 rounded-full">
            <img
              src={
                selectedChat.isGroup ? selectedChat.groupPhoto : friend?.photo
              }
            />
          </div>
        </div>

        
        {selectedChat.isGroup ?
         (<GroupDetails participants={participants} 
          groupCreator={selectedChat.groupCreator}
          groupName={selectedChat.groupName}
           uid={uid} 
           groupId={selectedChat.id} 
            setSelectedChat={setSelectedChat}
            groupDesc={selectedChat.groupDesc}/>
         ) 
        : (<FriendDetails friend={friend}/>)}

      </div>
    </div>
  )
}

export default DetailBar
