import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Card, CardContent } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard } from '@fortawesome/free-solid-svg-icons';

function Payments() {
    const [currentMethod, setCurrentMethod] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [cvv, setCvv] = useState('');

    const handleSave = (e) => {
        e.preventDefault();
        // Here you would typically send this data to your backend
        console.log('Saving new payment method:', { cardNumber, expirationDate, cvv });
        // Reset form fields
        setCardNumber('');
        setExpirationDate('');
        setCvv('');
    };

    return (
        <Box sx={{ width: '548px', fontFamily: 'Quicksand', paddingBottom: '90px' }}>
            <Typography variant="h5" sx={{ fontWeight: 500, marginBottom: '20px', fontFamily: 'Quicksand', fontSize: '25px' }}>
                Current Payment Method
            </Typography>
            <Box component="form" onSubmit={handleSave} sx={{ '& > :not(style)': { m: 1, width: '100%' } }}>
                <TextField
                    label="Current Method"
                    variant="outlined"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    InputProps={{
                        sx: { fontFamily: 'Quicksand' },
                    }}
                    InputLabelProps={{
                        sx: { fontFamily: 'Quicksand' },
                    }}
                />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 500, marginBottom: '20px', fontFamily: 'Quicksand', fontSize: '25px',paddingTop:'16px' }}>
                Add New Payment Method
            </Typography>

            <Box component="form" onSubmit={handleSave} sx={{ '& > :not(style)': { m: 1, width: '100%' } }}>
                <TextField
                    label="Card Number"
                    variant="outlined"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    required
                    InputProps={{
                        startAdornment: <FontAwesomeIcon icon={faCreditCard} style={{ marginRight: '10px', color:'#6B6B6B' }} />,
                        sx: { fontFamily: 'Quicksand' },
                    }}
                    InputLabelProps={{
                        sx: { fontFamily: 'Quicksand' },
                    }}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        label="Expiration Date"
                        variant="outlined"
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                        required
                        placeholder="MM/YY"
                        InputProps={{
                            sx: { fontFamily: 'Quicksand' },
                        }}
                        InputLabelProps={{
                            sx: { fontFamily: 'Quicksand' },
                        }}
                    />
                    <TextField
                        label="CV / CVC2"
                        variant="outlined"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        required
                        InputProps={{
                            sx: { fontFamily: 'Quicksand' },
                        }}
                        InputLabelProps={{
                            sx: { fontFamily: 'Quicksand' },
                        }}
                    />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
                    <Button
                        type="submit"
                        variant="contained"
                        sx={{ 
                            marginTop: '20px', 
                            backgroundColor: '#1DA19E',
                            fontFamily: 'Quicksand',
                            borderRadius:'20px',
                            width:'117px',
                            '&:hover': {
                                backgroundColor: '#178784',
                            },
                        }}
                    >
                        Save
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ 
                            marginTop: '20px', 
                            color: '#1DA19E', 
                            borderColor: '#1DA19E',
                            borderRadius:'20px',
                            width:'117px',
                            fontFamily: 'Quicksand',
                            '&:hover': {
                                borderColor: '#178784',
                                color: '#178784',
                            },
                        }}
                        onClick={() => {
                            setCardNumber('');
                            setExpirationDate('');
                            setCvv('');
                        }}
                    >
                        Cancel
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

export default Payments;