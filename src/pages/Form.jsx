import React, { useState, useEffect,useCallback } from 'react';
    import { Box, TextField, Button, Typography, Card, CardContent, Select, MenuItem,CircularProgress } from '@mui/material';
    import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
    import { faStore, faImage, faClock } from '@fortawesome/free-solid-svg-icons';
    import Bawah from '../components/Bawah';
    import Navbaru from '../components/Navbaru';
    import ImageUpload from '../kebutuhan/imageupluoad';
    import { ref, push, set } from "firebase/database";
    import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
    import { database, firebaseAuthentication as auth } from '../config/firebase';
    import { useNavigate } from 'react-router-dom';
    import { onAuthStateChanged } from 'firebase/auth';
    import { toast } from 'react-toastify';
    import SuccessModal from '../kebutuhan/Notif';
    import LocationPicker from '../kebutuhan/Location';
    import PlaceDetailsCard from '../components/ui/Detail';
    import { Map } from 'lucide-react';
    import { serverTimestamp } from 'firebase/firestore';
    import LocationSearchBar from '../data/Nyari';

    const ListingForm = () => {
        const navigate = useNavigate();
        const [showSuccessModal, setShowSuccessModal] = useState(false);
        const [mapUrl, setMapUrl] = useState('');
        const [isLoadingMap, setIsLoadingMap] = useState(false);
        const [placeDetails, setPlaceDetails] = useState(null);
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
            imageUrls: [],
            rating: 0,
            user_ratings_total: 0,
            
        });
        const [addressFieldFocusHandler, setAddressFieldFocusHandler] = useState(null);
        const [isLoading, setIsLoading] = useState(false);
        const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
        const [user, setUser] = useState(null);
        const [uploadedImages, setUploadedImages] = useState([]); 
        const categories = ["Cafe", "Villa", "Bar", "Restaurant", "Hotel","Mall"];
        const [imageFiles, setImageFiles] = useState([]);
        const handleAddressFieldFocus = useCallback((handler) => {
            setAddressFieldFocusHandler(handler);
        }, []);
        const districtMapping = {
            Badung: ['Kuta', 'North Kuta', 'South Kuta', 'Mengwi', 'Abiansemal', 'Petang'],
            Buleleng: ['Buleleng', 'Gerokgak', 'Seririt', 'Busungbiu', 'Banjar', 'Sukasada', 'Kubutambahan', 'Tejakula'],
            Bangli: ['Bangli', 'Susut', 'Tembuku', 'Kintamani'],
            Denpasar: ['West Denpasar', 'East Denpasar', 'South Denpasar', 'North Denpasar'],
            Gianyar: ['Gianyar', 'Blahbatuh', 'Tampaksiring', 'Ubud', 'Tegallalang', 'Sukawati', 'Payangan'],
            Jembrana: ['Negara', 'Melaya', 'Mendoyo', 'Pekuktatan', 'Jembrana'],
            Karangasem: ['Karangasem', 'Abang', 'Bebandem', 'Rendang', 'Selat', 'Manggis', 'Kubu'],
            Klungkung: ['Klungkung', 'Banjarakan', 'Dawan', 'Nusa Penida'],
            Tabanan: ['Tabanan', 'Kediri', 'Kerambitan', 'Marga', 'Penebel', 'Selemandeg', 'East Selemandeg', 'West Selemandeg', 'North Selemandeg', 'Pupuan']
        };

      

        const handleCityChange = (event) => {
            const { value } = event.target;
            setFormData(prev => ({
                ...prev,
                city: value,
                district: '',
                // Reset coordinates when city changes
                latitude: '',
                longitude: ''
            }));
            
            // Center map on selected city
            const cityCoordinates = {
                Badung: { lat: -8.5819, lng: 115.1771 },
                Buleleng: { lat: -8.1146, lng: 115.0919 },
                Bangli: { lat: -8.4546, lng: 115.3549 },
                Denpasar: { lat: -8.6705, lng: 115.2126 },
                Gianyar: { lat: -8.5449, lng: 115.3246 },
                Jembrana: { lat: -8.3233, lng: 114.6667 },
                Karangasem: { lat: -8.3466, lng: 115.5206 },
                Klungkung: { lat: -8.7878, lng: 115.5444 },
                Tabanan: { lat: -8.5444, lng: 115.1213 }
            };
    
            if (cityCoordinates[value]) {
                setMapCenter(cityCoordinates[value]);
            }
        };

        
      // Di ListingForm.js
