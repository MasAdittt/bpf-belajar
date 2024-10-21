import React from 'react';
import '../style/Register.css';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { firebaseAuthentication, database } from '../config/firebase'; // Import database
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { ref, set } from 'firebase/database'; // Import dari Realtime Database

function Register() {
  const navigate = useNavigate();

  const registerUser = async (values) => {
    try {
      // Register a new user using email and password
      const userCredential = await createUserWithEmailAndPassword(firebaseAuthentication, values.email, values.password);
      const user = userCredential.user;

      // Set the username for the newly registered user
      await updateProfile(user, { displayName: values.username });

      // Save additional user data to Realtime Database
      const userRef = ref(database, 'users/' + user.uid);
      await set(userRef, {
        username: values.username,
        email: values.email,
      });

      // Send email verification
      await sendEmailVerification(user);
      
      alert('Registration successful! Please check your email for verification.');
      navigate('/Coba');
    } catch (error) {
      console.error("Error registering user: ", error.message);
      alert(`Registration failed: ${error.message}`);
    }
  };

  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '', // Add confirm password field
    },
    onSubmit: registerUser, // Connect onSubmit with registerUser
    validationSchema: yup.object().shape({
      username: yup.string()
        .required('Username is required')
        .min(3, 'Username should be at least 3 characters long'),
      email: yup.string()
        .required('Email is required')
        .email('Invalid email format'),
      password: yup
        .string()
        .required('Password is required')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.{8,})/,
          'Use uppercase, lowercase, and numbers'
        ),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Password confirmation is required'),
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
          <label>
            <p className='username'>Username</p>
            <input 
              onChange={handleFormChange} 
              type='text'
              name="username"
              placeholder='Enter your username'
              value={formik.values.username}
              onBlur={formik.handleBlur}
              required
            />
            {formik.touched.username && formik.errors.username ? (
              <div className="error-message">{formik.errors.username}</div>
            ) : null}
          </label>
      
          <label>
            <p className='username'>Email Address</p>
            <input
              onChange={handleFormChange}
              type="text"
              name="email"
              placeholder='Enter Email Address'
              value={formik.values.email}
              onBlur={formik.handleBlur}
              required
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="error-message">{formik.errors.email}</div>
            ) : null}
          </label>
          
          <label>
            <p className='username'>Password</p>
            <input
              onChange={handleFormChange}
              type="password"
              name="password"
              placeholder='Enter Password'
              value={formik.values.password}
              onBlur={formik.handleBlur}
              required
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="error-message">{formik.errors.password}</div>
            ) : null}
          </label>

          <label>
            <p className='username'>Confirm Password</p>
            <input
              onChange={handleFormChange}
              type="password"
              name="confirmPassword"
              placeholder='Confirm Password'
              value={formik.values.confirmPassword}
              onBlur={formik.handleBlur}
              required
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <div className="error-message">{formik.errors.confirmPassword}</div>
            ) : null}
          </label>

          <div className='daftar-bawah'>
            <a href="/Coba">Already Registered?</a>
            <button className='tombol-daftar' type="submit">Register</button>
          </div>
        </form>
      </div>
      <div className="additional-links-register">
        <a href="/Lupa">Forgot your password?</a>
      </div>
    </section>
  );
}

export default Register;
