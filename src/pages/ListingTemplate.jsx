import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, off, remove, update } from 'firebase/database';
import { database } from '../config/firebase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import NavTemplate from '../components/NavTemplate';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faUser, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faTwitter, faLinkedin, faYoutube } from '@fortawesome/free-brands-svg-icons';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// import '../style/Template.css';

function ListingTemplate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);
  const socialIcons = {
    Instagram: faInstagram,
    Facebook: faFacebook,
    Twitter: faTwitter,
    LinkedIn: faLinkedin,
    Youtube: faYoutube,
  };
  const [username, setUsername] = useState(null);

  useEffect(() => {
    if (id) {
      const listingRef = ref(database, `listings/${id}`);
      
      const listener = onValue(listingRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setListing({ id, ...data });
        } else {
            // Ambil userId atau userEmail dari listing dan fetch username
            if (data.userId) {
              const userRef = ref(database, `users/${data.userId}`);
              onValue(userRef, (userSnapshot) => {
                const userData = userSnapshot.val();
                if (userData) {
                  setUsername(userData.username);
                } else {
                  setUsername('Pengguna anonim');
                }
              });
            } else {
              setUsername('Pengguna anonim');
            }
          console.log("No such listing!");
          navigate('/404'); // Redirect to 404 page
        }
      });

      // Cleanup listener on unmount
      return () => off(listingRef, 'value', listener);
    }
  }, [id, navigate]);

  const toggleFaq = (index) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

  const getYoutubeVideoId = (url) => {
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  const formatDescription = (description) => {
    // Pisahkan string menjadi array dengan newline sebagai delimiter
    const lines = description.split('\n');

    // Proses setiap baris
    return lines.map((line, index) => {
      if (line.trim().startsWith('•')) {
        // Jika baris diawali dengan bullet point, buat list item
        return <li key={index}>{line.trim().slice(1).trim()}</li>;
      } else if (line.trim() === '') {
        // Jika baris kosong, gunakan <br/> untuk paragraf baru
        return <br key={index} />;
      } else {
        // Jika baris tidak kosong atau bullet, buat paragraf
        return <p key={index}>{line}</p>;
      }
    });
  };

  const handleDelete = () => {
    const isConfirmed = window.confirm("Apakah Anda yakin ingin menghapus listing ini?");
    if (isConfirmed) {
      const listingRef = ref(database, `listings/${id}`);
      remove(listingRef)
        .then(() => {
          console.log("Listing berhasil dihapus.");
          navigate('/All'); // Arahkan ke halaman utama atau daftar listing
        })
        .catch((error) => {
          console.error("Error saat menghapus listing:", error);
          alert("Terjadi kesalahan saat menghapus listing. Silakan coba lagi.");
        });
    }
  };

  const handlePosting = () => {
    const listingRef = ref(database, `listings/${id}`);
    update(listingRef, { status: 'pending' })
      .then(() => {
        console.log("Listing set to pending for approval.");
        toast.success('Listing has been submitted for approval!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      })
      .catch((error) => {
        console.error("Error setting listing to pending:", error);
        toast.error('An error occurred. Please try again.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      });
  };
  

  if (!listing) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <ToastContainer /> 
      <div className="listing-template-container">
        <div className="listing-card">
          <NavTemplate logo={listing.logoUrl} />

          {listing.imageUrls?.length > 0 && (
            <div className="image-gallery">
              <div className="main-image">
                <img src={listing.imageUrls[0]} alt={`Gambar 1`} />
              </div>
              <div className="secondary-images">
                {listing.imageUrls.slice(1, 5).map((url, index) => (
                  <div key={index} className="secondary-image">
                    <img src={url} alt={`Gambar ${index + 2}`} />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className='lurus'>
          <h2 className='judul-template'>{listing.title}</h2>
         
          <div className='lurus-button'>
          <button className="Edit" onClick={() => navigate(`/Edit/${id}`)}>Edit</button>
          <button className='Hapus' onClick={(e) => {
            e.stopPropagation(); // Mencegah event klik pada card
              handleDelete(listing.id);
              }}>Remove</button>
              <button className="Posting" onClick={handlePosting}>Posting</button>
              </div>
            </div>
            <hr className="custom-hr" />
          {/* Menggunakan formatDescription untuk menampilkan deskripsi */}
            <strong>Deskripsi:</strong>
            <div>{formatDescription(listing.description)}</div>
          

          <p className="listing-creator">
            <FontAwesomeIcon icon={faUser} /> Dibuat oleh: 
            {listing.username ? (
              <span className="user-email">
                <FontAwesomeIcon icon={faEnvelope} /> {listing.username}
              </span>
            ) : (
              <span>Pengguna anonim</span>
            )}
          </p>

          <p><strong>Alamat:</strong> {listing.address}</p>
          <p><strong>Kota:</strong> <FontAwesomeIcon icon={faBuilding} /> {listing.city}</p>
          <p><strong>Telepon:</strong> {listing.phone}</p>
          
          <p><strong>Website:</strong> <a href={listing.website} target="_blank" rel="noopener noreferrer">{listing.website}</a></p>
          <p><strong>Kategori:</strong> {listing.category}</p>  
          <p><strong>Rentang Harga:</strong> {listing.priceRange}</p>
          <p><strong>Harga:</strong> {listing.priceFrom} - {listing.priceTo}</p>
          
          {listing.faqs?.length > 0 && (
            <div className="faq-section">
              <h3>Frequently Asked Questions</h3>
              {listing.faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <h4 onClick={() => toggleFaq(index)} className="faq-question">
                    Q: {faq.question}
                  </h4>
                  {activeFaqIndex === index && <p>A: {faq.answer}</p>}
                </div>
              ))}
            </div>
          )}

{listing.socialMedia && listing.socialMedia.length > 0 && (
          <div className="social-media-section">
            <h3>Follow us on Social Media:</h3>
            <div className="social-icons">
              {listing.socialMedia.map((social, index) => (
                <a key={index} href={social.url} target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={socialIcons[social.platform]} size="2x" />
                </a>
              ))}
            </div>
          </div>
        )}

          {listing.businessVideo && (
            <div className="business-video">
              <h3>Video Bisnis</h3>
              <iframe 
                width="800" 
                height="400"
                src={`https://www.youtube.com/embed/${getYoutubeVideoId(listing.businessVideo)}`} 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                title="Business Video"
              ></iframe>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ListingTemplate;
