  import React, { useState, useEffect } from 'react';
  import { ref, push, set } from "firebase/database";
  import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
  import { database } from '../config/firebase';
  import Navbar from '../components/Navbar';
  import '../style/Listing.css';
  import { useNavigate } from 'react-router-dom';
  import Footer from '../components/Footer';
  import { useAuth } from '../config/Auth.jsx';
  import { toast, ToastContainer } from 'react-toastify';
  import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
import { Box, TextField, Button, Typography, Card, CardContent } from '@mui/material';


function Listing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [instagram, setInstagram] = useState(''); // Changed to single Instagram state
  const [businessVideo, setBusinessVideo] = useState('');
  const [images, setImages] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    address: '',
    city: '',
    phone: '',
    website: '',
    category: '',
    priceRange: '',
    priceFrom: '',
    priceTo: '',
    description: '',
    tags: '',
  });

    const countWords = (text) => {
      if (!text) return 0;
      return text.trim().split(/\s+/).length;
    };
   // Update the handleInputChange function to add real-time title validation
   const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'title') {
      if (value.length > 50) {
        toast.warning(`Title must not exceed 50 characters (currently: ${value.length} characters)`);
        return; // Prevent updating state if character limit is exceeded
      }
    }
  
  setFormData(prevState => ({
    ...prevState,
    [name]: value
  }));
};

    useEffect(() => {
      // Membersihkan URL objek ketika komponen unmount
      return () => {
        images.forEach(image => URL.revokeObjectURL(image));
      };
    }, [images]);

    useEffect(() => {
      if (!user) {
        // Menampilkan pesan error menggunakan SweetAlert
        Swal.fire({
          title: 'Login Required',
          text: 'You must login to continue.',
          icon: 'warning',
          confirmButtonText: 'OK',
          willClose: () => {
            // Redirect ke halaman login setelah menutup SweetAlert
            navigate('/Coba', { replace: true }); // Ini akan mengganti halaman tanpa menambahkannya ke history
          }
        });
      }
    }, [user, navigate, location]);
  

     // Handle Instagram URL change
  const handleInstagramChange = (e) => {
    setInstagram(e.target.value);
  };

    const handleBusinessVideoChange = (e) => {
      setBusinessVideo(e.target.value);
    };

    const handleImageUpload = (e) => {
      const files = Array.from(e.target.files);
      setImages(prevImages => [...prevImages, ...files]);
    };

    const removeImage = (index) => {
      setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!user) {
        toast.error("Please login first to create a listing.");
        navigate('/Coba');
        return;
      }
    
      const errors = validateForm();
      if (errors) {
        console.log('Form validation errors:', errors);
        toast.warning("Please fill in all required fields.");
        return;
      }
      
      setIsLoading(true);
      setIsSubmitDisabled(true);
      
      try {
        // Create normalized title (lowercase, remove special characters)
        const normalizedTitle = formData.title
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .trim()
          .replace(/\s+/g, '-');
    
        // Upload images
        const storage = getStorage();
        const imageUrls = await Promise.all(
          images.map(async (image) => {
            const imagePath = `listings/${Date.now()}_${image.name}`;
            const imageRef = storageRef(storage, imagePath);
            await uploadBytes(imageRef, image);
            return getDownloadURL(imageRef);
          })
        );
        // Prepare listing data with all required fields
        const listingData = {
          ...formData,
          normalizedTitle,  // Required field as per rules
          instagram,
          businessVideo,
          imageUrls,
          userId: user.uid,
          userEmail: user.email, // Required field as per rules
          username: user.displayName || 'Anonymous User',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          recommendations: 0, // Initialize recommendations as per rules
          reviews: {} // Initialize empty reviews object
        };
    
        // Validate required fields as per rules
        const requiredFields = {
          title: listingData.title,
          description: listingData.description,
          userEmail: listingData.userEmail,
          normalizedTitle: listingData.normalizedTitle
        };
    
        // Check if all required fields are present and valid
        const missingFields = Object.entries(requiredFields)
          .filter(([key, value]) => !value)
          .map(([key]) => key);
    
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
    
        // Save to Realtime Database
        const listingsRef = ref(database, 'listings');
        const newListingRef = push(listingsRef);
        
        await set(newListingRef, listingData);
        
        console.log("Listing saved successfully with ID:", newListingRef.key);
        toast.success("Listing saved successfully!");
        
        // Reset form after successful submission
        resetForm();
        
      } catch (error) {
        console.error("Error saving listing:", error);
        
        // Handle specific error types
        if (error.code === 'PERMISSION_DENIED') {
          toast.error("Permission denied. Please make sure you're logged in.");
        } else if (error.code === 'STORAGE_QUOTA_EXCEEDED') {
          toast.error("Storage quota exceeded. Please try uploading smaller images.");
        } else if (error.message?.includes('Missing required fields')) {
          toast.error(error.message);
        } else {
          toast.error("An error occurred while saving the listing. Please try again.");
        }
      } finally {
        setIsLoading(false);
        setIsSubmitDisabled(false);
      }
    };
    
    const validateForm = () => {
      const errors = {};
      
      if (!formData.title?.trim()) {
        errors.title = "Title is required";
      } else if (formData.title.length > 20) {
        errors.title = `Title must not exceed 50 characters (currently: ${formData.title.length} characters)`;
      }
      
      if (!formData.description?.trim()) {
        errors.description = "Description is required";
      }
      
      if (!formData.address?.trim()) {
        errors.address = "Address is required";
      }
      
      if (!formData.city) {
        errors.city = "City is required";
      }
      
      if (!formData.phone?.trim()) {
        errors.phone = "Phone is required";
      }
      
      if (!formData.website?.trim()) {
        errors.website = "Website is required";
      }
      
      if (!formData.category) {
        errors.category = "Category is required";
      }
      
      if (!formData.priceRange) {
        errors.priceRange = "Price range is required";
      }
    
      // User validation
      if (!user?.email) {
        errors.userEmail = "User email is required";
      } else {
        // Validate email format
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!emailRegex.test(user.email)) {
          errors.userEmail = "Invalid email format";
        }
      }
    
      return Object.keys(errors).length === 0 ? null : errors;
    };
    // Helper function to reset form (unchanged)
    const resetForm = () => {
      setFormData({
        title: '',
        address: '',
        city: '',
        phone: '',
        website: '',
        category: '',
        priceRange: '',
        priceFrom: '',
        priceTo: '',
        description: '',
        tags: '',
      });
      setInstagram('');
      setBusinessVideo('');
      setImages([]);
     
    };
  
    
    
    return (
      <>
        <Navbar />
        <ToastContainer />
        <section className='Listing'>
          <div className='Listing-atasan'>
            <p className='Judul'>
              {user ? (
                <div className="user-info">
                  <h2>Welcome, {user.email}</h2>
                  <p>Create your listing below</p>
                </div>
              ) : (
                <div className="user-info">
                  <h2>Welcome, Guest</h2>
                  <p>Please log in to create a listing</p>
                </div>
              )}
            </p>
          </div>
            <form onSubmit={handleSubmit}>
            <div className='Listing-form'>
              <label>
                <h1 className='Primary'>PRIMARY LISTING DETAILS</h1>
                <hr className="custom-hr" />
                <p className='kontex'>Listing Title <span> *</span></p>
                <input 
                  type='text' 
                  name="title" 
                  placeholder='Staple & Fancy Hotel' 
                  value={formData.title}
                  maxLength={50}
                  onChange={handleInputChange}
                />
                <p className='kontex'>Full Address (Geolocation)<span> *</span></p>
                
                <input 
                  type='text' 
                  name="address" 
                  placeholder='Start Typing and Find your place in Google Map' 
                  value={formData.address}
                  onChange={handleInputChange}          
                />
                <p className='kontex'>City<span> *</span></p>
                <select 
                  className="price-menu"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                >
                  <option value="" disabled hidden>Ex: Canggu, Denpasar, Kintamani</option>
                  <option value="Canggu">Canggu</option>
                  <option value="Denpasar">Denpasar</option>
                  <option value="Kintamani">Kintamani</option>
                  <option value="Kuta">Kuta</option>
                  <option value="Sanur">Sanur</option>
                  <option value="Ubud">Ubud</option>
                  <option value="Uluwatu">Uluwatu</option>
                </select>
                <p className='kontex'>Phone<span> *</span></p>
                <input 
                  type='text' 
                  name="phone" 
                  placeholder='Example : +6281782....' 
                  value={formData.phone}
                  onChange={handleInputChange}
                />
               
                <p className='kontex'>Website <span> *</span></p>
                <input 
                  type='url' 
                  name="website" 
                  placeholder='http://' 
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </label>
            </div>

            <div className='Listing-form'>
              <label>
                <h1 className='Primary'>CATEGORIES & SERVICE</h1>
                <hr className="custom-hr" />
                <p className='kontex'>Category</p>
                <select 
                  className="price-menu"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="" disabled hidden>Ex: Villa, Cafe, Hotel</option>
                  <option value="Villa">Villa</option>
                  <option value="Cafe">Cafe</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Mall">Mall</option>
                  <option value="Restaurant">Restaurant</option>
                  
                </select>
              </label>
            </div>

           

            <div className='Listing-form'>
              <label>
                <h1 className='Primary'>Price Details</h1>
                <hr className="custom-hr" />
                <div className="price-inputs">
                  <div className="price-input">
                    <p className='kontex'>Price Range <span> *</span></p>
                    <select 
                      className="price-menu"
                      name="priceRange"
                      value={formData.priceRange}
                      onChange={handleInputChange}
                    >
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
                        value={formData.priceFrom}
                        onChange={handleInputChange}
                      />
                  </div>
                  <div className="price-input">
                    <p className='kontex'>Price To <span> *</span></p>
                    <input 
                      type='text' 
                      name="priceTo" 
                      placeholder='Price To' 
                      value={formData.priceTo}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </label>
            </div>
            
            
            <div className='Listing-form'>
              <label>
                <h1 className='Primary'>MORE INFO</h1>
                <hr className="custom-hr" />
                <p className='kontex'>Description <span> *</span></p>
                <textarea
                  name="description"
                  placeholder='Enter a detailed description here'
                  rows="4"
                  cols="50"
                  value={formData.description}
                  onChange={handleInputChange}
                />
                <p className='kontex'>Tags or Keywords (Comma separated)</p>
                <textarea
                  name="tags"
                  placeholder='Enter tags or keywords here'
                  rows="2"
                  cols="50"
                  value={formData.tags}
                  onChange={handleInputChange}
                />
              </label>
            </div>

  <div className='Listing-form'>
  <label>
            <h1 className='Primary'>SOCIAL MEDIA</h1>
            <hr className="custom-hr" />
            <div className="social-media-input">
              <p className='kontex'>Instagram Profile URL</p>
              <input
                type='url'
                placeholder='Enter your Instagram profile URL'
                value={instagram}
                onChange={handleInstagramChange}
              />
            </div>
          </label>
  </div>
            <div className='Listing-form'>
              <label>
                <h1 className='Primary'>MEDIA</h1>
                <hr className="custom-hr" />
                <div>
                  <p className='kontex'>Your Business Video <span className='opsional'>(Optional)</span></p>
                  <input 
                    type='url' 
                    name="Business video" 
                    placeholder='ex: https://youtu.be/lY2yjAdbvdQ' 
                    value={businessVideo}
                    onChange={handleBusinessVideoChange}
                  />
                </div>
                <div>
        <p className='kontex'>Images</p>
        <div className="image-upload-area">
          <p>Drop files here or click to upload</p>
          <input 
            type="file" 
            multiple 
            onChange={handleImageUpload} 
            style={{display: 'none'}} 
            id="image-upload"
          />
          <label htmlFor="image-upload" className="browse-files-btn">Browse Files</label>
        </div>
        <div className="image-preview">
          {images.map((image, index) => (
            <div key={index} style={{position: 'relative', display: 'inline-block'}}>
              <img 
                src={URL.createObjectURL(image)} 
                alt={`Preview ${index}`} 
                style={{width: '100px', height: '100px', objectFit: 'cover', margin: '5px'}} 
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
      </div>
                
              </label>
            </div>
            <button className="tombol-listing" type="submit" disabled={isSubmitDisabled}>
                 {isLoading ? (
             <>
              <span className="loading-muter"></span>
                Save & Preview
                     </>
                         ) : 'Save & Preview'}
                    </button>   

</form>
        </section>
        <Footer />
      </>
    );
  }

  export default Listing;