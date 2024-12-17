import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../config/Auth';
import Swal from 'sweetalert2';
import Gambar1 from '../assets/image/bpet1.jpg';
import Gambar2 from '../assets/image/startbpet.jpg';
import NotifListing from '../kebutuhan/NotifListing';

const Start = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showNotifListing, setShowNotifListing] = useState(false);

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

  return (
    <>
      <div className="w-full bg-[#F2F2F2] min-h-auto py-8 md:py-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Image Card 1 with Title */}
              <div className="overflow-hidden h-[400px] md:h-[500px] xl:h-full border-0 w-full md:w-full xl:w-[374px]">
                <div className="flex flex-col h-full">
                  <h3 className="text-2xl md:text-3xl xl:text-4xl font-bold tracking-tight px-1 pb-3" 
                      style={{
                        color: '#3A3A3A', 
                        fontSize: '31px',
                        paddingRight: '45px',
                        fontFamily: 'ADELIA',
                        lineHeight: '59px',
                        '@media (min-width: 768px)': {
                          fontSize: '28px',
                          lineHeight: '48px'
                        },
                        '@media (min-width: 1280px)': {
                          fontSize: '31px',
                          lineHeight: '59px'
                        }
                      }}>
                    GET STARTED <span style={{fontFamily: 'ponari', color: '#3A3A3A'}}>&</span> CLAIM YOUR PERKS NOW!
                  </h3>
                  <div className="flex-1 relative">
                    <img 
                      src={Gambar1}
                      alt="Business people reviewing documents" 
                      className="absolute inset-0 w-full h-full object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Image Card 2 */}
              <div className="overflow-hidden relative h-[400px] md:h-[500px] xl:h-full w-full md:w-full xl:w-[374px] rounded-lg">
                <img 
                  src={Gambar2}
                  alt="Team collaboration" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* Steps Card */}
              <div className="bg-[#1DA19E26] py-6 md:py-8 xl:py-[27px] px-4 md:px-6 xl:px-[26px] h-auto md:h-[500px] xl:h-full rounded-lg w-full md:col-span-2 xl:col-auto xl:w-[374px]">
                <div className="space-y-4 md:space-y-3 xl:space-y-1">
                  <div className="pb-3 border-b border-[#6B6B6B33]">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg w-[45px] h-[45px] md:w-[50px] md:h-[50px] xl:w-[55px] xl:h-[55px] flex items-center justify-center flex-shrink-0 border border-[#6B6B6B33]" 
                           style={{fontFamily: 'Lexend', fontWeight: 500, lineHeight: '38px', fontSize: '26px', color: '#3A3A3A'}}>
                        01
                      </div>
                      <div>
                        <h3 className="mb-1" style={{fontSize: '22px', lineHeight: '32px', fontWeight: 500, fontFamily: 'Lexend', color: '#3A3A3A'}}>Claim</h3>
                      </div>
                    </div>
                    <p className="text-[#6B6B6B] mt-2" style={{fontFamily: 'Lexend', fontSize: '14px', fontWeight: 300}}>
                      Best way to start managing your business listing is by claiming it so you can update.
                    </p>
                  </div>

                  <div className="py-3 border-b border-[#6B6B6B33]">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg w-[45px] h-[45px] md:w-[50px] md:h-[50px] xl:w-[55px] xl:h-[55px] flex items-center justify-center flex-shrink-0 border border-[#6B6B6B33]" 
                           style={{fontFamily: 'Lexend', fontWeight: 500, lineHeight: '38px', fontSize: '26px', color: '#3A3A3A'}}>
                        02
                      </div>
                      <div>
                        <h3 className="mb-1" style={{fontSize: '22px', lineHeight: '32px', fontWeight: 500, fontFamily: 'Lexend', color: '#3A3A3A'}}>Promote</h3>
                      </div>
                    </div>
                    <p className="text-[#6B6B6B] mt-2" style={{fontFamily: 'Lexend', fontSize: '14px', fontWeight: 300}}>
                      Promote your pet-friendly business to pet parents.
                    </p>
                  </div>

                  <div className="pt-3 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg w-[45px] h-[45px] md:w-[50px] md:h-[50px] xl:w-[55px] xl:h-[55px] flex items-center justify-center flex-shrink-0 border border-[#6B6B6B33]" 
                           style={{fontFamily: 'Lexend', fontWeight: 500, lineHeight: '38px', fontSize: '26px', color: '#3A3A3A'}}>
                        03
                      </div>
                      <div>
                        <h3 className="mb-1" style={{fontSize: '22px', lineHeight: '32px', fontWeight: 500, fontFamily: 'Lexend', color: '#3A3A3A'}}>Convert</h3>
                      </div>
                    </div>
                    <p className="text-[#6B6B6B] mt-2" style={{fontFamily: 'Lexend', fontSize: '14px', fontWeight: 300}}>
                      Turn your online visitors into in-store customers by converting web traffic into foot traffic.
                    </p>
                  </div>

                  <button 
                    className="w-full bg-[#1DA19E] text-white py-3 md:py-2.5 xl:py-2 px-4 rounded-md text-lg md:text-base" 
                    style={{fontFamily: 'Lexend'}}
                    onClick={handleGetStarted}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NotifListing 
        isOpen={showNotifListing} 
        onClose={() => setShowNotifListing(false)} 
      />
    </>
  );
};

export default Start;