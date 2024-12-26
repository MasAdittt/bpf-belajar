        import React, { useState, useEffect, useRef } from 'react';
        import { useNavigate } from 'react-router-dom';
        import { useAuth } from '../config/Auth';
        import { getAuth, updateEmail,sendEmailVerification } from "firebase/auth";
        import { getDatabase, ref, onValue, set, update, get,query,orderByChild,equalTo } from "firebase/database";
        import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
        import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
        import { faUser, faStar, faMapMarkerAlt, faEnvelope, faPhone, faUpload } from '@fortawesome/free-solid-svg-icons';
        import Navbaru from '../components/Navbaru';
        import Loading from '../components/Loading';
        import PhotoUploadForm from '../components/Foto';
        import { styled } from '@mui/material/styles';
        import CloudUploadIcon from '@mui/icons-material/CloudUpload';
        import Swal from 'sweetalert2';
        import Bawah from '../components/Bawah';
        import Box from '@mui/material/Box';
        import PersonIcon from '@mui/icons-material/Person';
        import { Paper,Button,Typography } from '@mui/material';
        import TextField from '@mui/material/TextField';
        import AllListings from './AllListings';
        import FavoriteListings from './Favorite';
        import Keamanan from '../components/Keamanan';
        import Payments from '../components/Payments';
        import UserReviewsComponent from '../components/UserReview';
        import { Star, Heart,MapPin } from 'lucide-react';
        import orang from '../assets/image/orang.svg';
        import telpon from '../assets/image/telpon.svg';
        import titik from '../assets/image/titik.svg';


        function Personal() {
            const navigate = useNavigate();
            const { user } = useAuth();
            const [isUploading, setIsUploading] = useState(false);
            const [username, setUsername] = useState('');
            const [profilePhoto, setProfilePhoto] = useState(null);
            const [phone, setPhone] = useState('');
            const [email, setEmail] = useState('');
            const [emailError, setEmailError] = useState('');
            const [location, setLocation] = useState('');
            const [reviews, setReviews] = useState([]);
            const [activePage, setActivePage] = useState('My Profile');
            const [coverPhoto, setCoverPhoto] = useState(null);
            const fileInputRef = useRef(null);
            const [firstName, setFirstName] = useState('');
            const [lastName, setLastName] = useState('');
            const [province, setProvince] = useState('');
            const [backgroundPhoto, setBackgroundPhoto] = useState(null);
            const backgroundInputRef = useRef(null);
            const [tempBackgroundFile, setTempBackgroundFile] = useState(null);
            const [tempProfileFile, setTempProfileFile] = useState(null);
            const profileInputRef = useRef(null);
            const [reviewCount, setReviewCount] = useState(0);

            // Modified useEffect to handle the async fetchUserReviewCount
    useEffect(() => {
        if (user && user.uid) {
            const db = getDatabase();
            const userRef = ref(db, `users/${user.uid}`);
            onValue(userRef, (snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    setPhone(userData.phone || '');
                    setUsername(userData.username || '');
                    setProfilePhoto(userData.profilePhoto || null);
                    setLocation(userData.location || '');
                    setEmail(userData.email || '');
                    setFirstName(userData.firstName || '');
                    setLastName(userData.lastName || '');
                    setProvince(userData.province || '');
                    setBackgroundPhoto(userData.backgroundPhoto || null);
                }
            });
            
        // In the useEffect, replace fetchUserReviewCount with:
    const getListingsCount = async () => {
        const count = await fetchUserListingsCount(user.uid);
        setReviewCount(count);
    };

    getListingsCount();
        }
    }, [user]);
            

            const fetchUserReviewCount = async (userId) => {
                try {
                    const db = getDatabase();
                    const listingsRef = ref(db, 'listings');
                    const listingsSnapshot = await get(listingsRef);
                    
                    let totalReviews = 0;
            
                    if (listingsSnapshot.exists()) {
                        const listings = listingsSnapshot.val();
                        for (const listingId in listings) {
                            if (listings[listingId].reviews) {
                                const reviewsRef = ref(db, `listings/${listingId}/reviews`);
                                const userReviewQuery = query(reviewsRef, orderByChild('userId'), equalTo(userId));
                                const userReviewSnapshot = await get(userReviewQuery);
                                if (userReviewSnapshot.exists()) {
                                    totalReviews += Object.keys(userReviewSnapshot.val()).length;
                                }
                            }
                        }
                    }
            
                    return totalReviews;
                } catch (error) {
                    console.error("Error fetching review count:", error);
                    return 0;
                }
            };

            const VisuallyHiddenInput = styled('input')({
                clip: 'rect(0 0 0 0)',
                clipPath: 'inset(50%)',
                height: 1,
                overflow: 'hidden',
                position: 'absolute',
                bottom: 0,
                left: 0,
                whiteSpace: 'nowrap',
                width: 1,
            });

            const handlePageChange = (page) => {
                setActivePage(page);
            };

            const handleCancel = () => {
                // Reset semua state ke nilai awal dari database
                const db = getDatabase();
                const userRef = ref(db, `users/${user.uid}`);
                onValue(userRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const userData = snapshot.val();
                        setPhone(userData.phone || '');
                        setUsername(userData.username || '');
                        setProfilePhoto(userData.profilePhoto || null);
                        setLocation(userData.location || '');
                        setEmail(userData.email || '');
                        setFirstName(userData.firstName || '');
                        setLastName(userData.lastName || '');
                        setProvince(userData.province || '');
                        setBackgroundPhoto(userData.backgroundPhoto || null);
                    }
                });
            
                // Reset temporary files
                setTempBackgroundFile(null);
                setTempProfileFile(null);
            
                // Reset error state
                setEmailError('');
            
                // Tampilkan notifikasi
                Swal.fire({
                    title: 'Changes Cancelled',
                    text: 'All changes have been reset',
                    icon: 'info',
                    confirmButtonColor: '#1DA19E'
                });
            };

            const handleProfilePhotoUpload = (event) => {
                const file = event.target.files[0];
                if (file) {
                    // Check file size (max 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                        Swal.fire({
                            title: 'Error!',
                            text: 'File size exceeds 5MB limit',
                            icon: 'error',
                            confirmButtonColor: '#1DA19E'
                        });
                        return;
                    }
                    
                    // Check file type
                    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
                    if (!allowedTypes.includes(file.type)) {
                        Swal.fire({
                            title: 'Error!',
                            text: 'Invalid file type. Please upload a JPEG, PNG, or GIF image.',
                            icon: 'error',
                            confirmButtonColor: '#1DA19E'
                        });
                        return;
                    }

                    // Store the file temporarily
                    setTempProfileFile(file);
                    
                    // Create a temporary URL for preview
                    const tempURL = URL.createObjectURL(file);
                    setProfilePhoto(tempURL);

                    Swal.fire({
                        title: 'Photo Selected',
                        text: 'Click "Save Changes" to update your profile photo',
                        icon: 'info',
                        confirmButtonColor: '#1DA19E'
                    });
                }
            };


            const validateEmail = async (email) => {
                if (!email) {
                    setEmailError('Email wajib diisi');
                    return false;
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    setEmailError('Format email tidak valid');
                    return false;
                }
                setEmailError('');
                return true;
            };

            const sendVerificationEmail = async (user) => {
                try {
                    await sendEmailVerification(user);
                    console.log("Permintaan pengiriman email verifikasi berhasil untuk:", user.email);
                    return true;
                } catch (error) {
                    console.error("Gagal mengirim email verifikasi:", error);
                    throw error;
                }
            };

            const handleEmailVerification = async () => {
                const auth = getAuth();
                const user = auth.currentUser;

                if (!user) {
                    console.error("Tidak ada pengguna yang terautentikasi");
                    return;
                }

                try {
                    const emailSent = await sendVerificationEmail(user);
                    
                    if (emailSent) {
                        Swal.fire({
                            title: 'Email Verifikasi Dikirim',
                            html: `
                                <p>Kami telah mencoba mengirim email verifikasi ke ${user.email}.</p>
                                <p>Jika Anda tidak menerima email dalam beberapa menit, silakan:</p>
                                <ul>
                                    <li>Periksa folder spam atau junk Anda</li>
                                    <li>Pastikan alamat email Anda benar</li>
                                    <li>Coba kirim ulang setelah beberapa saat</li>
                                </ul>
                                <p>Jika masalah berlanjut, hubungi dukungan kami.</p>
                            `,
                            icon: 'info',
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#1DA19E'
                        });
                    }
                } catch (error) {
                    console.error("Error saat mengirim email verifikasi:", error);
                    Swal.fire({
                        title: 'Gagal Mengirim Email',
                        text: 'Terjadi kesalahan saat mencoba mengirim email verifikasi. Silakan coba lagi nanti.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#1DA19E'
                    });
                }
            };

            const updateAuthEmail = async (newEmail) => {
                const auth = getAuth();
                const user = auth.currentUser;
            
                if (!user) {
                    throw new Error("No authenticated user found");
                }
            
                try {
                    await updateEmail(user, newEmail);
                    console.log("Email updated successfully in Authentication");
                    return true;
                } catch (error) {
                    console.error("Error updating email in Authentication:", error);
                    
                    // Check for specific error codes
                    if (error.code === 'auth/requires-recent-login') {
                        // User needs to re-authenticate before updating email
                        throw new Error("For security reasons, please log out and log back in before changing your email.");
                    } else if (error.code === 'auth/email-already-in-use') {
                        throw new Error("This email is already in use by another account.");
                    }
            
                    throw error; // Rethrow other errors
                }
            };

            const handleSaveProfile = async () => {
                try {
                    if (!user?.uid) {
                        throw new Error("User not authenticated");
                    }
            
                    const db = getDatabase();
                    const updates = {};
                    let profilePhotoURL = profilePhoto;
                    let backgroundPhotoURL = backgroundPhoto;
            
                    // Upload profile photo if there's a new one
                    if (tempProfileFile) {
                        const storage = getStorage();
                        const profileFileRef = storageRef(
                            storage,
                            `profilePhotos/${user.uid}/${Date.now()}_${tempProfileFile.name}`
                        );
            
                        const profileMetadata = {
                            contentType: tempProfileFile.type,
                            customMetadata: {
                                userId: user.uid
                            }
                        };
            
                        const profileSnapshot = await uploadBytes(profileFileRef, tempProfileFile, profileMetadata);
                        profilePhotoURL = await getDownloadURL(profileSnapshot.ref);
                    }
            
                    // Upload background photo if there's a new one
                    if (tempBackgroundFile) {
                        const storage = getStorage();
                        const backgroundFileRef = storageRef(
                            storage,
                            `backgroundPhotos/${user.uid}/${Date.now()}_${tempBackgroundFile.name}`
                        );
            
                        const backgroundMetadata = {
                            contentType: tempBackgroundFile.type,
                            customMetadata: {
                                userId: user.uid
                            }
                        };
            
                        const backgroundSnapshot = await uploadBytes(backgroundFileRef, tempBackgroundFile, backgroundMetadata);
                        backgroundPhotoURL = await getDownloadURL(backgroundSnapshot.ref);
                    }
            
                    // Update email if it's changed
                    if (email !== user.email) {
                        const isValidEmail = await validateEmail(email);
                        if (!isValidEmail) {
                            throw new Error("Invalid email format");
                        }
                        await updateAuthEmail(email);
                    }
            
                    // Prepare all updates
                    updates[`users/${user.uid}`] = {
                        email,
                        firstName,
                        lastName,
                        location,
                        province,
                        phone,
                        profilePhoto: profilePhotoURL,
                        backgroundPhoto: backgroundPhotoURL,
                        username: username // Keep existing username if present
                    };
            
                    // Update database
                    await update(ref(db), updates);
            
                    // Reset temporary files
                    setTempProfileFile(null);
                    setTempBackgroundFile(null);
            
                    Swal.fire({
                        title: 'Success!',
                        text: 'Profile updated successfully',
                        icon: 'success',
                        confirmButtonColor: '#1DA19E'
                    });
            
                } catch (error) {
                    console.error("Profile update error:", error);
                    
                    let errorMessage = 'Failed to update profile. Please try again.';
                    if (error.message.includes('email')) {
                        errorMessage = error.message;
                    }
            
                    Swal.fire({
                        title: 'Error!',
                        text: errorMessage,
                        icon: 'error',
                        confirmButtonColor: '#1DA19E'
                    });
                }
            };
            const handleBackgroundUpload = (event) => {
                const file = event.target.files[0];
                if (file) {
                    // Instead of uploading, we'll store the file temporarily
                    setTempBackgroundFile(file);
                    
                    // Create a temporary URL for preview
                    const tempURL = URL.createObjectURL(file);
                    setBackgroundPhoto(tempURL);
            
                    Swal.fire({
                        title: 'Photo Selected',
                        text: 'Click "Save Changes" to update your background photo',
                        icon: 'info',
                        confirmButtonColor: '#1DA19E'
                    });
                }
            };

            const fetchUserListingsCount = async (userId) => {
                try {
                    const db = getDatabase();
                    const listingsRef = ref(db, 'listings');
                    const listingsSnapshot = await get(listingsRef);
                    
                    let totalListings = 0;
            
                    if (listingsSnapshot.exists()) {
                        const listings = listingsSnapshot.val();
                        for (const listingId in listings) {
                            if (listings[listingId].userId === userId) {
                                totalListings++;
                            }
                        }
                    }
            
                    return totalListings;
                } catch (error) {
                    console.error("Error fetching listings count:", error);
                    return 0;
                }
            };

            const handleFileUpload = async (event) => {
                console.log("Fungsi handleFileUpload dipanggil");
                const file = event.target.files[0];
                if (file) {
                    console.log("File terpilih:", file.name);
            
                    // Periksa ukuran file (maks 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                        Swal.fire({
                            title: 'Kesalahan!',
                            text: 'Ukuran file melebihi batas 5MB',
                            icon: 'error',
                            confirmButtonColor: '#1DA19E'
                        });
                        return;
                    }
                    
                    // Periksa jenis file
                    const jenisYangDiizinkan = ['image/jpeg', 'image/png', 'image/gif'];
                    if (!jenisYangDiizinkan.includes(file.type)) {
                        Swal.fire({
                            title: 'Kesalahan!',
                            text: 'Jenis file tidak valid. Harap unggah gambar JPEG, PNG, atau GIF.',
                            icon: 'error',
                            confirmButtonColor: '#1DA19E'
                        });
                        return;
                    }
            
                    setIsUploading(true);
                    try {
                        console.log("Memulai proses unggah");
                        const storage = getStorage();
                        const fileRef = storageRef(storage, `coverPhotos/${user.uid}/${file.name}`);
                        
                        // Unggah file
                        const snapshot = await uploadBytes(fileRef, file);
                        console.log("File berhasil diunggah");
            
                        // Dapatkan URL unduhan
                        const downloadURL = await getDownloadURL(snapshot.ref);
                        console.log("URL unduhan:", downloadURL);
            
                        // Perbarui state
                        setCoverPhoto(downloadURL);
            
                        // Perbarui profil pengguna di database
                        const db = getDatabase();
                        const userRef = ref(db, `users/${user.uid}`);
                        await set(userRef, {
                            ...user,
                            coverPhoto: downloadURL
                        });
            
                        Swal.fire({
                            title: 'Berhasil!',
                            text: 'Foto sampul berhasil diunggah',
                            icon: 'success',
                            confirmButtonColor: '#1DA19E'
                        });
                    } catch (error) {
                        console.error("Kesalahan mengunggah file: ", error);
                        let pesanKesalahan = 'Gagal mengunggah foto. Silakan coba lagi.';
                        if (error.code === 'storage/unauthorized') {
                            pesanKesalahan = 'Anda tidak memiliki izin untuk mengunggah file.';
                        } else if (error.code === 'storage/canceled') {
                            pesanKesalahan = 'Unggahan dibatalkan oleh pengguna.';
                        } else if (error.code === 'storage/unknown') {
                            pesanKesalahan = 'Terjadi kesalahan yang tidak diketahui. Harap periksa koneksi internet Anda dan coba lagi.';
                        }
                        Swal.fire({
                            title: 'Kesalahan!',
                            text: pesanKesalahan,
                            icon: 'error',
                            confirmButtonColor: '#1DA19E'
                        });
                    } finally {
                        setIsUploading(false);
                    }
                }
            };
            const renderContent = () => {
                switch (activePage) {
                    
                case 'Security':
                    return <Keamanan user={user} />;
                case 'Payments':
                    return <Payments />;
                case 'My Favorites':
                    return <FavoriteListings />;
                    case 'My Listings':
                        return <AllListings />;
                case 'My Profile':
            
                default:
                    return (
                        <>
                            <div className="flex flex-col md:flex-row gap-6">

    <aside className="bg-white p-6 rounded-lg  w-full md:w-[281px] h-[300px] mb-6 md:mb-0">                           
        <h2 style={{ fontFamily:'Lexend', fontSize:'16px', fontWeight:700,color:"#3A3A3A", paddingBottom:'16px'}}>About me</h2>
                                <ul className="space-y-2">
                                    <li className="flex items-center">
                                        <img src={orang} alt="Profile" className="w-4 h-4 mr-2" />
                                        <span className="truncate" style={{color:'#3A3A3A', fontFamily:'Lexend', fontWeight:300, fontSize:'18px'}}>@{firstName} {lastName}</span>
                                    </li>
                                    <li className="flex items-center">
                                    <img src={titik} alt="Profile" className="w-4 h-4 mr-2" />

                                        <span className="truncate"  style={{color:'#3A3A3A', fontFamily:'Lexend', fontWeight:300, fontSize:'14px'}}>{location || 'Not provided'}, {province}</span>
                                    </li>
     
                                    <li className="flex items-center">
                                    <img src={telpon} alt="Profile" className="w-4 h-4 mr-2" />
                                        <span className="truncate"  style={{color:'#3A3A3A', fontFamily:'Lexend', fontWeight:300, fontSize:'14px'}}>{phone || 'Not provided'}</span>
                                    </li>
                                </ul>
                                <h2 className="text-base font-bold mt-6 mb-2" style={{fontFamily:'Lexend'}}>Contribution</h2>
                                <li className="flex items-center text-sm" style={{fontFamily:'Lexend'}}>
        <FontAwesomeIcon icon={faStar} className="mr-2 text-gray-600" style={{fontFamily:'Lexend'}}/>
        {reviewCount} {reviewCount === 1 ? 'Listing' : 'Listings'}
    </li>
                            </aside>
                            <div className="flex flex-col flex-1">
                            <div className="pembungkus  w-full px-4 md:px-0 min-h-full font-['Lexend'] pb-[20px] bg-white" style={{padding:'32px'}}  >
                            <TextField
                                    id="email"
                                    label="Email *"
                                    variant="outlined"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={() => validateEmail(email)}
                                    error={!!emailError}
                                    helperText={emailError}
                                    fullWidth
                                    sx={{mb:'24px'}}
                                />
                                <Box component="form" className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-[30px]" noValidate autoComplete="off">
                                <TextField
                                    id="First"
                                    label="First Name *"
                                    variant="outlined"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    fullWidth
                                />
                                <TextField
                                    id="Last"
                                    label="Last Name *"
                                    variant="outlined"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    fullWidth
                                />
                                <TextField
                                    id="location"
                                    label="Location *"
                                    variant="outlined"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    fullWidth
                                />
                                <TextField
                                    id="province"
                                    label="Province *"
                                    variant="outlined"
                                    value={province}
                                    onChange={(e) => setProvince(e.target.value)}
                                    fullWidth
                                />
                            </Box>
                            <TextField
                                    id="phone"
                                    label="Phone Number *"
                                    variant="outlined"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    fullWidth
                                    sx={{marginBottom:'30px'}}
                                />
    <PhotoUploadForm
    onProfilePhotoSelect={(file) => setTempProfileFile(file)}
    onCoverPhotoSelect={(file) => setTempBackgroundFile(file)}
    initialProfilePhoto={profilePhoto}
    initialCoverPhoto={backgroundPhoto}
    />
                            
                            
                        
                            <div className="flex gap-4 mt-4">
        <button
            onClick={handleSaveProfile}
            className="bg-[#1DA19E] text-white px-4 py-2 rounded-full w-full md:w-auto"
            style={{fontFamily:'Lexend',borderRadius:'12px',width:'118px'}}
        >
            Save
        </button>
        <button
            onClick={handleCancel} // Ini akan kembali ke halaman sebelumnya
            className="bg-white text-[#1DA19E] border border-[#1DA19E] px-4 py-2 rounded-full w-full md:w-auto"
            style={{fontFamily:'Lexend',borderRadius:'12px',width:'118px'}}
        >
            Cancel
        </button>
    </div>
                        </div>
                        </div>
                        </div>
                        </>
                    );
            }
        };

        return (
            <>
                <Navbaru />
                <div className="bg-gray-100 min-h-screen" style={{paddingTop:'90px'}}>
                    <div className="w-full h-48 md:h-80 bg-cover bg-center"
                        style={{backgroundImage: backgroundPhoto ? `url(${backgroundPhoto})` : "url('./src/assets/image/atas.jpg')"}}>
                    </div>
                    <div className="max-w-6xl mx-auto -mt-16 md:-mt-24 mb-8 px-4 md:px-0">
                
                        <div className="bg-white rounded-lg shadow-md flex flex-col md:flex-row items-center md:items-start p-4 md:p-[45px_45px_23px_45px] ">
                            <div className="mb-4 md:mb-0 md:mr-6">
                                {isUploading ? (
                                    <Loading />
                                ) : profilePhoto ? (
                                    <img src={profilePhoto} alt="Profile" className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover" />
                                ) : (
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-lexend">
                                        <span>{firstName ? firstName[0].toUpperCase() : 'A'}</span>
                                    </div>
                                )}
                            </div>
                            <div className="text-center md:text-left md:pt-5">
                                <h1 className="text-2xl md:text-[35px] text-[#3A3A3A] font-bold font-['Lexend']">
                                    {firstName} {lastName}
                                </h1>
                                <p className="text-sm md:text-base font-light font-['Lexend']">{email}</p>
                            </div>
                        </div>
                    </div>
                    <div className="max-w-6xl mx-auto px-4 md:px-0 lg:px-8">
                        <div className="overflow-x-auto pb-4 md:pb-[15px]">
                            <div className="flex gap-4 md:gap-8 min-w-max">
                                {['My Profile','Security','My Favorites','My Listings'].map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`personal-tombol whitespace-nowrap ${activePage === page ? 'active' : ''}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-10 pb-[45px]">
                            {renderContent()}
                        </div>
                    </div>
                </div>
                <Bawah />
            </>
        );
    }

    export default Personal;