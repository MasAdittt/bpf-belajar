import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Link, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { firebaseAuthentication } from '../config/firebase';
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import SimpleNavbar from '../components/Navlogin';
import Swal from 'sweetalert2';
import Logo from '../assets/image/Logo.svg';

function Lupa() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const resetPassword = async (values) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(firebaseAuthentication, values.email);
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      Swal.fire({ 
        icon: 'success',
        text: 'If the email address you entered matches an account in our system, we have sent a password reset link. Please check your inbox (and spam folder) for further instructions.',
        confirmButtonText: 'Login',
        iconColor: '#1DA19E',
        confirmButtonColor: '#1DA19E',
        fontFamily: 'Lexend',
        customClass: {
          popup: 'rounded-xl !w-[700px] !min-h-[300px] !py-[30px] !px-[60px]  ', // Membuat kotak lebih lebar dan tinggi
          confirmButton: 'px-8 py-2 !rounded-[12px] !font-ADELIA',
          title: 'text-xl font-medium mb-4 !font-lexend',
          htmlContainer: 'text-gray-600 !font-lexend !px-8 !py-4', // Menambah padding untuk konten
          icon: 'mb-4', // Memberi jarak di bawah icon
          actions: 'mt-6' // Memberi jarak di atas tombol
        },
        backdrop: `
          rgba(0,0,0,0.4)
          font-family: 'Lexend', sans-serif;
        `
      }).then(() => {
        navigate('/Coba');
      });
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    onSubmit: resetPassword,
    validationSchema: yup.object().shape({
      email: yup.string()
        .required('Email is required')
        .email('Invalid email format'),
    }),
  });

  // Sisanya sama seperti sebelumnya
  return (
    <>
      <SimpleNavbar />
      <Container 
        component="main" 
        maxWidth="100%" 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          backgroundColor: '#F2F2F2',
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            width: { xs: '100%', sm: '100%', md: '672px' },
            margin: '0 auto',
            px: { xs: 0, sm: 2 }
          }}
        >
          <Typography 
            component="h2" 
            variant="h4" 
            sx={{ 
              mb: { xs: 2, sm: 3 },
              fontWeight: 400, 
              textAlign: 'center', 
              fontFamily: 'ADELIA', 
              color: '#3A3A3A', 
              fontSize: { xs: '24px', sm: '32px', md: '39px' },
              width: { xs: '100%', sm: '400px', md: '500px' },
              lineHeight: { xs: '36px', sm: '48px', md: '62px' },
              paddingTop: { xs: '20px', sm: '30px', md: '38px' },
              px: { xs: 2, sm: 0 }
            }}
          >
            welcome to <br />
            Bali pet friendly
          </Typography>

          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 3, sm: 4, md: 6 },
              width: '100%', 
              borderRadius: 2,
              maxWidth: { xs: '100%', sm: '100%', md: '672px' }
            }}
          >
            <Box sx={{ 
              mb: 3, 
              textAlign: 'center',
              '& img': {
                height: { xs: '35px', sm: '40px', md: '43px' },
                width: 'auto'
              }
            }}>
              <img
                src={Logo}
                alt="Logo BPF"
                style={{ margin: '0 auto' }}
              />
            </Box>

            <form onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                margin="normal"
                label="Email Address"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                sx={{
                  width: '100%',
                  mb: 2,
                  '& .MuiInputBase-input': {
                    fontFamily: 'Lexend',
                    fontSize: { xs: '14px', sm: '16px' }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'Lexend',
                    fontSize: { xs: '14px', sm: '16px' }
                  }
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 2,
                  mb: 2,
                  bgcolor: '#1DA19E',
                  '&:hover': {
                    bgcolor: '#158784',
                  },
                  '&.Mui-disabled': {
                    bgcolor: '#1DA19E',
                    opacity: 0.7,
                  },
                  borderRadius: '12px',
                  py: { xs: 1.2, sm: 1.5 },
                  fontFamily: 'Lexend',
                  fontWeight: 500,
                  boxShadow: 'none',
                  fontSize: { xs: '14px', sm: '16px' }
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '100%'
                }}>
                  Reset Password
                  {loading && (
                    <CircularProgress
                      size={20}
                      sx={{
                        color: 'white',
                        marginLeft: 1
                      }}
                    />
                  )}
                </Box>
              </Button>

              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center',
                  gap: { xs: 2, sm: 4, md: 3 },
                  mt: 2
                }}
              >
                <Link
                  href="/Coba"
                  sx={{
                    fontFamily: 'Lexend',
                    color: '#6B6B6B',
                    textDecoration: 'none',
                    '&:hover': {
                      color: '#158784',
                      textDecoration: 'underline'
                    },
                    fontSize: { xs: '14px', sm: '16px' }
                  }}
                >
                  Login
                </Link>
                <Link
                  href="/Daftar"
                  sx={{
                    fontFamily: 'Lexend',
                    color: '#6B6B6B',
                    textDecoration: 'none',
                    '&:hover': {
                      color: '#158784',
                      textDecoration: 'underline'
                    },
                    fontSize: { xs: '14px', sm: '16px' }
                  }}
                >
                  Register Account
                </Link>
              </Box>
            </form>
          </Paper>

          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mt: 3, 
              paddingBottom: { xs: '30px', sm: '40px', md: '50px' },
              fontFamily: 'Lexend', 
              fontWeight: 500,
              fontSize: { xs: '12px', sm: '14px' }
            }}
          >
            © 2024 Balipetfriendly
          </Typography>
        </Box>
      </Container>
    </>
  );
}

export default Lupa;