import React from 'react';
import { Link } from 'react-router-dom';
import '../style/Footer.css';

function Footer() {
  return (
    <footer className="footer">
    <div className="footer-content">
      <div className="footer-left">
        <img src="https://balipetfriendly.com/wp-content/uploads/2023/10/Logo-BPF.png.webp" 
        alt="Bali Pet Friendly Logo" className="footer-logo" />
        <div className="footer-nav">
          <Link to="/faq">FAQ</Link>
          <Link to="/contact">Contact Us</Link>
        </div>
      </div>
      <div className="footer-copyright">
        © 2024 Balipetfriendly
      </div>
    </div>
  </footer>
  
  );
}

export default Footer;