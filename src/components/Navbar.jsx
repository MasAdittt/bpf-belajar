import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../config/Auth';
import { getDatabase, ref, onValue, off } from "firebase/database";
import NotifListing from '../kebutuhan/NotifListing';
import Logo from '../assets/image/Logo.svg';


function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showNotifListing, setShowNotifListing] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user?.emailVerified) {
      setIsAuthenticated(true);
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      
      const unsubscribe = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUsername(userData.username || user.email || 'User');
          setProfilePhoto(userData.profilePhoto || null);
        } else {
          setUsername(user.email || 'User');
          setProfilePhoto(null);
        }
      });

      return () => {
        off(userRef, 'value', unsubscribe);
        setIsAuthenticated(false);
      };
    } else {
      setIsAuthenticated(false);
      setUsername('');
      setProfilePhoto(null);
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = () => {
    logout()
      .then(() => {
        setIsAuthenticated(false);
        setUsername('');
        setProfilePhoto(null);
        navigate('/');
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleAddListing = () => {
    if (!user) {
      setShowNotifListing(true);
      return;
    }
    
    if (!user.emailVerified) {
      alert('Please verify your email first');
      return;
    }
    
    navigate('/Form');
  };

  const navigateToProfile = () => {
    if (!user) {
      setShowNotifListing(true);
      return;
    }
    
    if (!user.emailVerified) {
      alert('Please verify your email first');
      return;
    }
    
    navigate(`/personal/${user.uid}`);
  };

  const UserMenu = () => (
    <div className="user-menu-content">
      <div className="dropdown-header">
        {profilePhoto ? (
          <img src={profilePhoto} alt="User Profile" className="profile-image-small" />
        ) : (
          <div className="profile-image-small profile-photo-placeholder">
            <span>{username ? username[0].toUpperCase() : 'U'}</span>
          </div>
        )}
        <span>{username}</span>
      </div>
      <div className="flex flex-col gap-2 menu-items-container justify-start text-start">
        <button className='text-left' onClick={navigateToProfile} style={{color:"#3A3A3A", fontFamily:'Lexend',fontWeight:300}}>
          <i className="fas fa-user" style={{paddingRight:'20px'}}></i> My Profile
        </button>
        <button className='text-left' onClick={handleLogout} style={{color:"#3A3A3A", fontFamily:'Lexend',fontWeight:300}}>
          <i className="fas fa-sign-out-alt" style={{paddingRight:'20px'}}></i> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <nav>
        <div className="wrapper">
          <div className="gambar">
          <img 
              src={Logo}
              alt="Bali Pet Friendly Logo"
              onClick={() => navigate('/')}
            />
          </div>

          {/* Navigation (Desktop & Mobile) */}
          <div className="nav-buttons">
            <button className="Add" onClick={handleAddListing}> 
              Add Listing
            </button>

            {isAuthenticated ? (
              <div className="user-info" ref={dropdownRef}>
                {profilePhoto ? (
                  <img 
                    src={profilePhoto} 
                    alt="User Profile" 
                    className="profile-image" 
                    onClick={toggleDropdown}
                  />
                ) : (
                  <div 
                    className="profile-image profile-photo-placeholder" 
                    onClick={toggleDropdown}
                  >
                    <span>{username ? username[0].toUpperCase() : 'U'}</span>
                  </div>
                )}
                {dropdownVisible && (
                  <div className="dropdown-menu">
                    <UserMenu />
                  </div>
                )}
              </div>
            ) : (
              <button className="Sign" onClick={() => navigate('/Coba')}>
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* NotifListing Modal */}
      <NotifListing 
        isOpen={showNotifListing} 
        onClose={() => setShowNotifListing(false)} 
      />
    </>
  );
}

export default Navbar;
