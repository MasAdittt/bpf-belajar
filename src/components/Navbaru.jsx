import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../config/Auth';
import { getDatabase, ref, onValue, off } from "firebase/database";
import SearchBar from './SearchBar';
import '../style/Navbar.css';

function Navbaru() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const dropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    if (user && user.uid) {
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

      return () => off(userRef, 'value', unsubscribe);
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
        navigate('/');
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const navigateToProfile = () => {
    if (user && user.uid) {
      navigate(`/Profil/${user.uid}`);
    } else {
      console.error('User ID not available');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  return (
    <div className='navbaru'>
      <div className="wrapper">
        <div className="gambar">
          <img 
            src="https://balipetfriendly.com/wp-content/uploads/2023/10/Logo-BPF.png.webp" 
            alt="Bali Pet Friendly Logo"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
        </div>

       <SearchBar />

        <div className="nav-buttons">
          <button className="Add" onClick={() => navigate('/Listing')}> 
            Add Listing
          </button>

          {user ? (
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
                  <button onClick={navigateToProfile}>
                    <i className="fas fa-user"></i> Your profile
                  </button>
                  <button onClick={() => { /* Handle menu item click */ }}>
                    <i className="fas fa-star"></i> Menu Item
                  </button>
                  <button onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
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
    </div>
  );
}

export default Navbaru;