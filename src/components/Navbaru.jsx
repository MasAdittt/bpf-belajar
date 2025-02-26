import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../config/Auth';
import { getDatabase, ref, onValue, off } from "firebase/database";
import { Menu, X } from 'lucide-react';
import SearchBar from './SearchBar';
import Logo from '../assets/image/Logo.svg';
import Swal from 'sweetalert2';
import NotifListing from '../kebutuhan/NotifListing';

import '../style/Navbar.css';

function Navbaru() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  const [showNotifListing, setShowNotifListing] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && !event.target.closest('.mobile-menu-button')) {
        setIsSidebarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, sidebarRef]);

  const handleLogout = () => {
    logout()
      .then(() => {
        navigate('/');
        setIsSidebarOpen(false);
      })
      .catch((error) => {
        console.error('Logout failed:', error);
      });
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleAddListing = () => {
    if (!user) {
      setShowNotifListing(true);
    } else {
      navigate('/Form');
    }
  };

  const navigateToProfile = () => {
    if (user && user.uid) {
      navigate(`/personal/${user.uid}`);
      setIsSidebarOpen(false);
    }
  };

  const navigateToAll = () => {
    navigate('/All');
    setIsSidebarOpen(false);
    setDropdownVisible(false);
  };

  const UserMenuContent = () => (
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
        <button className='text-left' onClick={navigateToProfile} style={{color:"#3A3A3A", fontFamily:'Lexend',fontWeight:300,padding:'8px 16px'}}>
          <i className="fas fa-user" style={{paddingRight:'20px'}}></i> My Profile
        </button>
        <button className='text-left' onClick={handleLogout} style={{color:"#3A3A3A", fontFamily:'Lexend',fontWeight:300,padding:'8px 16px'}}>
          <i className="fas fa-sign-out-alt" style={{paddingRight:'20px'}}></i> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className={`navbaru ${isScrolled ? 'scrolled' : ''}`} style={{zIndex:9999}}>
        <div className="wrapper">
          <div className="gambar">
            <img 
              src={Logo}
              alt="Bali Pet Friendly Logo"
              onClick={() => navigate('/')}
            />
          </div>

          <div className="flex justify-center">
            <div className="search-container flex justify-center ">
              <SearchBar />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="nav-buttons desktop-nav">
            <button className="Add" onClick={handleAddListing}> 
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
                    <UserMenuContent />
                  </div>
                )}
              </div>
            ) : (
              <button className="Sign" onClick={() => navigate('/Login')}>
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="mobile-menu-button" onClick={toggleSidebar}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Mobile Sidebar */}
          <div className={`mobile-sidebar ${isSidebarOpen ? 'open' : ''}`} ref={sidebarRef}>
            <div className="sidebar-content">
              <button className="close-sidebar" onClick={toggleSidebar}>
                <X size={24} />
              </button>
              <div className="sidebar-menu">
                <button className="Add w-full" onClick={() => {
                  handleAddListing();
                  setIsSidebarOpen(false);
                }}> 
                  Add Listing
                </button>
                {user ? (
                  <UserMenuContent />
                ) : (
                  <button className="Sign w-full" onClick={() => {
                    navigate('/Login');
                    setIsSidebarOpen(false);
                  }}>
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* NotifListing Modal */}
      <NotifListing 
        isOpen={showNotifListing} 
        onClose={() => setShowNotifListing(false)} 
      />
    </>
  );
}

export default Navbaru;

