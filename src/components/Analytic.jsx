import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent, analytics } from '../config/firebase';
import { logEvent } from 'firebase/analytics';

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const pageName = location.pathname;
    
    // Gunakan logEvent untuk screen_view sebagai pengganti setCurrentScreen
    logEvent(analytics, 'screen_view', {
      firebase_screen: pageName,
      firebase_screen_class: 'ReactApp'
    });
    
    // Melacak page view sebagai custom event
    trackEvent('page_view', {
      page_path: pageName,
      page_title: document.title || pageName,
      page_location: window.location.href
    });
    
  }, [location]);

  return null;
};

export default AnalyticsTracker;