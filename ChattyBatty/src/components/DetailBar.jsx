const FriendDetails = () => {
  return (
    <> 
    {/* <div className="text-sm text-gray-500 italic">{friend.status}</div>

        <div className="text-sm text-gray-600">{friend.email}</div> */}
        </>
  )
}

const GroupDetails = () => {
  return (
    <>
    Participants
    </>
  )
}


const DetailBar = ({ selectedChat, participants, uid }) => {

   const friend = participants.find((p) => p !== uid)
  if (!selectedChat) return <div> Error getting details </div>


  return (
    <div className=" bg-base-100  rounded-xl p-6  ">
      <div className="flex flex-col items-center space-y-4">
        <div className="text-3xl font-medium">{selectedChat.isGroup? selectedChat.groupName : friend?.username}</div>

        <div className="avatar online">
          <div className="w-24 rounded-full">
            <img src={selectedChat.isGroup? selectedChat.groupPhoto : friend?.photo}  />
          </div>
        </div>

        {selectedChat.isGroup? <GroupDetails /> : <FriendDetails />}
        
      </div>
    </div>
  )
}

export default DetailBar
