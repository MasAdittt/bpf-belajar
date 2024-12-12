import React, {useState} from 'react';
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

  const handleGetStarted = () => {
    if (!user) {
      setShowNotifListing(true);
    } else {
      // Tambahkan pengecekan verifikasi email di sini juga
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
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
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
      {/* NotifListing Modal */}
<NotifListing 
  isOpen={showNotifListing} 
  onClose={() => setShowNotifListing(false)} 
/>
    </>
  );
}

export default Bawah;