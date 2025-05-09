import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore'
import auth, { db } from './firebaseConfig'

const login = async () => {
  const provider = new GoogleAuthProvider()
  const result = await signInWithPopup(auth, provider)
  const user = result.user

  const userRef = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      username: user.displayName,
      status: "I'm new!",
      photo: user.photoURL,
      creationDate: serverTimestamp(),
      friends: [],
      email: user.email,
    })
  }
}

export const logout = () => signOut(auth)

export default login
