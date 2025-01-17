import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Typography, Card, CardContent, Select, MenuItem } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faImage, faClock } from '@fortawesome/free-solid-svg-icons';
import Bawah from '../components/Bawah';
import Navbaru from '../components/Navbaru';
import Editimage from '../kebutuhan/Editgambar';
import { ref, update } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { database, firebaseAuthentication as auth } from '../config/firebase';
import { useNavigate, useParams } from 'react-router-dom';
import { onValue } from 'firebase/database';
import { toast } from 'react-toastify';
import LocationPicker from '../kebutuhan/Location';
import SuccessModal from '../kebutuhan/Notif';

const EditListing = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
    const [formData, setFormData] = useState({
        placeName: '',
        category: '',
        description: '',
        shortDescription: '',
        openingHours: '',
        closingHours: '',
        foodCategory: '',
        halalStatus: '',
        menuLink: '',
        address: '',
        city: '',
        district: '',
        phone: '',
        instagram: '',
        website: '',
        latitude:'',
        longitude:'',
        Gmaps:'',
        placeId: '', 
        imageUrls: []
    });
    
    const [location, setLocation] = useState({
        latitude: -8.409,
        longitude: 115.1889
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [originalData, setOriginalData] = useState(null);
    const [imageFiles, setImageFiles] = useState([]);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const imageComponentRef = useRef();

    const categories = ["Cafe", "Villa", "Bar", "Restaurant", "Hotel"];
    const districtMapping = {
        Badung: ['Kuta', 'North Kuta', 'South Kuta', 'Mengwi', 'Abiansemal', 'Petang'],
        Buleleng: ['Buleleng', 'Gerokgak', 'Seririt', 'Busungbiu', 'Banjar', 'Sukasada', 'Kubutambahan', 'Tejakula'],
        Bangli: ['Bangli', 'Susut', 'Tembuku', 'Kintamani'],
        Denpasar: ['west Denpasar', 'East Denpasar', 'South Denpasar', 'North Denpasar'],
        Gianyar: ['Gianyar', 'Blahbatuh', 'Tampaksiring', 'Ubud', 'Tegallalang', 'Sukawati', 'Payangan'],
        Jembrana: ['Negara', 'Melaya', 'Mendoyo', 'Pekuktatan', 'Jembrana'],
        Karangasem: ['Karangasem', 'Abang', 'Bebandem', 'Rendang', 'Selat', 'Manggis', 'Kubu'],
        Klungkung: ['Klungkung', 'Banjarakan', 'Dawan', 'Nusa Penida'],
        Tabanan: ['Tabanan', 'Kediri', 'Kerambitan', 'Marga', 'Penebel', 'Selemandeg', 'East Selemandeg', 'West Selemandeg', 'North Selemandeg', 'Pupuan']
    };

    const onLocationSelect = (position) => {
        setLocation({
            latitude: position.lat,
            longitude: position.lng
        });
        setFormData(prev => ({
            ...prev,
            location: {
                latitude: position.lat,
                longitude: position.lng
            }
        }));
    };

    const onAddressFieldFocus = () => {
        // Add your address field focus logic here if needed
    };

   

    const handleChange = (e) => {
        const { name, value } = e.target;
    
        if (name === 'category' && value !== 'Cafe' && value !== 'Restaurant') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                menuLink: ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };
    

    const handleLocationSelect = (latlng) => {
        setLocation({
            latitude: latlng.lat,
            longitude: latlng.lng,
            placeId: latlng.place_id // Ensure placeId is set
        });
        setFormData(prev => ({
            ...prev,
            latitude: latlng.lat,
            longitude: latlng.lng,
            placeId: latlng.place_id // Ensure placeId is set
        }));
    };

    useEffect(() => {
        if (originalData?.location) {
            setLocation({
                latitude: originalData.location.latitude,
                longitude: originalData.location.longitude,
            });
        }
    }, [originalData]);

    useEffect(() => {
      const fetchListingData = () => {
          const listingRef = ref(database, `listings/${id}`);
          
          onValue(listingRef, (snapshot) => {
              const data = snapshot.val();
              if (data) {
                  // Gunakan data yang sudah diapprove sebagai base
                  const approvedData = data.lastApprovedVersion || data;
                  
                  // Jika ada pending changes yang belum diapprove, tampilkan sebagai form value
                  const pendingChanges = data.pendingChanges || {};
                  
                  setFormData({
                      placeName: pendingChanges.title?.newValue || approvedData.title || '',
                      category: pendingChanges.category?.newValue || approvedData.category || '',
                      description: pendingChanges.description?.newValue || approvedData.description || '',
                      shortDescription: pendingChanges.tags?.newValue || approvedData.tags || '',
                      openingHours: pendingChanges.businessHours?.newValue?.opening || approvedData.businessHours?.opening || '',
                      closingHours: pendingChanges.businessHours?.newValue?.closing || approvedData.businessHours?.closing || '',
                      foodCategory: pendingChanges.foodCategory?.newValue || approvedData.foodCategory || '',
                      halalStatus: pendingChanges.halalStatus?.newValue || approvedData.halalStatus || '',
                      menuLink: pendingChanges.menuLink?.newValue || approvedData.menuLink || '',
                      address: pendingChanges.address?.newValue || approvedData.address || '',
                      city: pendingChanges.city?.newValue || approvedData.city || '',
                      district: pendingChanges.district?.newValue || approvedData.district || '',
                      phone: pendingChanges.phone?.newValue || approvedData.phone || '',
                      instagram: pendingChanges.instagram?.newValue || approvedData.instagram || '',
                      website: pendingChanges.website?.newValue || approvedData.website || '',
                      Gmaps: pendingChanges.website?.newValue || approvedData.Gmaps || '',
                      placeId: pendingChanges.placeId?.newValue || approvedData.placeId || '',

                      imageUrls: pendingChanges.imageUrls?.newValue || approvedData.imageUrls || []
                  });
  
                  setOriginalData(data);
                  setLocation({
                      latitude: (pendingChanges.location?.newValue || approvedData.location)?.latitude || -8.4095,
                      longitude: (pendingChanges.location?.newValue || approvedData.location)?.longitude || 115.1889,
                  });
                  setIsLoading(false);
              } else {
                  toast.error("Listing tidak ditemukan");
                  navigate('/');
              }
          });
      };
  
      fetchListingData();
  }, [id, navigate]);


        const handleCityChange = (event) => {
            const { value } = event.target;
            setFormData(prev => ({
                ...prev,
                city: value,
                district: ''
            }));
        };

        const handleDistrictChange = (event) => {
            const { value } = event.target;
            setFormData(prev => ({
                ...prev,
                district: value
            }));
        };

        const handleImageSelect = (imageData) => {
            setImageFiles(prev => [...prev, imageData.file]);
        };

        const removeImage = async (index) => {
            const urlToRemove = formData.imageUrls[index];
            const storage = getStorage();
            const imageRef = storageRef(storage, urlToRemove);
        
            try {
                await deleteObject(imageRef);
                const newImageUrls = formData.imageUrls.filter((_, i) => i !== index);
                setFormData(prev => ({
                    ...prev,
                    imageUrls: newImageUrls
                }));
            } catch (error) {
                console.error("Error deleting image:", error);
                toast.error("Failed to remove image");
            }
        };

        const handleReset = () => {
          // Kembalikan form data ke data asli
          if (originalData) {
              setFormData({
                  placeName: originalData.title || '',
                  category: originalData.category || '',
                  description: originalData.description || '',
                  shortDescription: originalData.tags || '',
                  openingHours: originalData.businessHours?.opening || '',
                  closingHours: originalData.businessHours?.closing || '',
                  foodCategory: originalData.foodCategory || '',
                  halalStatus: originalData.halalStatus || '',
                  menuLink: originalData.menuLink || '',
                  address: originalData.address || '',
                  city: originalData.city || '',
                  district: originalData.district || '',
                  phone: originalData.phone || '',
                  instagram: originalData.instagram || '',
                  website: originalData.website || '',
                  Gmaps: originalData.Gmaps || '',
                  imageUrls: originalData.imageUrls || []
              });
      
              // Reset file input
              setImageFiles([]); // Kosongkan file gambar yang baru dipilih
          }
      };

      // Replace it with this safer version that includes null checking:
const currentEditHistory = originalData && Array.isArray(originalData.editHistory) 
? originalData.editHistory 
: [];
        const uploadNewImages = async () => {
            const storage = getStorage();
            const uploadedImageUrls = [];
            
            for (const file of imageFiles) {
                const imagePath = `listings/${id}/${Date.now()}_${file.name}`;
                const imageRef = storageRef(storage, imagePath);
                
                try {
                    const snapshot = await uploadBytes(imageRef, file);
                    const url = await getDownloadURL(snapshot.ref);
                    uploadedImageUrls.push(url);
                } catch (error) {
                    console.error("Error uploading image:", error);
                    toast.error("Failed to upload some images");
                }
            }
            
            return uploadedImageUrls;
        };

        const handleCloseSuccessModal = () => {
          setIsSuccessModalOpen(false);
          navigate('/Personal'); // Navigate to the listings page
      };

      const handleSubmitChanges = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
      
        try {
          // Upload new images if any
          const newImageUrls = await imageComponentRef.current.uploadImages();
          
          // Start with existing image URLs from formData
          const updatedImageUrls = [...formData.imageUrls];
          
          if (newImageUrls && newImageUrls.length > 0) {
            newImageUrls.forEach((url, index) => {
              if (url) {
                if (index < updatedImageUrls.length) {
                  updatedImageUrls[index] = url;
                } else {
                  updatedImageUrls.push(url);
                }
              }
            });
          }
      
          // Get the base data to compare against (last approved version)
          const baseData = originalData.lastApprovedVersion || originalData;
          
          const changedFields = {};
          const pendingChanges = {};
      
          // Fungsi pembantu untuk memeriksa perubahan
          const checkChange = (key, currentValue, baseValue) => {
            if (currentValue !== baseValue) {
              changedFields[key] = currentValue;
              pendingChanges[key] = {
                oldValue: baseValue || '', // Ensure oldValue is not undefined
                newValue: currentValue,
                status: 'pending'
              };
            }
          };
          checkChange('placeId', formData.placeId, baseData.placeId);
          // Periksa perubahan lokasi
          if (
            location.latitude !== baseData.location?.latitude || 
            location.longitude !== baseData.location?.longitude ||
            location.placeId !== baseData.location?.placeId // Check placeId
          ) {
            changedFields.location = {
              latitude: location.latitude,
              longitude: location.longitude,
              placeId: location.placeId // Include placeId
            };
            pendingChanges.location = {
              oldValue: baseData.location,
              newValue: {
                latitude: location.latitude,
                longitude: location.longitude,
                placeId: location.placeId // Include placeId
              },
              status: 'pending'
            };
          }
      
          // Periksa setiap field terhadap versi yang terakhir diapprove
          checkChange('title', formData.placeName, baseData.title);
          checkChange('description', formData.description, baseData.description);
          checkChange('tags', formData.shortDescription, baseData.tags);
          
          if (formData.openingHours !== baseData.businessHours?.opening || 
              formData.closingHours !== baseData.businessHours?.closing) {
            const businessHours = {
              opening: formData.openingHours,
              closing: formData.closingHours
            };
            changedFields.businessHours = businessHours;
            pendingChanges.businessHours = {
              oldValue: baseData.businessHours,
              newValue: businessHours,
              status: 'pending'
            };
          }
      
          checkChange('category', formData.category, baseData.category);
          checkChange('foodCategory', formData.foodCategory, baseData.foodCategory);
          checkChange('halalStatus', formData.halalStatus, baseData.halalStatus);
          checkChange('menuLink', formData.menuLink, baseData.menuLink);
          checkChange('address', formData.address, baseData.address);
          checkChange('city', formData.city, baseData.city);
          checkChange('district', formData.district, baseData.district);
          checkChange('phone', formData.phone, baseData.phone);
          checkChange('instagram', formData.instagram, baseData.instagram);
          checkChange('website', formData.website, baseData.website);
          checkChange('Gmaps', formData.Gmaps, baseData.Gmaps);
      
          // Check if image URLs have changed
          if (JSON.stringify(updatedImageUrls) !== JSON.stringify(baseData.imageUrls)) {
            changedFields.imageUrls = updatedImageUrls;
            pendingChanges.imageUrls = {
              oldValue: baseData.imageUrls,
              newValue: updatedImageUrls,
              status: 'pending'
            };
          }
      
          // Only proceed if there are changes
          if (Object.keys(changedFields).length === 0) {
            toast.info("No changes detected");
            setIsSubmitting(false);
            return;
          }
      
          // Create edit history entry
          const editHistoryEntry = {
            timestamp: Date.now(),
            userEmail: auth.currentUser?.email || 'Unknown',
            changes: changedFields,
            status: 'pending'
          };
      
          // Update data in Firebase
          const updateData = {
            pendingChanges,
            lastEditRequest: {
              timestamp: Date.now(),
              changes: changedFields,
              status: 'pending'
            },
            isEdited: true,
            editStatus: 'pending',
            lastModified: Date.now(),
            editHistory: [...currentEditHistory, editHistoryEntry]
          };
      
          const listingRef = ref(database, `listings/${id}`);
          await update(listingRef, updateData);
      
          setIsSuccessModalOpen(true);
      
        } catch (error) {
          console.error("Update failed:", error);
          toast.error(`Update failed: ${error.message}`);
        } finally {
          setIsSubmitting(false);
        }
      };
        if (isLoading) {
            return <Typography>Loading...</Typography>;
        }


        return (
          <>
          <Navbaru />
          <Box sx={{ 
              minHeight: '100vh',
              width: '100%',
              backgroundColor: '#F2F2F2',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              padding: '20px',
              paddingTop:'120px'
          }}>
              <Box sx={{ 
                  width: '672px',
                  fontFamily: 'Lexend',
                  paddingBottom: '90px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
              }}>
                  <Typography variant="h5" sx={{ 
                      fontWeight: 500, 
                      marginBottom: '48px',
                      fontSize: '30px',
                      textAlign: 'center',
                      fontFamily: 'ADELIA',
                      width: '100%'
                  }}>
                      Edit Your Listing
                  </Typography>
                  
                  <Card sx={{ 
                      marginBottom: '20px',
                      width: '100%',
                      boxShadow:'none'
                  }}>
                      <CardContent sx={{padding:'32px'}}>
                          <Typography variant="h6" sx={{ 
                              fontWeight: 500, 
                              marginBottom: '10px', 
                              fontFamily: 'Lexend',
                              color:'#3A3A3A',
                              fontSize:'20px'
                          }}>
                              Tips for your listing
                          </Typography>
                          <Box sx={{ 
                              color: '#6B6B6B',
                              display: 'flex',
                              flexDirection: 'column',
                          }}>
                              <Typography sx={{ fontFamily: 'Lexend', fontSize: '14px',fontWeight:300}}>1. Landscape ratio 16:9 for location photo.</Typography>
                              <Typography sx={{ fontFamily: 'Lexend', fontSize: '14px',fontWeight:300}}>2. Add 5 photos of your place.</Typography>
                              <Typography sx={{ fontFamily: 'Lexend', fontSize: '14px',fontWeight:300}}>3. Use well-lit photos with a clear background.</Typography>
                              <Typography sx={{ fontFamily: 'Lexend', fontSize: '14px',fontWeight:300}}>4. Avoid adding text or watermarks to product photos.</Typography>
                              <Typography sx={{ fontFamily: 'Lexend', fontSize: '14px',fontWeight:300}}>5. Create a clear and engaging short description.</Typography>
                              <Typography sx={{ fontFamily: 'Lexend', fontSize: '14px',fontWeight:300}}>6. Upload your instagram and website link.</Typography>
                              <Typography sx={{ fontFamily: 'Lexend', fontSize: '14px',fontWeight:300}}>7. Make sure your location is correct.</Typography>
                          </Box>
                      </CardContent>
                  </Card>

                  <Card sx={{ 
                      width: '100%',
                      marginBottom: '20px',
                      boxShadow:'none'
                  }}>
                      <CardContent sx={{padding:'32px'}}>
                          <Box 
                              component="form" 
                              onSubmit={handleSubmitChanges} 
                              sx={{ 
                                  width: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: 3,
                                  '& .MuiTextField-root': { 
                                      width: '100%'
                                  }
                              }}
                          >
                              <TextField
                                  label="Place Name"
                                  variant="outlined"
                                  name="placeName"
                                  value={formData.placeName}
                                  onChange={handleChange}
                                  required
                                  InputProps={{
                                      sx: { 
                                          fontFamily: 'Lexend'
                                      }
                                  }}
                                  InputLabelProps={{
                                      sx: { 
                                          fontFamily: 'Lexend',
                                      
                                      }
                                  }}
                              />

    <TextField
      select
      label="Place Category"
      variant="outlined"
      name="category"
      value={formData.category}
      onChange={handleChange}
      required
      InputProps={{
          sx: { fontFamily: 'Lexend' }
      }}
      InputLabelProps={{
          sx: { fontFamily: 'Lexend' }
      }}
    >
      {categories.map((category) => (
          <MenuItem key={category} value={category} sx={{ fontFamily: 'Lexend' }}>
              {category}
          </MenuItem>
      ))}
    </TextField>



                              <TextField
                                  label="Description"
                                  variant="outlined"
                                  name="description"
                                  value={formData.description}
                                  onChange={handleChange}
                                  required
                                  multiline
                                  rows={4}
                                  InputProps={{
                                      sx: { fontFamily: 'Lexend' }
                                  }}
                                  InputLabelProps={{
                                      sx: { fontFamily: 'Lexend' }
                                  }}
                              />

                              {/* <TextField
                                  label="Short Description"
                                  variant="outlined"
                                  name="shortDescription"
                                  value={formData.shortDescription}
                                  onChange={handleChange}
                                  required
                                  placeholder="Max 100 characters"
                                  inputProps={{ maxLength: 100 }}
                                  InputProps={{
                                      sx: { fontFamily: 'Lexend' }
                                  }}
                                  InputLabelProps={{
                                      sx: { fontFamily: 'Lexend' }
                                  }}
                              /> */}
    <Editimage 
      ref={imageComponentRef}
      listingUid={id}
      existingImages={formData.imageUrls}
      onFileSelect={handleImageSelect}
    />        

                              <Box sx={{ 
                                  display: 'flex', 
                                  gap: 2, 
                                  width: '100%'
                              }}>
                                  <TextField
                                  label="Opening Hours"
                                  variant="outlined"
                                  name="openingHours"
                                  value={formData.openingHours}
                                  onChange={handleChange}
                                  required
                                  placeholder="00:00"
                                  InputProps={{
                                  startAdornment: (
                                      <FontAwesomeIcon 
                                      icon={faClock} 
                                      className="mr-2 text-neutral-600" 
                                      />
                                  ),
                                  sx: { fontFamily: 'Lexend' }
                                  }}
                                  InputLabelProps={{
                                  sx: { fontFamily: 'Lexend' }
                                  }}
                                  helperText="*24-hour clock format (00:00 - 23.59)"
                                  FormHelperTextProps={{
                                  sx: { fontFamily: 'Lexend',textAlign:'left',ml:0}
                                  }}
                              />
                                  
                                  <TextField
                                      label="Closing Hours"
                                      variant="outlined"
                                      name="closingHours"
                                      value={formData.closingHours}
                                      onChange={handleChange}
                                      required
                                      placeholder="00:00"
                                      InputProps={{
                                          startAdornment: <FontAwesomeIcon icon={faClock} style={{ marginRight: '10px', color: '#6B6B6B' }} />,
                                          sx: { fontFamily: 'Lexend' }
                                      }}
                                      InputLabelProps={{
                                          sx: { fontFamily: 'Lexend' }
                                      }}
                                  />
                              </Box>


                              <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      width: '100%'
    }}>
      <TextField
                                  label="Food Category"
                                  variant="outlined"
                                  name="foodCategory"
                                  value={formData.foodCategory}
                                  onChange={handleChange}
                                  required
                                  InputProps={{
                                      sx: { 
                                          fontFamily: 'Lexend'
                                      }
                                  }}
                                  InputLabelProps={{
                                      sx: { 
                                          fontFamily: 'Lexend',
                                      
                                      }
                                  }}
                              />
      <TextField
          select  // ubah menjadi select
          label="Halal/Non Halal/Both"
          variant="outlined"
          name="halalStatus"
          value={formData.halalStatus}
          onChange={handleChange}
          required
          fullWidth
          InputProps={{
              sx: { fontFamily: 'Lexend' }
          }}
          InputLabelProps={{
              sx: { fontFamily: 'Lexend' }
          }}
      >
          <MenuItem value="Halal" sx={{ fontFamily: 'Lexend' }}>Halal</MenuItem>
          <MenuItem value="Non-Halal" sx={{ fontFamily: 'Lexend' }}>Non-Halal</MenuItem>
          <MenuItem value="Both" sx={{ fontFamily: 'Lexend' }}>Both</MenuItem>
      </TextField>
    </Box>

    {(formData.category === "Cafe" || formData.category === "Restaurant") && (
    <TextField
        label="Upload Menu Link"
        variant="outlined"
        name="menuLink"
        value={formData.menuLink}
        onChange={handleChange}
        placeholder="PDF file preferred, shared via Google Drive link"
        inputProps={{ maxLength: 100 }}
        InputProps={{
            sx: { fontFamily: 'Lexend' }
        }}
        InputLabelProps={{
            sx: { fontFamily: 'Lexend' }
        }}
    />
)}

                              <TextField
                                  label="Address"
                                  variant="outlined"
                                  name="address"
                                  value={formData.address}
                                  onChange={handleChange}
                                  required
                                  inputProps={{ maxLength: 100 }}
                                  InputProps={{
                                      sx: { fontFamily: 'Lexend' }
                                  }}
                                  InputLabelProps={{
                                      sx: { fontFamily: 'Lexend' }
                                  }}
                              />

                              <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              width: '100%'
          }}>
              <TextField
                  select
                  label="Regency"
                  variant="outlined"
                  name="city"
                  value={formData.city}
                  onChange={handleCityChange}
                  required
                  fullWidth
                  InputProps={{
                      sx: { fontFamily: 'Lexend' }
                  }}
                  InputLabelProps={{
                      sx: { fontFamily: 'Lexend' }
                  }}
              >
                  {Object.keys(districtMapping).map((regency) => (
                      <MenuItem 
                          key={regency} 
                          value={regency}
                          sx={{ fontFamily: 'Lexend' }}
                      >
                          {regency}
                      </MenuItem>
                  ))}
              </TextField>

            

              <TextField
                  select
                  label="District"
                  variant="outlined"
                  name="District"
                  value={formData.district}
                  onChange={handleDistrictChange}
                  required
                  fullWidth
                  disabled={!formData.city} // Disabled jika regency belum dipilih
                  InputProps={{
                      sx: { fontFamily: 'Lexend' }
                  }}
                  InputLabelProps={{
                      sx: { fontFamily: 'Lexend' }
                  }}
              >
                  {formData.city && districtMapping[formData.city].map((district) => (
                      <MenuItem 
                          key={district} 
                          value={district}
                          sx={{ fontFamily: 'Lexend' }}
                      >
                          {district}
                      </MenuItem>
                  ))}
              </TextField>
          </Box>

          <LocationPicker 
    initialLocation={{
        lat: location.latitude,
        lng: location.longitude
    }}
    onLocationSelect={onLocationSelect}
    originalData={originalData}
    onAddressFieldFocus={onAddressFieldFocus}
