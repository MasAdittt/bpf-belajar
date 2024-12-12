  import React, { useEffect, useState } from 'react';
  import Navbar from '../components/Navbar';
  import Area from '../components/Area';
  import Atas from '../components/Atas';
  import Start from '../components/Start';
  import Bawah from '../components/Bawah';
  import AOS from 'aos';
  import 'aos/dist/aos.css';
  import Visit from '../components/Visit';
  import parse from 'html-react-parser';
  import '../style/Home.css';

  // Pastikan import data section dengan benar
  import { StartSection, StartList } from '../data/StartSection';

  function Home() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
      // Prevent animation glitches on initial load
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100);

      // Initialize AOS with optimized settings
      AOS.init({
        duration: 800,
        once: true,
        mirror: false,
        offset: 50,
        easing: 'ease-out',
        delay: 0,
        startEvent: 'DOMContentLoaded',
        disableMutationObserver: false,
      });

      // Clean up function
      return () => {
        clearTimeout(timer);
        AOS.refresh();
      };
    }, []);

    // Memastikan data section valid sebelum parsing
    const renderAreaSection = () => {
      if (typeof AreaSection?.Area === 'string') {
        return parse(AreaSection.Area);
      }
      return null;
    };

    const renderStartSection = () => {
      if (typeof StartSection?.Start === 'string') {
        return parse(StartSection.Start);
      }
      return null;
    };

    return (
      <div className={`home-container ${isLoaded ? 'loaded' : ''}`}>
        <Navbar />
        <main className="content-wrapper">
          <Atas />
          
         <Area />
          
          {/* Visit Section */}
          <Visit />
       
          
              <Start />
          
          
          
          {/* Bottom Section */}
          <div data-aos="fade-up">
            <Bawah />
          </div>
        </main>
      </div>
    );
  }

  export default Home;