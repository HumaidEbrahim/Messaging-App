const DetailBar = ({ selectedChat }) => {

    if(!selectedChat)
        return <div> Error getting details </div>

    const friend = selectedChat.friend

    return (
        <div className=" bg-base-100  rounded-xl p-6  ">
          <div className="flex flex-col items-center space-y-4">
            
            <div className="text-3xl font-medium">
              {friend.username}
            </div>
      
            <div className="avatar online">
              <div className="w-24 rounded-full">
                <img src={friend.photo} alt="Friend avatar" />
              </div>
            </div>
      
            <div className="text-sm text-gray-500 italic">
              {friend.status}
            </div>
      
            <div className="text-sm text-gray-600">
              {friend.email}
            </div>
            
          </div>
        </div>
      );
      
}

export default DetailBar