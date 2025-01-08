import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../config/Auth';
import { getDatabase, ref, onValue, set } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faStar, faMapMarkerAlt, faEnvelope, faPhone, faUpload } from '@fortawesome/free-solid-svg-icons';
import Navbaru from '../components/Navbaru';
import Loading from '../components/Loading';
import Swal from 'sweetalert2';
import Bawah from '../components/Bawah';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

function Personal() {
    // ... (previous state declarations)
    const [coverPhoto, setCoverPhoto] = useState(null);
    const fileInputRef = useRef(null);

    // ... (previous useEffect and other functions)

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setIsUploading(true);
            const storage = getStorage();
            const fileRef = storageRef(storage, `coverPhotos/${user.uid}/${file.name}`);
            try {
                const snapshot = await uploadBytes(fileRef, file);
                const downloadURL = await getDownloadURL(snapshot.ref);
                setCoverPhoto(downloadURL);
                // Update user profile in the database
                const db = getDatabase();
                const userRef = ref(db, `users/${user.uid}`);
                await set(userRef, {
                    ...user,
                    coverPhoto: downloadURL
                });
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
            } finally {
                setIsUploading(false);
            }
        }
    };

    const renderContent = () => {
        switch (activePage) {
            case 'Edit Profile':
                return (
                    <div className="pembungkus" style={{ width:'548px', height:'663px', fontFamily:'Quicksand' }}>
                        {/* ... (previous TextField components) */}

                        <h2 style={{fontSize:'25px', fontWeight:500, lineHeight:'30px', paddingTop:'32px', paddingBottom:'16px'}}>Upload Cover Photo</h2>
                        <div className="cover-photo-upload" style={{border: '2px dashed #ccc', borderRadius: '4px', padding: '20px', textAlign: 'center'}}>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
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
            // ... (rest of the switch cases)
        }
    };

    return (
        <>
            <Navbaru />
            <div className="bg-gray-100 min-h-screen">
                <div className="w-full h-80 bg-cover bg-center" style={{backgroundImage: coverPhoto ? `url(${coverPhoto})` : "url('./src/assets/image/atas.jpg')"}}>
                </div>
                {/* ... (rest of the component) */}
            </div>
            <Bawah />
        </>
    );
}

export default Personal;