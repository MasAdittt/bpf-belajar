import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/image/Logo.svg'; // Updated import path
import '../style/Footer.css';

function Footer() {
   return (
     <footer className="footer">
       <div className="footer-content">
         <div className="footer-left">
           <img
              src={Logo} // Use imported logo
              alt="Bali Pet Friendly Logo"
              className="footer-logo"
            />
           <div className="footer-nav" style={{fontFamily:'Lexend',color:'#3A3A3A',fontWeight:300}}>
             <Link to="/Contact">Contact Us</Link>
             <a
                href="https://www.instagram.com/balipetfriendlycom?igsh=MXVyZHByYTlidm5pcQ=="
                target="_blank"
                rel="noopener noreferrer"
             >
               Instagram
             </a>
           </div>
         </div>
         <div className="footer-copyright" style={{fontFamily:'Lexend',fontWeight:500}}>
           © 2024 Balipetfriendly
         </div>
       </div>
     </footer>
   );
}

export default Footer;