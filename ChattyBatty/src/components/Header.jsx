import ThemeSelector from './ThemeSelector'
import { logout } from '../Login'

const Header = ({ photo, username }) => {
  return (
    <div className="pl-8 pr-8 pt-2 bg-base-200 shadow-sm">
      <div className="navbar-start">
       
        <h1 className="text-xl font-semibold  ">ChattyBatty</h1>
      </div>
      <div className="navbar-center">
      </div>
      <div className="navbar-end">
        <ThemeSelector />
  
      </div>
    </div>
  )
}

export default Header
