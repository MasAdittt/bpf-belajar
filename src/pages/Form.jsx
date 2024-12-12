    import React, { useState, useEffect } from 'react';
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

    const ListingForm = () => {
        const navigate = useNavigate();
        const [showSuccessModal, setShowSuccessModal] = useState(false);
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
            imageUrls: []   
        });
        const [addressFieldFocusHandler, setAddressFieldFocusHandler] = useState(null);
        const [isLoading, setIsLoading] = useState(false);
        const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
        const [user, setUser] = useState(null);
        const [uploadedImages, setUploadedImages] = useState([]); 
        const categories = ["Cafe", "Villa", "Bar", "Restaurant", "Hotel"];
        const [imageFiles, setImageFiles] = useState([]);
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
                district: ''
            }));
        };

        const handleImageSelect = (imageData) => {
            setImageFiles(prev => [...prev, imageData.file]);
            setUploadedImages(prev => [...prev, imageData.preview]);
        };

        const handleDistrictChange = (event) => {
            const { value } = event.target;
            setFormData(prev => ({
                ...prev,
                district: value
            }));
        };

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        };

        const handleLocationSelect = (location) => {
            setFormData(prev => ({
                ...prev,
                latitude: location.lat,
                longitude: location.lng
            }));
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
                    userId: user.uid,
                    userEmail: user.email,
                    username: user.displayName || 'Anonymous User',
                    imageUrls: uploadedImageUrls,
                    location:{
                        latitude: formData.latitude,
                        longitude: formData.longitude
                    }
                };
        
                const listingsRef = ref(database, 'listings');
                const newListingRef = push(listingsRef);
                await set(newListingRef, listingData);
        
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
                website: '',
                imageUrls:[],
                latitude:'',
                longitude:''
            });
            setImageFiles([]);
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
                                    InputProps={{
                                        sx: { 
                                            fontFamily: 'Lexend'
                                        }
                                    }}
                                    InputLabelProps={{
                                        sx: { 
                                            fontFamily: 'Lexend',zIndex:10
                                        
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

                                <TextField
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
                                />

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
                                    label="Upload Menu Link"
                                    variant="outlined"
                                    name="menuLink"
                                    value={formData.menuLink}
                                    onChange={handleChange}
                                    required
                                    placeholder="PDF file preferred, shared via Google Drive link"
                                    inputProps={{ maxLength: 100 }}
                                    InputProps={{
                                        sx: { fontFamily: 'Lexend' }
                                    }}
                                    InputLabelProps={{
                                        sx: { fontFamily: 'Lexend' }
                                    }}
                                />

                    <TextField
                        label="Address"
                        variant="outlined"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        onFocus={() => {
                            if (addressFieldFocusHandler) {
                                addressFieldFocusHandler();
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
    onAddressFieldFocus={setAddressFieldFocusHandler}
    initialLocation={formData.latitude && formData.longitude ? {
        lat: formData.latitude,
        lng: formData.longitude
    } : null}
/>
                                <TextField
                                    label="Contact Number"
                                    variant="outlined"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
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