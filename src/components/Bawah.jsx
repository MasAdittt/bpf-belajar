import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../config/Auth';
import Swal from 'sweetalert2';
import Footer from './Footer';
import '../style/Bawah.css';
import NotifListing from '../kebutuhan/NotifListing';
import footerBg from '../assets/image/footer.jpg';

function Bawah() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showNotifListing, setShowNotifListing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleGetStarted = () => {
    if (!user) {
      setShowNotifListing(true);
    } else {
      if (!user.emailVerified) {
        Swal.fire({
          title: 'Email Not Verified',
          text: 'Please verify your email before continuing.',
          icon: 'warning',
          confirmButtonText: 'OK'
        }).then(() => {
          navigate('/Coba');
        });
      } else {
        navigate('/Form');
      }
    }
  };

  const backgroundStyle = {
    backgroundImage: `url(${footerBg})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: isMobile ? '0% center' : 'center', // Adjust position for mobile
  };

  return (
    <>
      <div className="bawah-sec" style={backgroundStyle}>
        <div className="bawah-judul">
          <h2 className="pet">HAVE A PET FRIENDLY PLACE?</h2>
          <p className="font-bawah">
            Join the community of hundreds of pet-friendly businesses in Bali.
          </p>
          <button onClick={handleGetStarted} className="tombol">
            List Your Business
          </button>
        </div>
      </div>
      <Footer />
      <NotifListing 
        isOpen={showNotifListing} 
        onClose={() => setShowNotifListing(false)} 
      />
    </>
  );
}

export default Bawah;