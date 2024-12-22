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
import { analytics } from '../config/firebase';
import { logEvent } from 'firebase/analytics';

// Import data section
import { StartSection, StartList } from '../data/StartSection';

function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    // Track page visit
    logEvent(analytics, 'home_page_visit', {
      timestamp: new Date().toISOString()
    });

    // Track screen view
    logEvent(analytics, 'screen_view', {
      firebase_screen: 'HomePage',
      firebase_screen_class: 'HomeComponent'
    });

    // Track page load time
    const startTime = performance.now();
    window.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      logEvent(analytics, 'page_load_time', {
        page: 'home',
        load_time: loadTime
      });
    });

    // Track scroll depth
    const handleScroll = () => {
      if (!hasScrolled) {
        setHasScrolled(true);
        logEvent(analytics, 'first_scroll', {
          page: 'home'
        });
      }

      const scrollDepth = Math.round(
        (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100
      );

      if (scrollDepth >= 50 && !window.trackedMidPage) {
        window.trackedMidPage = true;
        logEvent(analytics, 'reached_middle_page', {
          page: 'home'
        });
      }

      if (scrollDepth >= 90 && !window.trackedEndPage) {
        window.trackedEndPage = true;
        logEvent(analytics, 'reached_end_page', {
          page: 'home'
        });
      }
    };

    window.addEventListener('scroll', handleScroll);

    // AOS initialization
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

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

    // Track time spent on page
    const startVisitTime = Date.now();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      AOS.refresh();

      // Track total time spent when leaving page
      const timeSpent = (Date.now() - startVisitTime) / 1000;
      logEvent(analytics, 'time_spent', {
        page: 'home',
        duration_seconds: timeSpent
      });
    };
  }, [hasScrolled]);

  // Section rendering functions
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

  // Track section visibility
  const handleSectionView = (sectionName) => {
    logEvent(analytics, 'section_view', {
      section_name: sectionName,
      page: 'home'
    });
  };

  return (
    <div className={`home-container ${isLoaded ? 'loaded' : ''}`}>
      <Navbar />
      <main className="content-wrapper">
        <div onMouseEnter={() => handleSectionView('atas')}>
          <Atas />
        </div>
        
        <div onMouseEnter={() => handleSectionView('area')}>
          <Area />
        </div>
        
        <div onMouseEnter={() => handleSectionView('visit')}>
          <Visit />
        </div>
        
        <div onMouseEnter={() => handleSectionView('start')}>
          <Start />
        </div>
        
        <div 
          data-aos="fade-up" 
          onMouseEnter={() => handleSectionView('bawah')}
        >
          <Bawah />
        </div>
      </main>
    </div>
  );
}

export default Home;