/>

                              <TextField
                                  label="Contact Number"
                                  variant="outlined"
                                  name="phone"
                                  value={formData.phone}
                                  onChange={handleChange}
                                  placeholder='+62'
                                  inputProps={{ maxLength: 100 }}
                                  InputProps={{
                                      sx: { fontFamily: 'Lexend' }
                                  }}
                                  InputLabelProps={{
                                      sx: { fontFamily: 'Lexend' }
                                  }}
                              />

                              <TextField
                                  label="Instagram Link"
                                  variant="outlined"
                                  name="instagram"
                                  value={formData.instagram}
                                  onChange={handleChange}
                                  placeholder='Enter your url profile'
                                  inputProps={{ maxLength: 100 }}
                                  InputProps={{
                                      sx: { fontFamily: 'Lexend' }
                                  }}
                                  InputLabelProps={{
                                      sx: { fontFamily: 'Lexend' }
                                  }}
                              />

                               <TextField
                                                                  label="Google Maps Link"
                                                                  variant="outlined"
                                                                  name="Gmaps"
                                                                  value={formData.Gmaps}
                                                                  onChange={handleChange}
                                                                  placeholder='Enter your url Google Maps'
                                                                  required
                                                                  inputProps={{ maxLength: 100 }}
                                                                  InputProps={{
                                                                      sx: { fontFamily: 'Lexend' }
                                                                  }}
                                                                  InputLabelProps={{
                                                                      sx: { fontFamily: 'Lexend' }
                                                                  }}
                                                              />

                              <TextField
                                  label="Website Link"
                                  variant="outlined"
                                  name="website"
                                  value={formData.website}
                                  onChange={handleChange}
                                  placeholder='Enter your Link Website'
                                  inputProps={{ maxLength: 100 }}
                                  InputProps={{
                                      sx: { fontFamily: 'Lexend' }
                                  }}
                                  InputLabelProps={{
                                      sx: { fontFamily: 'Lexend' }
                                  }}
                              />
                              <Box sx={{ 
                                  display: 'flex', 
                                  gap: 2, 
                                  width: '100%',
                                  marginTop: '10px',
                                  
                              }}>
                                  <Button
        type="submit"
        variant="contained"
        disabled={isSubmitDisabled || isSubmitting}
        sx={{
            backgroundColor: '#1DA19E',
            fontFamily: 'Lexend',
            borderRadius: '12px',
            fontSize:'13px',
            padding:'12px',
            width: '126px',
            textTransform: 'none',
            boxShadow:'none',
        }}
    >
        {isSubmitting ? 'Saving...' : 'Save Listings'}
    </Button>
                                  <Button
                                      variant="outlined"
                                      sx={{
                                          color: '#1DA19E',
                                          borderColor: '#1DA19E',
                                          borderRadius: '12px',
                                          width: '117px',
                                          fontFamily: 'Lexend',
                                          textTransform:'none',
                                          '&:hover': {
                                              borderColor: '#178784',
                                              color: '#178784',
                                          },
                                      }}
                                      onClick={handleReset}
                                  >
                                      Cancel
                                  </Button>
                              </Box>
                          </Box>
                      </CardContent>
                  </Card>
              </Box>
              <SuccessModal 
                    isOpen={isSuccessModalOpen} 
                    onClose={handleCloseSuccessModal} 
                />
          </Box>
          <Bawah />
          </>
      );
    };

    export default EditListing;