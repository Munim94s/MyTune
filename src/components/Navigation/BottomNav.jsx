import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Settings, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './BottomNav.css';

const BottomNav = () => {
    const { user } = useAuth();

    return (
        <nav className="bottom-nav">
            <NavLink to="/" className="nav-item" end>
                <Home size={24} />
                <span>Home</span>
            </NavLink>

            <NavLink to="/search" className="nav-item">
                <Search size={24} />
                <span>Search</span>
            </NavLink>

            <NavLink to="/library" className="nav-item">
                <Library size={24} />
                <span>Library</span>
            </NavLink>

            <NavLink to="/settings" className="nav-item">
                <Settings size={24} />
                <span>Settings</span>
            </NavLink>

            {user ? (
                <div className="nav-item" style={{ cursor: 'default' }}>
                    {/* Mobile nav usually doesn't have logout easily accessible here without a menu. 
                        For now just showing PFP instead of login link to indicate logged in state. 
                        User can logout from Sidebar (desktop) or we add a profile page later. */}
                    {user.picture ? (
                        <img
                            src={user.picture}
                            alt={user.name}
                            style={{ width: 24, height: 24, borderRadius: '50%' }}
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <UserCircle size={24} />
                    )}
                    <span style={{ maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name.split(' ')[0]}</span>
                </div>
            ) : (
                <NavLink to="/login" className="nav-item">
                    <UserCircle size={24} />
                    <span>Login</span>
                </NavLink>
            )}
        </nav>
    );
};

export default BottomNav;
