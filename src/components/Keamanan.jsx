import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { getDatabase, ref, set, get } from "firebase/database";
import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Alert } from '@mui/material';

function Keamanan({ user }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [updateError, setUpdateError] = useState('');
    const [updateSuccess, setUpdateSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState('');

    // Previous functions remain the same
    const fetchLastPasswordChangeTime = async () => {
        // ... existing implementation
    };

    useEffect(() => {
        if (user && user.uid) {
            fetchLastPasswordChangeTime();
        }
    }, [user]);

    const validatePasswords = () => {
        // ... existing implementation
    };

    const handleSubmit = async (e) => {
        // ... existing implementation
    };

    return (
        <Box sx={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: {xs: '10px', sm: '15px'},
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
            <Box component="form" onSubmit={handleSubmit} 
                sx={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '15px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                {updateError && <Alert severity="error" sx={{ mb: 2 }}>{updateError}</Alert>}
                {updateSuccess && <Alert severity="success" sx={{ mb: 2 }}>{updateSuccess}</Alert>}

                <TextField
                    type="password"
                    label="Current Password"
                    variant="outlined"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    fullWidth
                    sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            borderRadius: '8px'
                        }
                    }}
                />

                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    width: '100%',
                    mb: 3
                }}>
                    <TextField
                        type="password"
                        label="New Password"
                        variant="outlined"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        fullWidth
                        error={!!passwordError}
                        helperText={passwordError}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'white',
                                borderRadius: '8px'
                            }
                        }}
                    />
                    <TextField
                        type="password"
                        label="Confirm New Password"
                        variant="outlined"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        fullWidth
                        error={!!passwordError}
                        helperText={passwordError}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'white',
                                borderRadius: '8px'
                            }
                        }}
                    />
                </Box>

                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 2, sm: '20px' }
                }}>
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{
                            backgroundColor: '#1DA19E',
                            fontFamily: 'Lexend',
                            borderRadius: '12px',
                            fontSize: '15px',
                            padding: '12px',
                            width: { xs: '100%', sm: '117px' },
                            textTransform: 'none',
                            boxShadow: 'none',
                        }}
                    >
                        Save
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{
                            borderColor: '#1DA19E',
                            borderRadius: '12px',
                            fontFamily: 'Lexend',
                            width: { xs: '100%', sm: 'auto' },
                            color: '#1DA19E',
                            '&:hover': {
                                borderColor: '#158784',
                                color: '#158784'
                            }
                        }}
                        onClick={() => {
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