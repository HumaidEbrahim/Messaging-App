const FriendDetails = () => {
  return (
    <>
      {/* <div className="text-sm text-gray-500 italic">{friend.status}</div>

        <div className="text-sm text-gray-600">{friend.email}</div> */}
    </>
  )
}

const GroupDetails = ({ participants, groupCreator }) => {
  return (
    <div className="w-full mt-4 space-y-3">
      <div className="text-lg font-semibold mb-2">Participants</div>
      {participants.map((p) => (
        <div key={p.id} className="flex items-center space-x-3">
          <div className="avatar">
            <div className="w-10 rounded-full">
              <img src={p.photo} alt={p.username} />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{p.username}</span>
            {p.id === groupCreator && (
              <span className="text-xs text-primary">Group Creator</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}


const DetailBar = ({ selectedChat, participants, uid }) => {
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

        
        {selectedChat.isGroup ? (<GroupDetails participants={participants} groupCreator={selectedChat.groupCreator}/>) : (<FriendDetails />)}

      </div>
    </div>
  )
}

export default DetailBar
