    import React, { useState, useEffect, useRef } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { useAuth } from '../config/Auth';
    import { getAuth, updateEmail,sendEmailVerification } from "firebase/auth";
    import { getDatabase, ref, onValue, set, update } from "firebase/database";
    import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
    import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
    import { faUser, faStar, faMapMarkerAlt, faEnvelope, faPhone, faUpload } from '@fortawesome/free-solid-svg-icons';
    import Navbaru from '../components/Navbaru';
    import Loading from '../components/Loading';
    import Swal from 'sweetalert2';
    import Bawah from '../components/Bawah';
    import Box from '@mui/material/Box';
    import TextField from '@mui/material/TextField';
    import Keamanan from '../components/Keamanan';
    import Payments from '../components/Payments';
    import UserReviewsComponent from '../components/UserReview';

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
                
                fetchUserReviewCount(user.uid);
            }
        }, [user]);

        const fetchUserReviewCount = async (userId) => {
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
    
            setReviewCount(totalReviews);
        };

        const handlePageChange = (page) => {
            setActivePage(page);
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
            const isEmailValid = await validateEmail(email);
            if (!isEmailValid) return;
        
            Swal.fire({
                title: 'Saving...',
                text: 'Please wait a moment',
                allowOutsideClick: false,
                showConfirmButton: false,
                willOpen: () => {
                    Swal.showLoading();
                }
            });
        
            try {
                const auth = getAuth();
                const currentUser = auth.currentUser;
                const db = getDatabase();
                const userRef = ref(db, `users/${user.uid}`);
        
                let emailUpdated = false;
                let newBackgroundPhotoURL = backgroundPhoto;
                let newProfilePhotoURL = profilePhoto;
        
                // Upload profile photo if a new one was selected
                if (tempProfileFile) {
                    const storage = getStorage();
                    const fileRef = storageRef(storage, `profilePhotos/${user.uid}/${tempProfileFile.name}`);
                    const snapshot = await uploadBytes(fileRef, tempProfileFile);
                    newProfilePhotoURL = await getDownloadURL(snapshot.ref);
                }
        
                // Upload background photo if a new one was selected
                if (tempBackgroundFile) {
                    const storage = getStorage();
                    const fileRef = storageRef(storage, `backgroundPhotos/${user.uid}/${tempBackgroundFile.name}`);
                    const snapshot = await uploadBytes(fileRef, tempBackgroundFile);
                    newBackgroundPhotoURL = await getDownloadURL(snapshot.ref);
                }
        
                // Update email if it has changed
                if (email !== currentUser.email) {
                    try {
                        await updateEmail(currentUser, email);
                        emailUpdated = true;
                    } catch (error) {
                        console.error("Error updating email in Authentication: ", error);
                        if (error.code === 'auth/requires-recent-login') {
                            Swal.fire({
                                title: 'Login Ulang Diperlukan',
                                text: 'Untuk keamanan, silakan logout dan login kembali sebelum mengubah email Anda.',
                                icon: 'warning',
                                confirmButtonText: 'OK',
                                confirmButtonColor: '#1DA19E'
                            });
                            // Proses logout dan redirect ke halaman login bisa ditambahkan di sini
                            return;
                        }
                        // Jika error bukan karena perlu login ulang, tampilkan pesan error tapi lanjutkan update data lainnya
                        Swal.fire({
                            title: 'Gagal Memperbarui Email',
                            text: 'Gagal memperbarui email di Authentication. Perubahan profil lainnya akan tetap disimpan.',
                            icon: 'warning',
                            confirmButtonText: 'OK',
                            confirmButtonColor: '#1DA19E'
                        });
                    }
                }
        
                // Prepare user data for database update
                const userDataForUpdate = {
                    username,
                    phone,
                    email,
                    location,
                    firstName,
                    lastName,
                    province,
                    backgroundPhoto: newBackgroundPhotoURL,
                    profilePhoto: newProfilePhotoURL,
                };
        
                // Update user data in Realtime Database
                await set(userRef, userDataForUpdate);
        
                if (emailUpdated) {
                    await handleEmailVerification();
                }
        
                setTempBackgroundFile(null);
                setTempProfileFile(null);
        
                Swal.fire({
                    title: 'Profil Diperbarui!',
                    text: 'Profil Anda telah berhasil diperbarui dan disimpan.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#1DA19E'
                });
        
                setActivePage('My Profile');
            } catch (error) {
                console.error("Error updating profile: ", error);
                Swal.fire({
                    title: 'Gagal!',
                    text: 'Terjadi kesalahan saat memperbarui profil. ' + error.message,
                    icon: 'error',
                    confirmButtonText: 'OK',
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
                case 'Edit Profile':
                    return (
                        <div className="pembungkus" style={{ width:'548px', height:'950px', fontFamily:'Quicksand',paddingBottom:'90px' }}>
                            <h2 style={{fontSize:'25px', fontWeight:500, lineHeight:'30px', paddingTop:'16px', paddingBottom:'16px'}}>Edit Profile</h2>
                            <div className="profile-photo-upload" style={{marginBottom: '20px', textAlign: 'center',border: '2px dashed #ccc', padding:'20px'}}>
                                <input
                                    type="file"
                                    ref={profileInputRef}
                                    onChange={handleProfilePhotoUpload}
                                    accept="image/*"
                                    style={{display: 'none'}}
                                />
                                <div style={{width: '100px', height: '100px', margin: '0 auto', marginBottom: '10px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #ccc'}}>
                                    {profilePhoto ? (
                                        <img src={profilePhoto} alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                                    ) : (
                                        <div style={{width: '100%', height: '100%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            <FontAwesomeIcon icon={faUpload} style={{fontSize: '24px', color: '#1DA19E'}} />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => profileInputRef.current.click()}
                                    className="bg-teal-500 text-white px-4 py-2 rounded-full"
                                >
                                    Change Profile Photo
                                </button>
                            </div>
                        
                            <Box component="form" sx={{ '& > :not(style)': { m: 1, width: '25ch' } }} noValidate autoComplete="off">
                                <TextField
                                    id="First"
                                    label="First Name *"
                                    variant="outlined"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                                <TextField
                                    id="Last"
                                    label="Last Name *"
                                    variant="outlined"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                        
                                <TextField
                                    id="location"
                                    label="Location *"
                                    variant="outlined"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                                
                                <TextField
                                    id="province"
                                    label="Province *"
                                    variant="outlined"
                                value={province}
                                    onChange={(e) => setProvince(e.target.value)}
                                />
                            </Box>
                            <h2 style={{fontSize:'25px', fontWeight:500, lineHeight:'30px', paddingTop:'32px', paddingBottom:'16px'}}>Edit Contact</h2>
                            <Box component="form" sx={{ '& > :not(style)': { m: 1, width: '25ch' } }} noValidate autoComplete="off">
                                <TextField
                                    id="email"
                                    label="Email *"
                                    variant="outlined"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onBlur={() => validateEmail(email)}
                                    error={!!emailError}
                                    helperText={emailError}
                                />
                                <TextField
                                    id="phone"
                                    label="Phone Number *"
                                    variant="outlined"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </Box>

                            <h2 style={{fontSize:'25px', fontWeight:500, lineHeight:'30px', paddingTop:'32px', paddingBottom:'16px'}}>Upload Cover Photo</h2>
                            <div className="cover-photo-upload" style={{border: '2px dashed #ccc', borderRadius: '4px', padding: '20px', textAlign: 'center'}}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleBackgroundUpload}
                                    accept="image/*"
                                    style={{display: 'none'}}
                                />
                                <FontAwesomeIcon icon={faUpload} style={{fontSize: '24px', color: '#1DA19E', marginBottom: '10px'}} />
                                <p>Click to upload or drag and drop</p>
                                <p style={{fontSize: '12px', color: '#666'}}>SVG, PNG, JPG or GIF (max. 3MB)</p>
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="bg-teal-500 text-white px-4 py-2 rounded-full mt-4"
                                >
                                    Select File
                                </button>
                            </div>
                            <button
                                onClick={handleSaveProfile}
                                className="bg-teal-500 text-white px-4 py-2 rounded-full mt-4"
                            >
                                Save Changes
                            </button>
                        </div>
                    );
                
                case 'Security':
                    return <Keamanan />;
                case 'Payments':
                    return <Payments />;
                case 'My Profile':
                default:
                    return (
                        <>
                            <aside className="bg-white p-6 rounded-lg shadow-md" style={{ height: "400px", fontFamily: 'Quicksand', maxWidth: '281px' }}>
                                <h2 className="text-xl font-bold mt-6 mb-2">About me</h2>
                                <ul className="space-y-2">
                                    <li className="flex items-center">
                                        <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-600" />
                                        {firstName} {lastName}
                                    </li>
                                    <li className="flex items-center">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-gray-600" />
                                        {location || 'Not provided'}, {province}
                                    </li>
                                    <li className="flex items-center overflow-hidden">
                                        <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-gray-600" />
                                        <span className="truncate mr-2 text-gray-600" style={{ maxWidth: '200px' }}>{email}</span>
                                    </li>
                                    <li className="flex items-center">
                                        <FontAwesomeIcon icon={faPhone} className="mr-2 text-gray-600" />
                                        {phone || 'Not provided'}
                                    </li>
                                </ul>
                                <h2 className="text-xl font-bold mt-6 mb-2">Contribution</h2>
                                <li className="flex items-center">
                                    <FontAwesomeIcon icon={faStar} className="mr-2 text-gray-600" />
                                    {reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}
                                </li>
                            </aside>
                            <main className="flex-grow">
                    <UserReviewsComponent userId={user.uid} />
                </main>
                        </>
                    );
            }
        };

        return (
            <>
                <Navbaru />
                <div className="bg-gray-100 min-h-screen">
                <div className="w-full h-80 bg-cover bg-center" style={{backgroundImage: backgroundPhoto ? `url(${backgroundPhoto})` : "url('./src/assets/image/atas.jpg')"}}>
                </div>
                    <div className="max-w-6xl mx-auto -mt-24 mb-8">
                        <div className="bg-white rounded-lg shadow-md flex items-start" style={{ paddingRight:'45px', paddingLeft:'45px', paddingTop:'23px', paddingBottom:'23px'}}>
                            <div className="mr-6">
                                {isUploading ? (
                                    <Loading />
                                ) : profilePhoto ? (
                                    <img src={profilePhoto} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-quicksand" style={{ fontFamily: 'Quicksand, sans-serif' }}>
                                    <span>{firstName ? firstName[0].toUpperCase() : 'A'}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-grow" style={{ paddingTop:'20px' }}>
                                <h1 className="judul-personal" style={{ color:'#3A3A3A', fontSize:'35px', fontFamily:'Quicksand', fontWeight:700 }}>{firstName} {lastName}</h1>
                                <p className="isi-personal" style={{ fontSize:'16px', fontFamily:'Quicksand', fontWeight:300 }}>{email}</p>
                            </div>
                        </div>
                    </div>
                    <div className="max-w-6xl mx-auto flex gap-8" style={{ paddingBottom:'15px' }}>
                        {['My Profile', 'Edit Profile', 'Security', 'Payments', 'My Listings'].map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`personal-tombol ${activePage === page ? 'active' : ''}`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <div className="max-w-6xl mx-auto flex gap-8" style={{ paddingBottom:'45px' }}>
                            {renderContent()}
                        </div>
                    </div>
                    <Bawah />
                </>
            );
        }
        
        export default Personal;