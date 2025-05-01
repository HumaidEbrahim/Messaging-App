import WelcomePage from '@/components/WelcomePage'
import MainApp from '@/components/MainApp'

import { useAuthState } from 'react-firebase-hooks/auth'
import login from './Login'
import auth from './firebaseConfig'

const App = () => {
  const [user] = useAuthState(auth)

  console.log(user)

  return (
    <div>
      {user ? <MainApp user={user} /> : <WelcomePage onClick={login} />}
    </div>
  )
}

export default App
