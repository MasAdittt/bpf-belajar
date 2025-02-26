import React, { useState, useEffect } from 'react';
import Navbaru from '../components/Navbaru';
import Footer from '../components/Footer';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import NotifContact from '../kebutuhan/Notifcontact';
import Logo from '../assets/image/Logo.svg'; // Updated import path
import Dog1 from '../assets/image/dog1.svg';
import Cat1 from '../assets/image/Cat1.svg';
import Cat2 from '../assets/image/Cat2.svg';
import Bawah1 from '../assets/image/Bawah1.svg';
import Bawah2 from '../assets/image/Bawah2.svg';
import ScrollToTop from '../components/ui/Hook';


const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.emailjs.init("ylEha7shwxLLQuQ3K");
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const formattedMessage = `
Nama: ${formData.name}
Email: ${formData.email}
Pesan: ${formData.message}
      `;

      const templateParams = {
        to_email: 'adityabayuwicaksono38@gmail.com',
        from_name: formData.name,
        from_email: formData.email,
        message: formattedMessage,
        logo_url:'../src/assets/image/Logo.svg'
      };

      await window.emailjs.send(
        'service_k7udxdt',
        'template_vy5uupf',
        templateParams
      );

      setNotification({
        show: true,
        type: 'success',
        message: "Terima kasih telah menghubungi kami! Kami telah menerima pesan Anda dan akan segera menghubungi Anda."
      });

      setFormData({
        name: '',
        email: '',
        message: ''
      });
    } catch (error) {
      setNotification({
        show: true,
        type: 'error',
        message: `Gagal mengirim pesan. Silakan coba lagi. ${error.text}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <ScrollToTop />
    <NotifContact 
      isOpen={notification.show} 
      onClose={() => setNotification({ show: false, type: '', message: '' })}
    />

    <Navbaru />
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-[135px] py-[90px] lg:py-[120px] bg-[#F2F2F2]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white py-8 px-6 lg:py-[54px] lg:px-[32px] rounded-lg ">
          <h2 
            className="mb-4 text-2xl lg:text-[39px]" 
            style={{
              color:'#3A3A3A',
              fontFamily:'ADELIA',
              fontWeight:300,
              lineHeight:'60px'
            }}
          >
            GET IN TOUCH
          </h2>
          <p 
            className="mb-6 text-sm lg:text-base" 
            style={{
              fontFamily:'Lexend',
              fontWeight:300,
              width:'100%',
              maxWidth:'473px'
            }}
          >
            Feel free to reach out, and our team will respond promptly.
            Let's start planning a memorable adventure for you and your
            furry friend in a pet-friendly paradise!
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <TextField
                name="name"
                label="Name"
                value={formData.name}
                onChange={handleChange}
                required
                fullWidth
              />
            </div>
            
            <div>
              <TextField
                type="email"
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleChange}
                required
                fullWidth
              />
            </div>
            
            <div>
              <TextField
                name="message"
                label="Message"
                value={formData.message}
                onChange={handleChange}
                required
                multiline
                rows={4}
                fullWidth
              />
            </div>
            
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{
                fontFamily:'Lexend',
                textTransform:'none',
                backgroundColor: isLoading ? '#a0a0a0' : '#1DA19E',
                '&:hover': {
                  backgroundColor: isLoading ? '#a0a0a0' : '#168f84'
                }
              }}
              fullWidth
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg 
                    className="animate-spin h-5 w-5 mr-3 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    ></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </div>
              ) : (
                'Submit'
              )}
            </Button>
          </form>
        </div>
        
        <div className="grid grid-rows-3 gap-4 h-full">
          <div className="row-span-1 w-full h-48">
            <img
              src={Dog1}
              alt="Dog high five"
              className="rounded-lg object-cover w-full h-full"
            />
          </div>
          
          <div className="row-span-1 grid grid-cols-2 gap-4">
            <img
              src={Cat1}
              alt="Cat"
              className="rounded-lg object-cover w-full h-48"
            />
            <img
              src={Cat2}
              alt="Another cat"
              className="rounded-lg object-cover w-full h-48"
            />
          </div>
          
          <div className="row-span-1 flex gap-4">
            <div className='flex-none w-[175px] lg:w-[175px]'>
              <img
                src={Bawah1}
                alt="Running dog"
                className="rounded-lg object-cover w-full h-48"
              />
            </div>
            <div className='flex-1'>
              <img
                src={Bawah2}
                alt="Fluffy dog"
                className="rounded-lg object-cover w-full h-48"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default ContactForm;