const handleImageSelect = (imageData) => {
    // Update untuk menyimpan semua file gambar
    if (imageData.files) {
        setImageFiles(imageData.files.filter(file => file !== null));
        setUploadedImages(imageData.previews.filter(preview => preview !== null));
    }
};
        const handleDistrictChange = (event) => {
            const { value } = event.target;
            setFormData(prev => ({
                ...prev,
                district: value,
                latitude: '',
                longitude: ''
            }));
        
            // Move this logic to useEffect instead of doing it directly in the handler
            if (formData.city && value) {
                const searchQuery = `${formData.address}, ${value}, ${formData.city}, Bali, Indonesia`;
                if (addressFieldFocusHandler) {
                    addressFieldFocusHandler(searchQuery);
                }
            }
        };
useEffect(() => {
    if (formData.address && formData.city && formData.district && addressFieldFocusHandler) {
        const searchQuery = `${formData.address}, ${formData.district}, ${formData.city}, Bali, Indonesia`;
        addressFieldFocusHandler(searchQuery);
    }
}, [formData.address, formData.city, formData.district, addressFieldFocusHandler]);
        
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

        const [mapCenter, setMapCenter] = useState({
            lat: -8.4095,
            lng: 115.1889
        });

        const handleLocationSelect = (location) => {
            console.log('Raw location data:', location); // Log seluruh data lokasi
            console.log('Latitude:', location.lat);
            console.log('Longitude:', location.lng);
            console.log('Place ID:', location.place_id);
            
            
            setFormData(prev => {
                const newState = {
                    ...prev,
                    latitude: location.lat,
                    longitude: location.lng,
                    placeId: location.place_id || '' // Ensure placeId is set or default to empty string
                };
                console.log('Updated form data:', newState); // Log state form yang baru
                return newState;
            });
            
            console.log('Setting map center to:', location); // Log perubahan map center
            setMapCenter(location);
        };
        

        useEffect(() => {
            const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                setUser(currentUser);
                if (!currentUser) {
                    toast.error("Please login to create a listing");
                    navigate('/login');
                }
            });

            return () => unsubscribe();
        }, [navigate]);

        const handleSubmit = async (e) => {
            e.preventDefault();
            setIsLoading(true);
            setIsSubmitDisabled(true);
            
            try {
                const storage = getStorage();
                const uploadedImageUrls = [];
                
                // Upload images and collect URLs
                for (const file of imageFiles) {
                    if (file) {
                        const imagePath = `listings/${Date.now()}_${file.name}`;
                        const imageRef = storageRef(storage, imagePath);
                        
                        // Tambahkan metadata
                        const metadata = {
                            contentType: file.type,
                            customMetadata: {
                                userId: user.uid,
                                uploadedAt: Date.now().toString()
                            }
                        };
        
                        // Upload file dengan metadata
                        await uploadBytes(imageRef, file, metadata);
                        const url = await getDownloadURL(imageRef);
                        uploadedImageUrls.push(url);
                    }
                }
        
                const normalizedTitle = formData.placeName.toLowerCase();
                const businessHours = {
                    opening: formData.openingHours,
                    closing: formData.closingHours
                };
                
                const listingData = {
                    address: formData.address,
                    businessHours,
                    category: formData.category,
                    city: formData.city,
                    district: formData.district,
                    clicks: 0,
                    createdAt: Date.now(),
                    description: formData.description,
                    isPublic: false,
                    normalizedTitle,
                    phone: formData.phone,
                    title: formData.placeName,
                    tags: formData.shortDescription,
                    foodCategory: formData.foodCategory,
                    halalStatus: formData.halalStatus,
                    menuLink: formData.menuLink,
                    instagram: formData.instagram || "",
                    website: formData.website || "",
                    Gmaps: formData.Gmaps || "",
                    userId: user.uid,
                    userEmail: user.email,
                    username: user.displayName || 'Anonymous User',
                    imageUrls: uploadedImageUrls,
                    timestamp: serverTimestamp(),

                    location: {
                        latitude: formData.latitude,
                        longitude: formData.longitude,
                        placeId: formData.placeId, // Pastikan ini sudah ada
                        googleData: {
                            rating: formData.rating || 0, // Tambahkan rating
                            user_ratings_total: formData.user_ratings_total ||0, // Tambahkan total rating
                            google_url: formData.url || '', // URL Google Maps dari tempat tersebut
                            last_updated: serverTimestamp()

                        }
                    }
                };
        
                const listingsRef = ref(database, 'listings');
                const newListingRef = push(listingsRef);
                await set(newListingRef, listingData);
        // Set up listener untuk update rating
    const ratingUpdateRef = ref(database, `listings/${newListingRef.key}/location/googleData`);
    
      // Update rating setiap 24 jam
      setInterval(async () => {
        try {
          if (formData.placeId) {
            const updatedData = await getUpdatedPlaceDetails(formData.placeId);
            
            await update(ratingUpdateRef, {
              rating: updatedData.rating,
              user_ratings_total: updatedData.user_ratings_total,
              last_updated: serverTimestamp()
            });
          }
        } catch (error) {
          console.error('Error updating rating:', error);
        }
      }, 24 * 60 * 60 * 1000); // Update setiap 24 jam
  
                setShowSuccessModal(true);
                handleReset();
        
            } catch (error) {
                console.error("Error saving listing:", error);
                // Tambahkan detail error untuk debugging
                if (error.code === 'storage/unauthorized') {
                    toast.error("Upload failed: You need to be logged in to upload images");
                } else {
                    toast.error(`Upload failed: ${error.message}`);
                }
            } finally {
                setIsLoading(false);
                setIsSubmitDisabled(false);
            }
        };

        const handleReset = () => {
            setFormData({
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
                Gmaps: '',
                placeId: '',    
                website: '',
                imageUrls:[],
                latitude:'',
                longitude:''
            });
            setImageFiles([]);
        };

        const handlePlaceSelect = (details) => {
            // Simpan detail tempat ke state placeDetails
            setPlaceDetails(details);
            
            // Update formData dengan informasi lokasi
            setFormData(prev => ({
                ...prev,
                placeName: details.name || prev.placeName,
                address: details.address || prev.address,
                latitude: details.latitude || prev.latitude,
                longitude: details.longitude || prev.longitude,
                placeId: details.placeId || prev.placeId,
                // Anda bisa menambahkan field lain yang ingin disimpan
                rating: details.rating || prev.rating,
                user_ratings_total: details.user_ratings_total || 0,
                Gmaps: details.url || prev.Gmaps
            }));
        };

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
                        Add Your Listing
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
                                onSubmit={handleSubmit} 
                                sx={{ 
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    zIndex:1,
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
    sx={{ 
        display: 'none',
        '& .MuiInputBase-root': {
            fontFamily: 'Lexend'
        },
        '& .MuiInputLabel-root': {
            fontFamily: 'Lexend',
            zIndex: 10
        }
    }}
/>
<LocationSearchBar
  required
  onPlaceSelect={handlePlaceSelect}
  isLoading={isLoading}
  value={formData.placeName}
  onInputChange={(value) => {
    setFormData(prev => ({
      ...prev,
      placeName: value,
      timestamp: serverTimestamp() // Add timestamp when location changes
    }));
  }}
/>

<PlaceDetailsCard 
  isLoading={isLoading}
  placeDetails={placeDetails}
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

                                <ImageUpload   onFileSelect={handleImageSelect}/>

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
                                    placeholder='Example: Indonesian Food,etc'
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

                             

    <TextField
    label="Address"
    variant="outlined"
    name="address"
    value={formData.address}
    onChange={handleChange}
    onBlur={() => {
        if (formData.city && formData.district && formData.address) {
            if (addressFieldFocusHandler) {
                const searchQuery = `${formData.address}, ${formData.district}, ${formData.city}, Bali, Indonesia`;
                addressFieldFocusHandler(searchQuery);
            }
        }
    }}
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

            <Typography variant="subtitle1" sx={{ 
    width: '100%', 
    marginTop: '20px', 
    fontFamily: 'Lexend'
}}>
    Pin Your Location
</Typography>
<LocationPicker 
    onLocationSelect={handleLocationSelect} 
    address={formData.address}
    city={formData.city}
    district={formData.district}
    onAddressFieldFocus={handleAddressFieldFocus}
    initialLocation={mapCenter}
/>
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

{/* <TextField
  fullWidth
  label="Google Maps URL"
  name="Gmaps"
  value={formData.Gmaps}
  onChange={handleGmapsChange}
  InputProps={{
    startAdornment: (
      <Box sx={{ display: 'flex', alignItems: 'center', color: '#6B6B6B' }}>
        <Map size={20} style={{ marginRight: '8px' }} />
      </Box>
    ),
    endAdornment: isLoadingMap && (
      <CircularProgress size={20} />
    ),
    sx: { fontFamily: 'Lexend' }
  }}
  InputLabelProps={{
    sx: { fontFamily: 'Lexend' }
  }}
  disabled={isLoadingMap}
  placeholder="Paste Google Maps URL here"
  helperText={isLoadingMap ? "Mengekstrak informasi lokasi..." : ""}
/> */}






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
                                        disabled={isSubmitDisabled}
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
                                        {isLoading ? (
            <>
                  <CircularProgress
                    size={24}
                    sx={{
                      color: 'white',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
            </>
        ) : 'Save Listings'}
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
            </Box>
            <Bawah />
            <SuccessModal 
            isOpen={showSuccessModal} 
            onClose={() => {
                setShowSuccessModal(false);
                navigate('/'); // Optional: akan redirect ke home setelah modal ditutup
            }} 
        />
            </>
        );
    };

    export default ListingForm;