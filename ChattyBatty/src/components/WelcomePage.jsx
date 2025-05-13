import ThemeSelector from './ThemeSelector'
import Logo from './Logo'

const WelcomePage = ({ onClick }) => {
  return (
    <div className="relative min-h-screen bg-base-200 draggable">

      <div className="absolute top-10 right-10 z-1">
        <ThemeSelector />
      </div>

      <div className="hero min-h-screen">
        <div className="mockup-window bg-base-100 border border-base-300 p-10">
          <div className="hero-content flex-col lg:flex-row">
            <div className="bg-gradient-to-r from-primary to-secondary text-primary-content shadow-2xl rounded-lg pl-15 pr-11">
              <Logo size={250} colour="currentColor" />
              <div className="card-body"></div>
            </div>
            <div className='pl-6'>
              <h1 className="text-5xl font-bold">Welcome to ChattyBatty!</h1>
              <p className="py-8 font-medium text-lg">Talk with friends and stuff</p>
              <button className="btn btn-primary btn-lg no-drag " onClick={onClick}>
                <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" />
                Login with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomePage