import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Link, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { firebaseAuthentication, database } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  onAuthStateChanged,
  updateProfile 
} from 'firebase/auth';
import { ref, set, get, query, orderByChild, equalTo } from 'firebase/database';
import SimpleNavbar from '../components/Navlogin';
import Swal from 'sweetalert2';
import Logo from '../assets/image/Logo.svg';

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [userVerified, setUserVerified] = useState(false);

  const saveUserToDatabase = async (user, username) => {
    try {
      await set(ref(database, 'users/' + user.uid), {
        username: username,
        email: user.email,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error("Error saving user to database:", error);
      throw error;
    }
  };

  const validateUniqueUsername = async (username) => {
    try {
      const usernameQuery = query(
        ref(database, 'users'), 
        orderByChild('username'), 
        equalTo(username)
      );
      const snapshot = await get(usernameQuery);
      return !snapshot.exists();
    } catch (error) {
      console.error("Error checking username uniqueness:", error);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuthentication, async (user) => {
      if (user) {
        try {
          await user.reload();
          if (user.emailVerified) {
            const userRef = ref(database, 'users/' + user.uid);
            const snapshot = await get(userRef);

            if (!snapshot.exists()) {
              await saveUserToDatabase(user, user.displayName);

              Swal.fire({
                icon: 'success',
                title: 'Welcome!',
                text: 'Your account has been verified and created successfully.',
                confirmButtonText: 'Continue',
                iconColor: '#1DA19E',
                confirmButtonColor: '#1DA19E'
              });
              navigate('/complete-profile');
            } else {
              navigate('/complete-profile');
            }
          }
        } catch (error) {
          console.error('Authentication or Database Error:', error);
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const registerUser = async (values) => {
    setLoading(true);
    try {
      const isUsernameUnique = await validateUniqueUsername(values.username);
      
      if (!isUsernameUnique) {
        Swal.fire({
          icon: 'error',
          title: 'Username Already Taken',
          text: 'This username is already in use. Please choose a different username.',
          confirmButtonText: 'OK'
        });
        setLoading(false);
        return;
      }
  
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuthentication, 
        values.email, 
        values.password
      );
      const user = userCredential.user;
  
      await updateProfile(user, { 
        displayName: values.username 
      });

      await saveUserToDatabase(user, values.username);
  
      await sendEmailVerification(user);
      await firebaseAuthentication.signOut();
      
      setEmailVerificationSent(true);
      
      Swal.fire({ 
        icon: 'success',
        title: 'Verification Email Sent',
        text: 'Please check your email to verify your account. You will be added to our system after verification.',
        confirmButtonText: 'OK',
        iconColor: '#1DA19E',
        confirmButtonColor: '#1DA19E',
        customClass: {
          popup: 'rounded-xl !w-[400px] !min-h-[250px]',
          confirmButton: 'px-8 py-2 !rounded-[12px] !font-Lexend',
          title: 'text-xl font-medium mb-2 !font-lexend',
          htmlContainer: 'text-gray-600 !font-lexend'
        }
      }).then(() => {
        navigate('/Login');
      });
  
    } catch (error) {
      console.error("Error registering user: ", error.message);
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: 'This email address is already registered. Please use a different email or login to your existing account.',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: registerUser,
    validationSchema: yup.object().shape({
      username: yup.string()
        .required('Username is required')
        .min(3, 'Username should be at least 3 characters long')
        .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
      email: yup.string()
        .required('Email is required')
        .email('Invalid email format'),
      password: yup.string()
        .required('Password is required')
        .min(8, 'Password should be at least 8 characters long'),
      confirmPassword: yup.string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Password confirmation is required'),
    }),
  });

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
            Welcome To <br />
            Bali Pet Friendly
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
                label="Username"
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
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

              <TextField
                fullWidth
                margin="normal"
                label="Password"
                type="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}                sx={{
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

              <TextField
                fullWidth
                margin="normal"
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                sx={{
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
                  Register
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
                <Typography sx={{fontFamily:'Lexend',color:'#6B6B6B'}}>Already Registered? </Typography>
                <Link
                  href="/Login"
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
                  Login Now?
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

export default Register;