const DetailBar = ({ selectedChat }) => {

    if(!selectedChat)
        return <div> Error getting details </div>

    const friend = selectedChat.friend

    return(
   
        <div className='flex flex-col bg-base-200 w-80'>
             <h1 className="text-xl "> Details </h1>
             
             <div className="flex justify-center text-3xl">
                {friend.username}
           </div>
             <div className="flex justify-center">

             <div className="avatar avatar-online">
             <div className="w-30 rounded-full">
      
              <img src={friend.photo} />
              </div>
            </div>
            </div>

            <div className="flex justify-center">
               
        
             {friend.status}
             </div>

             <div className="flex justify-center">
             {friend.email}

             </div>

        </ div>
     
    )
}

export default DetailBar