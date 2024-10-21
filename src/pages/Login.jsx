import React from 'react';
import '../style/Login.css';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { firebaseAuthentication, database } from '../config/firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { getDatabase, ref, query, orderByChild, equalTo, get } from "firebase/database"; // Import untuk Realtime Database
import Swal from 'sweetalert2';

function Login() {
  const navigate = useNavigate();

  const getEmailFromUsername = async (username) => {
    const db = getDatabase();
    const usersRef = ref(db, 'users'); // Sesuaikan path ini dengan struktur database Anda
    const usersQuery = query(usersRef, orderByChild('username'), equalTo(username));
    const snapshot = await get(usersQuery);

    if (snapshot.exists()) {
      const userData = snapshot.val();
      const userId = Object.keys(userData)[0]; // Ambil user pertama yang ditemukan
      return userData[userId].email; // Ambil email terkait username
    } else {
      throw new Error('Username tidak ditemukan');
    }
  };

  const loginUser = async () => {
    try {
      let email = formik.values.email;
      
      // Jika input bukan format email, anggap itu adalah username dan cari email terkait
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        console.log("Mencari email untuk username:", email);
        email = await getEmailFromUsername(email);
        console.log("Email yang ditemukan untuk username:", email);
      }

      // Proses login dengan Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        firebaseAuthentication, 
        email, 
        formik.values.password
      );
      console.log("Login berhasil, user:", userCredential.user.uid);
  
      // Cek apakah email pengguna adalah email admin
      const adminEmail = "adityabayuwicaksono38@gmail.com";
      if (userCredential.user.email === adminEmail) {
        Swal.fire({
          icon: 'success',
          title: 'Login Berhasil',
          text: 'Selamat datang, Admin!',
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/admin');
          }
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Login Berhasil',
          text: 'Selamat datang!',
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/');
          }
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = 'Login gagal: ';
      switch(error.code) {
        case 'auth/user-not-found':
          errorMessage += 'Akun tidak ditemukan';
          break;
        case 'auth/wrong-password':
          errorMessage += 'Password salah';
          break;
        default:
          errorMessage += error.message;
      }
      alert(errorMessage);
    }
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: loginUser,
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
  });

  const handleFormChange = (event) => {
    const { target } = event;
    formik.setFieldValue(target.name, target.value);
  };

  return (
    <section className='Login'>
      <div className="Login-form">
        <img src="https://balipetfriendly.com/wp-content/uploads/2023/10/Logo-BPF.png.webp" alt="Logo BPF" />
        <form onSubmit={formik.handleSubmit}>
          <div className='input-container'>
            <label>
              <p className='username'>Username atau Email Address</p>
              <input
                onChange={handleFormChange}
                type="text"
                name="email"
                placeholder='Masukkan username atau email'
                value={formik.values.email}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email ? (
                <div className="error-message">{formik.errors.email}</div>
              ) : null}
            </label>
          </div>
          
          <div className='input-container'>
            <label>
              <p className='username'>Password</p>
              <input
                onChange={handleFormChange}
                type="password"
                name="password"
                placeholder='Masukkan password Anda'
                value={formik.values.password}
                onBlur={formik.handleBlur}
              />
              {formik.touched.password && formik.errors.password ? (
                <div className="error-message">{formik.errors.password}</div>
              ) : null}
            </label>
          </div>

          <div className="remember-me">
            <input type="checkbox" name="remember" />
            <label>
              <p className='username'>Remember me</p>
            </label>
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
      <div className="additional-links-login">
        <a href="/Daftar">Register</a>
        <a href="/Lupa">Forgot password?</a>
      </div>
    </section>
  );
}

export default Login;
