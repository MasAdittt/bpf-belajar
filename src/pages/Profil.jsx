import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import Navbaru from '../components/Navbaru'
import '../style/Personal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faIdCard, faList, faCreditCard, faLock, faBell, faEye, faGlobe, faHotel, faChartBar } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../config/Auth';
import { getDatabase, ref, onValue } from "firebase/database";
import Bawah from '../components/Bawah';

function Profil() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (user && user.uid) {
      const db = getDatabase();
      const userRef = ref(db, `users/${user.uid}`);
      onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUsername(userData.username || 'Not provided');
        }
      });
    }
  }, [user]);

  const handleItemClick = (title) => {
    if (!user) {
      console.log('User not authenticated');
      return;
    }

    switch(title) {
      case "Your Listings":
        navigate('/All');
        break;
      case "Login & Security":
        navigate('/account/security');
        break;
      case "Personal info":
        navigate(`/personal/${user.uid}`); // Fixed: Using user.uid instead of undefined userId
        break;
      default:
        console.log(`No action defined for ${title}`);
    }
  };

  const accountItems = [
    { icon: faIdCard, title: "Personal info", description: "Provide personal details and how we can reach you" },
    { icon: faList, title: "Your Listings", description: "View, edit, and manage all your property listings" },
    // { icon: faCreditCard, title: "Payments & payouts", description: "Review payments, payouts, coupons, and gift cards" },
    { icon: faLock, title: "Login & Security", description: "Update your password and secure your account" },
    // { icon: faBell, title: "Notifications", description: "Choose notification preferences and how you want to be contacted" },
    // { icon: faEye, title: "Privacy & sharing", description: "Manage your personal data, connected services, and data sharing settings" },
    // { icon: faGlobe, title: "Global preferences", description: "Set your default language, currency, and timezone" },
    // { icon: faHotel, title: "Travel for work", description: "Add a work email for business trip benefits" },
    // { icon: faChartBar, title: "Professional hosting tools", description: "Get professional tools if you manage several properties on Airbnb" }
  ];

  return (
    <>
      <Navbaru />
      <div className='account-container'>
        <h1 className='account-title'>Account</h1>
        <p className='account-subtitle'>
          {user ? (
            <>
              Hi {username}, {user.email}
            </>
          ) : (
            'Loading user data...'
          )}
        </p>
        
        <div className='account-grid'>
          {accountItems.map((item, index) => (
            <div 
              key={index} 
              className='account-item' 
              onClick={() => handleItemClick(item.title)}
              style={{ cursor: 'pointer' }}
            >
              <FontAwesomeIcon icon={item.icon} className='account-icon' />
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
      <Bawah />
    </>
  )
}

export default Profil