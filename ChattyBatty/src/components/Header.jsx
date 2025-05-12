import ThemeSelector from './ThemeSelector'
import { logout } from '../Login'
import Logo from './Logo'

const Header = ({ photo, username }) => {
  return (
    <div className="pl-8 pr-8  bg-base-200 shadow-sm flex items-center justify-between draggable">
      <div className="navbar-start">
        <h1 className="text-xl font-semibold ">ChattyBatty</h1>
       <Logo size={56} colour="currentColor"/>
      </div>
      <div className="navbar-center"></div>
      <div className="navbar-end">
        <ThemeSelector />
      </div>
    </div>
  )
}

export default Header
