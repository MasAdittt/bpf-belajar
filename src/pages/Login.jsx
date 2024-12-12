import React, { useEffect, useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, FormControlLabel, Checkbox, Link,CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { firebaseAuthentication } from '../config/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, query, orderByChild, equalTo, get, set, onDisconnect, serverTimestamp, onValue } from "firebase/database";
import SimpleNavbar from '../components/Navlogin';
import Swal from 'sweetalert2';
import Logo from '../assets/image/Logo.svg';

// Komponen Alert Notification
const AlertNotification = ({ message, type = 'error', duration = 8000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed 
        top-9 left-1/2 transform -translate-x-1/2 z-50
        px-4 py-2 md:px-6 md:py-3
        rounded-full shadow-lg
        w-11/12 md:w-auto
        text-sm md:text-base
        animate-fadeIn transition-all duration-500 ease-in-out
        ${type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
    >
      <div className="flex items-center gap-2">
        {type === 'error' && (
          <svg 
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        <span className="font-lexend text-sm font-medium" style={{color:'white'}}>
          {message}
        </span>
      </div>
    </div>
  );
};

function Login() {
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);
  // State untuk alert notification
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedCredentials = localStorage.getItem('rememberedCredentials');
    if (savedCredentials) {
      const { email, password } = JSON.parse(savedCredentials);
      formik.setFieldValue('email', email);
      formik.setFieldValue('password', password);
      setRememberMe(true);
    }
  }, []);

  const handleRememberMe = (event) => {
    setRememberMe(event.target.checked);
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: yup.object().shape({
      email: yup.string().required('Username atau email diperlukan'),
      password: yup
        .string()
        .required('Password diperlukan')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.{8,})/,
          'Password harus mengandung setidaknya 8 karakter, termasuk huruf kapital dan kecil'
        ),
    }),
    onSubmit: loginUser,
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(firebaseAuthentication, (user) => {
      if (user) {
        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}`);
        
        const unsubscribeStatus = onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          if (userData && userData.status === 'inactive') {
            handleAutoLogout();
          }
        });

        return () => unsubscribeStatus();
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const handleAutoLogout = async () => {
    try {
      await signOut(firebaseAuthentication);
      setAlertMessage('Akun Anda telah dinonaktifkan oleh admin. Anda telah dikeluarkan dari sistem.');
      setShowAlert(true);
      navigate('/Coba');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getEmailFromUsername = async (username) => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    const usersQuery = query(usersRef, orderByChild('username'), equalTo(username));
    const snapshot = await get(usersQuery);

    if (snapshot.exists()) {
      const userData = snapshot.val();
      const userId = Object.keys(userData)[0];
      return { 
        email: userData[userId].email,
        status: userData[userId].status
      };
    } else {
      throw new Error('Username tidak ditemukan');
    }
  };

  const checkUserStatus = async (email) => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    const userQuery = query(usersRef, orderByChild('email'), equalTo(email));
    const snapshot = await get(userQuery);

    if (snapshot.exists()) {
      const userData = Object.values(snapshot.val())[0];
      return userData.status;
    }
    return null;
  };

  const updateOnlineStatus = async (userId) => {
    const db = getDatabase();
    const userStatusRef = ref(db, `status/${userId}`);
    
    const onlineStatus = {
      state: 'online',
      lastSeen: serverTimestamp(),
      lastLogin: serverTimestamp()
    };

    await set(userStatusRef, onlineStatus);

    const connectedRef = ref(db, '.info/connected');
    onDisconnect(userStatusRef).set({
      state: 'offline',
      lastSeen: serverTimestamp(),
      lastLogin: onlineStatus.lastLogin
    });
  };

  async function loginUser() {
    setIsLoading(true);
    try {
      let email = formik.values.email;
      let userStatus;
      
      // Get email if username was provided
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const userData = await getEmailFromUsername(email);
        email = userData.email;
        userStatus = userData.status;
      } else {
        userStatus = await checkUserStatus(email);
      }
  
      // Check if account is active
      if (userStatus === 'inactive') {
        setAlertMessage('Akun Anda telah dinonaktifkan. Silakan hubungi admin untuk informasi lebih lanjut.');
        setShowAlert(true);
        setIsLoading(false);
        return;
      }
  
      // Attempt login
      const userCredential = await signInWithEmailAndPassword(
        firebaseAuthentication, 
        email, 
        formik.values.password
      );
  
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        await signOut(firebaseAuthentication);
        setAlertMessage('Email Anda belum terverifikasi. Silakan cek email Anda untuk link verifikasi.');
        setShowAlert(true);
        setIsLoading(false);
        return;
      }
  
      // Continue with successful login
      await updateOnlineStatus(userCredential.user.uid);
  
      if (rememberMe) {
        localStorage.setItem('rememberedCredentials', JSON.stringify({
          email: formik.values.email,
          password: formik.values.password
        }));
      } else {
        localStorage.removeItem('rememberedCredentials');
      }
  
      const adminEmail = "adityabayuwicaksono38@gmail.com";
      if (userCredential.user.email === adminEmail) {
        navigate('/admin');
      } else {
        navigate('/');
      }
  
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = 'Invalid credential, please check your username, email or password';
      setAlertMessage(errorMessage);
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <SimpleNavbar />
      {/* Alert Notification */}
      {showAlert && (
        <AlertNotification 
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
      <Container component="main" maxWidth="100%" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor:'#F2F2F2',   px: { xs: 2, sm: 4, md: 6 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: { xs: '100%', sm: '100%', md: '672px' }, margin:'0 auto',  px: { xs: 2, sm: 0 }  }}>
          <Typography component="h2" variant="h4" sx={{ mb: 3, fontWeight: 400, textAlign: 'center', fontFamily:'ADELIA', color:'#3A3A3A', fontSize: { xs: '24px', sm: '30px', md: '39px' },width: { xs: '100%', sm: '400px', md: '500px' },lineHeight: { xs: '36px', sm: '48px', md: '62px' }, paddingTop: { xs: '20px', sm: '30px', md: '38px' }}}>
            LOGIN TO EXPLORE
            BALI PET FRIENDLY
          </Typography>

          <Paper elevation={0} sx={{p: { xs: 3, sm: 4, md: 6 },  maxWidth: { xs: '100%', sm: '100%', md: '672px' } , borderRadius: 2 }}>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <img
                src={Logo}
                alt="Logo BPF"
                style={{ height: '43px', width: '131px', margin:'0 auto' }}
              />
            </Box>

            <form onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                margin="normal"
                label="Username or Email Address"
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
                helperText={formik.touched.password && formik.errors.password}
                sx={{ 
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

              <FormControlLabel
                control={
                  <Checkbox 
                    color="primary"       
                    checked={rememberMe}
                    onChange={handleRememberMe}
                  />
                }
                label="Remember me"
                sx={{ 
                  mt: 1,
                  '& .MuiFormControlLabel-label': {
                    fontFamily: 'Lexend',
                    color: '#6B6B6B',
                    fontSize: '16px',
                    fontWeight: 500
                  }
                }}
              />

<Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  mt: 2,
                  mb: 2,
                  bgcolor: '#1DA19E',
                  '&:hover': {
                    bgcolor: '#158784',
                  },
                  borderRadius: '12px',
                  py: { xs: 1, sm: 1.5 },
                  fontFamily: 'Lexend',
                  fontWeight: 500,
                  boxShadow: 'none',
                  position: 'relative',
                  minHeight: { xs: '40px', sm: '48px' },
                  fontSize: { xs: '14px', sm: '16px' }
                }}
              >
                {isLoading ? (
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
                ) : (
                  'Login'
                )}
              </Button>
              <div className="flex justify-center items-center mt-5 w-full max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row sm:gap-20 gap-4">
                  <Link
                    href="/Lupa"
                    className="hover:text-[#158784] hover:underline font-lexend text-center sm:text-left"
                    style={{
                      fontFamily:'Lexend',
                      color:'#6B6B6B',
                      fontSize: window.innerWidth < 600 ? '14px' : '16px'
                    }}
                  >
                    Forgot password?
                  </Link>
                  <Link
                    href="/Daftar"
                    className="text-zinc-500 hover:text-[#158784] hover:underline text-center sm:text-left"
                    style={{
                      fontFamily:'Lexend',
                      color:'#6B6B6B',
                      fontSize: window.innerWidth < 600 ? '14px' : '16px'
                    }}
                  >
                    Register Account
                  </Link>
                </div>
              </div>
            </form>
          </Paper>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 3,paddingBottom: { xs: '30px', sm: '50px' }, fontFamily:'Lexend', fontWeight:500,  fontSize: { xs: '12px', sm: '14px' } }}>
            © 2024 Balipetfriendly
          </Typography>
        </Box>
      </Container>
    </>
  );
}

export default Login;