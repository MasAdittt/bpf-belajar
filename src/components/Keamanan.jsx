import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { getDatabase, ref, set, get } from "firebase/database";
import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Switch, FormControlLabel, Alert, CircularProgress } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faClock } from '@fortawesome/free-solid-svg-icons';
import { color } from "framer-motion";

function Keamanan({ user }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [twoFactorAuth, setTwoFactorAuth] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [lastUpdated, setLastUpdated] = useState('');
    const [updateError, setUpdateError] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchLastPasswordChangeTime = async () => {
        if (user && user.uid) {
            setIsLoading(true);
            try {
                const db = getDatabase();
                const userRef = ref(db, `users/${user.uid}/securitySettings/lastPasswordChangeTime`);
                const snapshot = await get(userRef);

                if (snapshot.exists()) {
                    console.log("Data ditemukan:", snapshot.val());
                    const lastChangeTime = snapshot.val();
                    if (!isNaN(lastChangeTime)) {
                        const lastChangeDate = new Date(lastChangeTime);
                        const formattedDate = lastChangeDate.toLocaleString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'Asia/Jakarta',
                        });
                        setLastUpdated(`${formattedDate} WIB`);
                    } else {
                        setLastUpdated('Invalid date format');
                    }
                } else {
                    console.log("Data tidak ditemukan");
                    setLastUpdated('No information available');
                }
            } catch (error) {
                console.error('Error fetching lastPasswordChangeTime:', error);
                console.error('User ID:', user?.uid);
                console.error('Database path:', `users/${user?.uid}/securitySettings/lastPasswordChangeTime`);
                setLastUpdated('Error fetching data');
            } finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        if (user && user.uid) {
            fetchLastPasswordChangeTime();
        } else {
            console.log("No valid user found, skipping fetch");
            setIsLoading(false); // Pastikan isLoading jadi false kalau user tidak ada
        }
    }, [user]);

    const validatePasswords = () => {
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords don't match");
            return false;
        }
        if (newPassword.length < 8) {
            setPasswordError("Password must be at least 8 characters long");
            return false;
        }
        setPasswordError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdateError('');
        setUpdateSuccess('');
    
        if (validatePasswords()) {
            const auth = getAuth();
            const currentUser = auth.currentUser;
    
            if (currentUser) {
                const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
    
                try {
                    await reauthenticateWithCredential(currentUser, credential);
                    await updatePassword(currentUser, newPassword);
                    
                    const db = getDatabase();
                    const userRef = ref(db, `users/${currentUser.uid}/securitySettings`);
                    await set(userRef, {
                        twoFactorAuth,
                        lastPasswordChangeTime: new Date().getTime(),
                    });
    
                    setUpdateSuccess("Security settings updated successfully!");
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    
                    // Refetch the last update time
                    fetchLastPasswordChangeTime();
                } catch (error) {
                    console.error("Error updating security settings:", error);
                    setUpdateError(error.message || "Failed to update security settings. Please try again.");
                }
            } else {
                setUpdateError("No authenticated user found.");
            }
        }
    };
    
    return (
        <Box className="security-wrapper" sx={{ width: '548px', fontFamily: 'Quicksand', paddingBottom: '40px' }}>
            <Typography variant="h5" sx={{ fontWeight: 500, marginBottom: '20px', display: 'flex', alignItems: 'center', fontFamily:'Quicksand', fontSize:'25px' }}>
                Security Settings
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ '& > :not(style)': { m: 1, width: '100%' } }}>
    {updateError && <Alert severity="error">{updateError}</Alert>}
    {updateSuccess && <Alert severity="success">{updateSuccess}</Alert>}
    
    <TextField
        type="password"
        label="Current Password"
        variant="outlined"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        required
        InputProps={{
            sx: { fontFamily: 'Quicksand' },
        }}
        InputLabelProps={{
            sx: { fontFamily: 'Quicksand' },
        }}  
    />
    <TextField
        type="password"
        label="New Password"
        variant="outlined"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
        error={!!passwordError}
        helperText={passwordError}
        InputProps={{
            sx: { fontFamily: 'Quicksand' },
        }}
        InputLabelProps={{
            sx: { fontFamily: 'Quicksand' },
        }}  
    />
    <TextField
        type="password"
        label="Confirm New Password"
        variant="outlined"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        error={!!passwordError}
        helperText={passwordError}
        InputProps={{
            sx: { fontFamily: 'Quicksand' },
        }}
        InputLabelProps={{
            sx: { fontFamily: 'Quicksand' },
        }}  
    />

    {/* Wrapper untuk tombol Save dan Cancel */}
    <Box sx={{ display: 'flex', justifyContent: 'start', marginTop: '20px', gap:'20px' }}>
        <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ backgroundColor: '#1DA19E', fontFamily: 'Quicksand',width:'117px',borderRadius:'20px      ' }}
        >
            Save
        </Button>
        <Button
            variant="outlined"
            color="secondary"
            sx={{ fontFamily: 'Quicksand', borderColor: '#1DA19E',borderRadius:'20px',width:'117px',color:'#1DA19E' }}
            onClick={() => {
                // Action untuk tombol Cancel
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setUpdateError('');
                setUpdateSuccess('');
            }}
        >
            Cancel
        </Button>
    </Box>
</Box>
</Box>
    );
}

export default Keamanan;