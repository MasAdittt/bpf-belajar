import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../config/firebase';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import NavTemplate from '../components/NavTemplate';

import '../style/Listing.css';

function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [address, setAddress] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [faqs, setFaqs] = useState([]);
  const [businessVideo, setBusinessVideo] = useState('');
  const [imageUrls, setImageUrls] = useState([]);
  const [logoUrl, setLogoUrl] = useState('');
  const [socialMedia, setSocialMedia] = useState([{ platform: 'Instagram', url: '' }]);
  useEffect(() => {
    if (id) {
      const listingRef = ref(database, `listings/${id}`);
      
      onValue(listingRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setListing({ id, ...data });
          setAddress(data.address);
          setTitle(data.title);
          setDescription(data.description);
          setCity(data.city);
          setPhone(data.phone);
          setWebsite(data.website);
          setCategory(data.category);
          setPriceRange(data.priceRange);
          setPriceFrom(data.priceFrom);
          setPriceTo(data.priceTo);
          setFaqs(data.faqs);
          setBusinessVideo(data.businessVideo);
          setImageUrls(data.imageUrls || []);
          setLogoUrl(data.logoUrl || '');
          setSocialMedia(data.socialMedia);
        } else {
          console.log("No such listing!");
          navigate('/404'); // Redirect to 404 page
        }
      },(error) => {
        console.error("Error fetching listing data:", error);
      }
    );
    }
  }, [id, navigate]);

  const handleUpdateListing = () => {
    const listingRef = ref(database, `listings/${id}`);
    update(listingRef, {
      title,
      address,
      description,
      city,
      phone,
      website,
      category,
      priceRange,
      priceFrom,
      priceTo,
      faqs,
      businessVideo,
      imageUrls,
      logoUrl,
      socialMedia,
    })
      .then(() => {
        console.log("Listing updated successfully!");
        navigate(`/template/${id}`);
      })
      .catch((error) => {
        console.error("Error updating listing:", error);
      });
  };

  const handleAddFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const handleRemoveFaq = (index) => {
    setFaqs(faqs.filter((faq, i) => i !== index));
  };


  const uploadImage = async (file) => {
    const storage = getStorage();
    const storageReference = storageRef(storage, `listings/${id}/${file.name}`);
    
    try {
      const snapshot = await uploadBytes(storageReference, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL; // This is the URL you should use to display the image
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };
 
  const removeImage = async (index) => {
    const urlToRemove = imageUrls[index];
    const storage = getStorage();
    const imageRef = storageRef(storage, urlToRemove);
  
    try {
      await deleteObject(imageRef);
      setImageUrls(prevUrls => prevUrls.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleUpdateFaq = (index, field, value) => {
    setFaqs(faqs.map((faq, i) => {
      if (i === index) {
        return { ...faq, [field]: value };
      }
      return faq;
    }));
  };

  const handleAddSocialMedia = () => {
    const availablePlatforms = ['Instagram', 'Facebook', 'Twitter', 'LinkedIn', 'Youtube'];
    const unusedPlatform = availablePlatforms.find(platform => 
      !socialMedia.some(social => social.platform === platform)
    );
    
    if (unusedPlatform) {
      setSocialMedia([...socialMedia, { platform: unusedPlatform, url: '' }]);
    } else {
      alert("Semua platform media sosial yang tersedia sudah ditambahkan.");
    }
  };

  const handleRemoveSocialMedia = (index) => {
    const newSocialMedia = [...socialMedia];
    newSocialMedia.splice(index, 1);
    setSocialMedia(newSocialMedia);
  };

  

  if (!listing) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <section className='Listing'>

     
      <div className="edit-listing-container">
        <div className="edit-listing-card">
          <NavTemplate logo={logoUrl} />

          <h2>Edit Listing</h2>
          <hr className="custom-hr" />

          <div className="Listing-form">
          <p className='kontex'>Listing Title <span> *</span></p>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            <label>Description:</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
              
            <label>Alamat:</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
          <p className='kontex'>City<span> *</span></p>
              <select 
                className="price-menu"
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="" disabled hidden>Ex: Villa, Cafe, Hotel</option>
                <option value="Canggu">Canggu</option>
                <option value="Denpasar">Denpasar</option>
                <option value="Kintamani">Kintamani</option>
                <option value="Sanur">Sanur</option>
                <option value="Ubud">Ubud</option>
                <option value="Uluwatu">Uluwatu</option>
              </select>
            <label>Phone:</label>
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <label>Website:</label>
            <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>

          <div className="Listing-form">
            <label>
            <h1 className='Primary'>CATEGORIES & SERVICE</h1>
            <hr className="custom-hr" />
            <p className='kontex'>Category</p>
            <select className="price-menu"
            name='category'
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" disabled hidden>Ex: Villa, Cafe, Hotel</option>
                <option value="Villa">Villa</option>
                <option value="Cafe">Cafe</option>
                <option value="Hotel">Hotel</option>
             </select>
             </label>
            </div>

            <div className='Listing-form'>
              <h1 className='Primary'>FREQUENTLY ASKED QUESTIONS</h1>
              <hr className="custom-hr" />
            {faqs.map((faq, index) => (
              <div key={index} className="faq-input-group">          
                <input type="text" placeholder="Questions"name="faq-question" value={faq.question} onChange={(e) => handleUpdateFaq(index, 'question', e.target.value)} />
                <input type="text" placeholder='Answer'  name="faq-answer" value={faq.answer} onChange={(e) => handleUpdateFaq(index, 'answer', e.target.value)} />
                <button className="Faq-hapus"onClick={() => handleRemoveFaq(index)}>Remove</button>
              </div>
            ))}
            <button className='Faq-tambah' onClick={handleAddFaq}>Add FAQ</button>
          </div>

            
          <div className="Listing-form">
            <label>
            <h1 className='Primary'>Price Details</h1>
            <hr className="custom-hr" />
            <div className="price-inputs">
              <div className="price-input">
            <p className='kontex'>Price Range <span> *</span></p>
            
            <select 
                    className="price-menu"
                    name="priceRange"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}>
                <option value="" disabled hidden>Select Price Range</option>
                    <option value="Not">Not To Say</option>
                    <option value="Inexpensive">$ - Inexpensive</option>
                    <option value="Moderate">$$ - Moderate</option>
                    <option value="Pricey">$$$ - Pricey</option>
                    <option value="Ultra">$$$$ - Ultra High</option>
                  </select>
                </div>

                <div className="price-input">
                  <p className='kontex'>Price From <span> *</span></p>
                  <input 
                    type='text' 
                    name="priceFrom" 
                    placeholder='Price From' 
                    value={priceFrom}
                    onChange={(e) => setPriceFrom(e.target.value)}
                  />
                </div>
                <div className="price-input">
                  <p className='kontex'>Price To <span> *</span></p>
                  <input 
                    type='text' 
                    name="priceTo" 
                    placeholder='Price To' 
                    value={priceTo}
                    onChange={(e) => setPriceTo(e.target.value)} 
                    />
                    </div>
                    </div>
                  </label>
                </div>
       
             <div className='Listing-form'>
  <label>
    <h1 className='Primary'>SOCIAL MEDIA</h1>
    <hr className="custom-hr" />
    {socialMedia.map((social, index) => (
      <div key={index} className="social-media-input">
        <select 
          className='kotak-social'
          value={social.platform}
          onChange={(e) => {
            const updatedSocialMedia = [...socialMedia];
            updatedSocialMedia[index].platform = e.target.value;
            setSocialMedia(updatedSocialMedia);
          }}
        >
          {['Instagram', 'Facebook', 'Twitter', 'LinkedIn', 'Youtube'].map(platform => (
            <option 
              key={platform} 
              value={platform}
              disabled={socialMedia.some((s, i) => i !== index && s.platform === platform)}
            >
              {platform}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={social.url}
          onChange={(e) => {
            const updatedSocialMedia = [...socialMedia];
            updatedSocialMedia[index].url = e.target.value;
            setSocialMedia(updatedSocialMedia);
          }}
          placeholder="Enter profile URL"
        />
                <button className="button-happus" type="button" onClick={() => handleRemoveSocialMedia(index)}>✖</button>
      </div>     
    ))}
        <button className="button-tambah" type="button" onClick={handleAddSocialMedia}>+</button>

  </label>
</div>

<div className="Listing-form">
<h1 className='Primary'>MEDIA</h1>
<hr className="custom-hr" />
  <label>
  <p className='kontex'>Your Business Video <span className='opsional'>(Optional)</span></p>  
    <input type="text" value={businessVideo} onChange={(e) => setBusinessVideo(e.target.value)} />
  </label>
  <p className='kontex'>Images</p>
      <div className="image-upload-area">
          <p>Drop files here or click to upload</p>
          <input 
            type="file" 
            multiple 
            onChange={async (e) => {
              const files = Array.from(e.target.files);
              const newUrls = await Promise.all(files.map(uploadImage));
              setImageUrls(prevUrls => [...prevUrls, ...newUrls]);
            }}
            id="image-upload"
          />
          <label htmlFor="image-upload" className="browse-files-btn">Browse Files</label>
        </div>
        <div className="image-preview" >
{imageUrls.map((url, index) => (
  <div key={index} style={{position: 'relative', display: 'inline-block'}}>
      <img
        src={url}
        alt={`Image ${index + 1}`}
        style={{ width: '100px', height: '100px', objectFit: 'cover', margin: '5px' }}
      />
      <button 
               onClick={() => removeImage(index)} 
              style={{
                position: 'absolute', 
                top: '0', 
                right: '0', 
                background: 'white', 
                color: '#ccc', 
                border: 'dashed', 
                borderColor : '#ccc',
                cursor: 'pointer',
                fontSize: '15px'
              }}
            >
              X
            </button>
  </div>
))}
</div>
<p className='kontex'>Upload Business Logo</p>
<div className="logo-upload-area">
  <input 
    type="file" 
    onChange={(e) => setLogoUrl(e.target.files[0])}
    style={{ display: 'none' }} 
    id="logo-upload"
  />
  <label htmlFor="logo-upload" className="browser-btn">Browse</label>
  <span className="file-name">
    {logoUrl ? logoUrl.name : 'Choose A File...'}
  </span>
</div>

</div>


          <button className="tombol-listing"  onClick={handleUpdateListing}>Update Listing</button>
        </div>
      </div>
      </section>
      <Footer />
    </>
  );
}

export default EditListing;