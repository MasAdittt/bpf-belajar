  import React, { useState, useEffect } from 'react';
  import { ref, push, set } from "firebase/database";
  import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
  import { database } from '../config/firebase';
  import Navbar from '../components/Navbar';
  import '../style/Listing.css';
  import { useNavigate } from 'react-router-dom';
  import Footer from '../components/Footer';
  import Bisnis from '../components/Bisnis';
  import { useAuth } from '../config/Auth.jsx';
  import { toast, ToastContainer } from 'react-toastify';
  import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';

  function Listing() {
    const { user } = useAuth();
    const navigate = useNavigate(); 
    const [socialMedia, setSocialMedia] = useState([{ platform: 'Instagram', url: '' }]);
    const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);
    const [businessVideo, setBusinessVideo] = useState('');
    const [images, setImages] = useState([]);
    const [businessLogo, setBusinessLogo] = useState(null);
    const [businessHours, setBusinessHours] = useState([
      { day: 'Monday', start: '09:00 AM', end: '05:00 PM' },
      { day: 'Tuesday', start: '09:00 AM', end: '05:00 PM' },
      { day: 'Wednesday', start: '09:00 AM', end: '05:00 PM' },
      { day: 'Thursday', start: '09:00 AM', end: '05:00 PM' },
    ]);
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

    const handleInputChange = (e) => {
      const { name, value } = e.target;
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

    const handleSocialMediaChange = (index, field, value) => {
      if (field === 'platform') {
        const platformExists = socialMedia.some((social, i) => 
          i !== index && social.platform === value
        );
        
        if (platformExists) {
          alert("Platform media sosial ini sudah ditambahkan.");
          return;
        }
      }
      
      const newSocialMedia = [...socialMedia];
      newSocialMedia[index][field] = value;
      setSocialMedia(newSocialMedia);
    };

    const handleAddFaq = () => {
      setFaqs([...faqs, { question: '', answer: '' }]);
    };

    const handleRemoveFaq = (index) => {
      const newFaqs = [...faqs];
      newFaqs.splice(index, 1);
      setFaqs(newFaqs);
    };

    const handleFaqChange = (index, field, value) => {
      const newFaqs = [...faqs];
      newFaqs[index][field] = value;
      setFaqs(newFaqs);
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

    const handleLogoUpload = (e) => {
      const file = e.target.files[0];
      setBusinessLogo(file);
    };

    const handleBusinessHoursChange = (newHours) => {
      setBusinessHours(newHours);
    };

    const validateForm = () => {
      const errors = {};
      if (!formData.title.trim()) errors.title = "Title is required";
      if (!formData.address.trim()) errors.address = "Address is required";
      if (!formData.city) errors.city = "City is required";
      if (!formData.phone.trim()) errors.phone = "Phone is required";
      if (!formData.website.trim()) errors.website = "Website is required";
      if (!formData.category) errors.category = "Category is required";
      if (!formData.priceRange) errors.priceRange = "Price range is required";
      if (!formData.description.trim()) errors.description = "Description is required";

      return Object.keys(errors).length === 0 ? null : errors;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!user) {
        toast.error("Silakan login terlebih dahulu untuk membuat listing.");
        return;
      }
      const errors = validateForm();
      if (errors) {
        console.log('Form validation errors:', errors);
        toast.warning("Mohon isi semua field yang diperlukan.");
        return;
      }
      
      setIsLoading(true);
      setIsSubmitDisabled(true);
      
      try {
        console.log('Mulai proses penyimpanan');
        
        // Upload images
        const storage = getStorage();
        const imageUrls = await Promise.all(
          images.map(async (image) => {
            const imageRef = storageRef(storage, `listings/${Date.now()}_${image.name}`);
            await uploadBytes(imageRef, image);
            return getDownloadURL(imageRef);
          })
        );
        console.log('Gambar berhasil diupload');
    
        // Upload logo
        let logoUrl = null;
        if (businessLogo) {
          const logoRef = storageRef(storage, `logos/${Date.now()}_${businessLogo.name}`);
          await uploadBytes(logoRef, businessLogo);
          logoUrl = await getDownloadURL(logoRef);
          console.log('Logo berhasil diupload');
        }
    
        // Save to Realtime Database
        const listingsRef = ref(database, 'listings');
        const newListingRef = push(listingsRef);
        await set(newListingRef, {
          ...formData,
          socialMedia,
          faqs,
          businessVideo,
          imageUrls,
          logoUrl,
          businessHours,
          userId: user.uid,
          userEmail: user.email, 
          username: user.displayName || 'Anonymous User',
          createdAt: Date.now()
        });
    
        console.log("Listing berhasil disimpan dengan ID:", newListingRef.key);
        toast.success("Listing berhasil disimpan!");
        
        // Reset form (Anda bisa memindahkan kode reset form ke sini jika diperlukan)
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
        setSocialMedia([{ platform: 'Instagram', url: '' }]);
        setFaqs([{ question: '', answer: '' }]);
        setBusinessVideo('');
        setImages([]);
        setBusinessLogo(null);
        setBusinessHours([
          { day: 'Monday', start: '09:00 AM', end: '05:00 PM' },
          { day: 'Tuesday', start: '09:00 AM', end: '05:00 PM' },
          { day: 'Wednesday', start: '09:00 AM', end: '05:00 PM' },
          { day: 'Thursday', start: '09:00 AM', end: '05:00 PM' },
        ]);
        
      } catch (error) {
        console.error("Error saat menyimpan listing:", error);
        toast.error("Terjadi kesalahan saat menyimpan listing. Silakan coba lagi.");
      } finally {
        console.log('Proses penyimpanan selesai');
        setIsLoading(false);
        setIsSubmitDisabled(false); // Mengaktifkan kembali tombol submit
      }
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
                  <option value="" disabled hidden>Ex: Villa, Cafe, Hotel</option>
                  <option value="Canggu">Canggu</option>
                  <option value="Denpasar">Denpasar</option>
                  <option value="Kintamani">Kintamani</option>
                  <option value="Sanur">Sanur</option>
                  <option value="Ubud">Ubud</option>
                  <option value="Uluwatu">Uluwatu</option>
                </select>
                <p className='kontex'>Phone<span> *</span></p>
                <input 
                  type='text' 
                  name="phone" 
                  placeholder='Your Phone Number' 
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
                <h1 className='Primary'>FREQUENTLY ASKED QUESTIONS</h1>
                <hr className="custom-hr" />
                {faqs.map((faq, index) => (
                  <div key={index} className="faq-input-group">
                    <input
                      type='text'
                      name="faq-question"
                      placeholder='FAQ'
                      value={faq.question}
                      onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                    />
                    <input
                      type='text'
                      name="faq-answer"
                      placeholder='Answer'
                      value={faq.answer}
                      onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                    />
                    <button type='button' className='Faq-hapus' onClick={() => handleRemoveFaq(index)}>Hapus</button>
                  </div>
                ))}
                <button type='button' className="Faq-tambah" onClick={handleAddFaq}>Add FAQ</button>
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
          <Bisnis hours={businessHours} onHoursChange={handleBusinessHoursChange} />
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
      {socialMedia.map((social, index) => (
        <div key={index} className="social-media-input">
          <select 
            className='kotak-social'
            value={social.platform}
            onChange={(e) => handleSocialMediaChange(index, 'platform', e.target.value)}
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
            type='url'
            placeholder='Enter your profile URL'
            value={social.url}
            onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)}
          />
          <button className="button-happus" type="button" onClick={() => handleRemoveSocialMedia(index)}>✖</button>
        </div>
      ))}
      <button className="button-tambah" type="button" onClick={handleAddSocialMedia}>+</button>
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
                <div>
                  <p className='kontex'>Upload Business Logo</p>
                  <div className="logo-upload-area">
                    <input 
                      type="file" 
                      onChange={handleLogoUpload} 
                      style={{display: 'none'}} 
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="browser-btn">Browser</label>
                      <span className="file-name">
                      {businessLogo ? businessLogo.name : 'Choose A File...'}
                    </span>
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