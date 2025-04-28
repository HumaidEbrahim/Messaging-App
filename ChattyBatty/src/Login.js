import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import auth from './firebaseConfig'

const login = async () =>
{
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    console.log(user)
}

export const logout = () =>
     signOut(auth)

export default login