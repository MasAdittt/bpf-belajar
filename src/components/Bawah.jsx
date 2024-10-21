  import React from 'react';
  import { useNavigate } from 'react-router-dom';
  import { useAuth } from '../config/Auth';
  import Swal from 'sweetalert2';
  import Footer from './Footer';
  import '../style/Bawah.css';

  function Bawah() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleGetStarted = () => {
      if (!user) {
        Swal.fire({
          title: 'Login Required',
          text: 'You must login to continue.',
          icon: 'warning',
          confirmButtonText: 'OK'
        }).then(() => {
          navigate('/Coba');
        });
      } else {
        navigate('/All');
      }
    };

    return (
      <>
      <section className='bawah-sec'>
        <div className='sibuk'>
          <div className='bawah-judul'>
            <h3 className="pet">HAVE A PET FRIENDLY PLACE?</h3>
            <p className='font-bawah'>Join the community of hundreds of pet-friendly businesses in Bali.</p>
            <button className="tombol" type="button" onClick={handleGetStarted}>
              List Your Business
            </button>
          </div>
        </div>
      </section>
      <Footer />
      </>
    );
  }

  export default Bawah;