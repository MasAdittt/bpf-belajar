import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ref, onValue } from "firebase/database";
import { database } from '../config/firebase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import NavTemplate from '../components/NavTemplate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faUser, faEnvelope } from '@fortawesome/free-solid-svg-icons';

import '../style/Template.css';

function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);

  useEffect(() => {
    const listingRef = ref(database, `listings/${id}`);
    onValue(listingRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setListing({ id, ...data });
      } else {
        console.log("No such listing!");
      }
    });
  }, [id]);

  const toggleFaq = (index) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

  if (!listing) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="listing-template-container">
        <div className="listing-card">
          <NavTemplate logo={listing.logoUrl} />
          {/* Render listing details similar to ListingTemplate */}
          {/* ... */}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ListingDetail;