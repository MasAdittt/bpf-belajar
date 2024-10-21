import '../style/Lupa.css';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { firebaseAuthentication } from '../config/firebase';
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

function Lupa() {
  const navigate = useNavigate();

  const resetPassword = async () => {
    try {
      await sendPasswordResetEmail(firebaseAuthentication, formik.values.email);
      alert('Please check Email to reset your password');
      navigate('/Coba');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        formik.setErrors({ email: 'Email Not Found' });
      } else {
        console.error("Reset password error: ", error.message);
        alert('An error occurred. Please try again.');
      }
    }
  };

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    onSubmit: resetPassword,
    validationSchema: yup.object().shape({
      email: yup.string().required('Email Is Required').email('Invalid email format'),
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
            <p className='username'>Email Address</p>
            <input
              onChange={handleFormChange}
              type="text"
              name="email"
              placeholder='Enter your Email'
              value={formik.values.email}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="error-message">{formik.errors.email}</div>
            ) : null}
          </label>
          <button type="submit">Reset Password</button>
        </form>
      </div>
      <div className="additional-links-lupa">
        <a href="/Daftar">Register</a>
        <a href="/Coba">Already Have a Account?</a>
      </div>
    </section>
  );
}

export default Lupa;
