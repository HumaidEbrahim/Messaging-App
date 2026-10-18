import { useAuthState } from 'react-firebase-hooks/auth'
import WelcomePage from '@/components/WelcomePage'
import MainApp from '@/components/MainApp'
import Logo from '@/components/Logo'
import auth, { missingConfig } from './firebaseConfig'

const FullScreenMessage = ({ children }) => (
  <div className="min-h-dvh grid place-items-center bg-base-200 p-6 draggable">
    <div className="flex flex-col items-center gap-4 text-center max-w-md">
      {children}
    </div>
  </div>
)

const App = () => {
  const [user, loading, error] = useAuthState(auth)

  if (missingConfig.length > 0) {
    return (
      <FullScreenMessage>
        <h1 className="text-2xl font-bold">Firebase isn't configured</h1>
        <p className="text-base-content/70">
          Run <code className="font-mono">npx firebase login</code> and then{' '}
          <code className="font-mono">npm run setup</code> to create{' '}
          <code className="font-mono">ChattyBatty/.env</code> for you. Or add
          these values from the Firebase console yourself, then restart the dev
          server:
        </p>
        <pre className="bg-base-300 rounded-box p-4 text-left text-sm w-full overflow-x-auto">
          {missingConfig
            .map(
              (key) =>
                `VITE_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}=`,
            )
            .join('\n')}
        </pre>
      </FullScreenMessage>
    )
  }

  if (loading) {
    return (
      <FullScreenMessage>
        <Logo
          size={72}
          className="text-primary animate-pulse"
          title="ChattyBatty"
        />
        <span className="sr-only">Loading</span>
      </FullScreenMessage>
    )
  }

  if (error) {
    return (
      <FullScreenMessage>
        <h1 className="text-2xl font-bold">Couldn't check your sign-in</h1>
        <p className="text-base-content/70">{error.message}</p>
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </FullScreenMessage>
    )
  }

  // Keying by uid resets all app state when a different account signs in.
  return user ? <MainApp key={user.uid} authUser={user} /> : <WelcomePage />
}

export default App
