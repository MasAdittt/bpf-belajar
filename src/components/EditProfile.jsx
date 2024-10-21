import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, set } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faUpload } from '@fortawesome/free-solid-svg-icons';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Swal from 'sweetalert2';

function EditProfile({ user, onSave, checkEmailExists }) {
    const [username, setUsername] = useState('');
    const [location, setLocation] = useState('');
    const [email, setEmail] = useState('');
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [emailError, setEmailError] = useState('');
    const fileInputRef = useRef(null);
    const coverPhotoInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setLocation(user.location || '');
            setEmail(user.email || '');
            setProfilePhoto(user.profilePhoto || null);
            setCoverPhoto(user.coverPhoto || null);
        }
    }, [user]);

    const handleProfilePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePhoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCoverPhotoUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const storage = getStorage();
            const fileRef = storageRef(storage, `coverPhotos/${user.uid}/${file.name}`);
            try {
                const snapshot = await uploadBytes(fileRef, file);
                const downloadURL = await getDownloadURL(snapshot.ref);
                setCoverPhoto(downloadURL);
                Swal.fire({
                    title: 'Success!',
                    text: 'Cover photo uploaded successfully',
                    icon: 'success',
                    confirmButtonColor: '#1DA19E'
                });
            } catch (error) {
                console.error("Error uploading file: ", error);
                Swal.fire({
                    title: 'Error!',
                    text: 'Failed to upload cover photo',
                    icon: 'error',
                    confirmButtonColor: '#1DA19E'
                });
            }
        }
    };

    const validateEmail = async (email) => {
        if (!email) {
            setEmailError('Email is required');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('Invalid email format');
            return false;
        }
        const exists = await checkEmailExists(email);
        if (exists && email !== user.email) {
            setEmailError('Email already exists');
            return false;
        }
        setEmailError('');
        return true;
    };

    const handleSaveProfile = async () => {
        const isEmailValid = await validateEmail(email);
        if (!isEmailValid) return;

        Swal.fire({
            title: 'Menyimpan...',
            text: 'Mohon tunggu sebentar',
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const db = getDatabase();
            const userRef = ref(db, `users/${user.uid}`);
            
            await set(userRef, {
                username,
                location,
                email,
                profilePhoto,
                coverPhoto
            });
            
            Swal.fire({
                title: 'Profil Diperbarui!',
                text: 'Profil Anda telah berhasil diperbarui dan disimpan.',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#1DA19E'
            });

            onSave();
        } catch (error) {
            console.error("Error updating profile: ", error);
            Swal.fire({
                title: 'Gagal!',
                text: 'Terjadi kesalahan saat memperbarui profil.',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#1DA19E'
            });
        }
    };

    return (
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
            <div className="mb-6 flex justify-center">
                <div className="relative">
                    <img
                        src={profilePhoto || '/placeholder-avatar.png'}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover"
                    />
                    <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-white rounded-full p-2 cursor-pointer">
                        <FontAwesomeIcon icon={faCamera} />
                    </label>
                    <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePhotoChange}
                    />
                </div>
            </div>
            <Box component="form" sx={{ '& > :not(style)': { m: 1, width: '25ch' } }} noValidate autoComplete="off">
                <TextField
                    id="username"
                    label="Username"
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    fullWidth
                />
                <TextField
                    id="location"
                    label="Location"
                    variant="outlined"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    fullWidth
                />
                <TextField
                    id="email"
                    label="Email"
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => validateEmail(email)}
                    error={!!emailError}
                    helperText={emailError}
                    fullWidth
                />
            </Box>
            <h2 className="text-xl font-bold mt-6 mb-2">Upload Cover Photo</h2>
            <div className="cover-photo-upload" style={{border: '2px dashed #ccc', borderRadius: '4px', padding: '20px', textAlign: 'center'}}>
                <input
                    type="file"
                    ref={coverPhotoInputRef}
                    onChange={handleCoverPhotoUpload}
                    accept="image/*"
                    style={{display: 'none'}}
                />
                <FontAwesomeIcon icon={faUpload} style={{fontSize: '24px', color: '#1DA19E', marginBottom: '10px'}} />
                <p>Click to upload or drag and drop</p>
                <p style={{fontSize: '12px', color: '#666'}}>SVG, PNG, JPG or GIF (max. 3MB)</p>
                <button
                    onClick={() => coverPhotoInputRef.current.click()}
                    className="bg-teal-500 text-white px-4 py-2 rounded-full mt-4"
                >
                    Select File
                </button>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
                <button
                    onClick={() => onSave()}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Save
                </button>
            </div>
        </div>
    );
}

export default EditProfile;