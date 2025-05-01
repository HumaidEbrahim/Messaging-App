import { useFriends } from '../FriendContext'

const Friend = ({ friend }) => {
  return (
    <li className="list-row">
      <div>
        <img className="w-10 rounded-full" src={friend.photo} />
      </div>
      <div>
        <div>{friend.username}</div>
        <div className="text-xs uppercase font-semibold opacity-60">
          {friend.status}
        </div>
      </div>
    </li>
  )
}

const FriendsList = () => {
  const friends = useFriends()
  console.log(friends)

  if (!friends) return 'No friends'

  return (
    <ul className="list bg-base-100 rounded-box shadow-md">
      {friends.map((friend) => (
        <Friend friend={friend} />
      ))}
      <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Friends</li>
    </ul>
  )
}

export default FriendsList
