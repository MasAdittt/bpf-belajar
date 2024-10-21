import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../style/Security.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShield } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../config/Auth';
import {getAuth,sendPasswordResetEmail,deleteUser,reauthenticateWithCredential,EmailAuthProvider,} from 'firebase/auth';
import {getDatabase,ref,query,orderByChild,equalTo,get,remove,set,} from 'firebase/database';
import { ToastContainer, toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';

function Security() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    const fetchLastPasswordChangeTime = async () => {
      if (user && user.uid) {
        try {
          const db = getDatabase();
          const userRef = ref(db, `users/${user.uid}/lastPasswordChangeTime`);
          const snapshot = await get(userRef);

          if (snapshot.exists()) {
            const lastChangeTime = snapshot.val();
            console.log('Last password change time (raw):', lastChangeTime); // Log untuk debugging

            // Memastikan lastChangeTime adalah timestamp dalam milidetik
            const lastChangeDate = new Date(lastChangeTime);
            if (isNaN(lastChangeDate.getTime())) {
              console.error('Invalid date format for lastPasswordChangeTime:', lastChangeTime);
              setLastUpdated('Invalid date format');
              return;
            }

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
            console.log('No data found for lastPasswordChangeTime'); // Log untuk debugging
            setLastUpdated('No information available');
          }
        } catch (error) {
          console.error('Error fetching lastPasswordChangeTime:', error);
          setLastUpdated('Error fetching data');
        }
      }
    };

    fetchLastPasswordChangeTime();
  }, [user]);

  const handleNavigateToProfile = () => {
    if (user && user.uid) {
      navigate(`/Profil/${user.uid}`);
    } else {
      navigate('/');
    }
  };

  const handleResetPassword = async () => {
    if (user && user.email) {
      try {
        await sendPasswordResetEmail(getAuth(), user.email);
        toast.success('Password reset email sent. Please check your inbox.', {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        // Simpan waktu saat password direset (menggunakan Unix timestamp dalam milidetik)
        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}/lastPasswordChangeTime`);
        const currentTime = Date.now(); // Mendapatkan waktu saat ini dalam milidetik
        await set(userRef, currentTime);
        console.log('Last password change time set to:', currentTime); // Log untuk debugging

        // Memperbarui state lastUpdated secara langsung tanpa harus menunggu useEffect
        const lastChangeDate = new Date(currentTime);
        const formattedDate = lastChangeDate.toLocaleString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Jakarta',
        });
        setLastUpdated(`${formattedDate} WIB`);
      } catch (error) {
        console.error('Error sending password reset email:', error);
        toast.error('Failed to send password reset email. Please try again.', {
          position: 'top-center',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } else {
      toast.warning("No user email found. Please ensure you're logged in.", {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleDeactivateAccount = async (user) => {
    if (user && user.uid) {
      try {
        const result = await Swal.fire({
          title: 'Deactivate Account',
          input: 'password',
          inputLabel: 'Enter your password to confirm',
          inputPlaceholder: 'Enter your password',
          showCancelButton: true,
          confirmButtonText: 'Deactivate',
          cancelButtonText: 'Cancel',
          inputValidator: (value) => {
            if (!value) {
              return 'You need to enter your password!';
            }
          }
        });
  

        const auth = getAuth();
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(auth.currentUser, credential);

        const db = getDatabase();

        // Query untuk mencari semua listing berdasarkan email pengguna (userEmail)
        const listingsRef = ref(db, 'listings');
        const listingsQuery = query(listingsRef, orderByChild('userEmail'), equalTo(user.email));//ganti jadi userEmail 

        const snapshot = await get(listingsQuery);

        // Jika snapshot berisi data
        if (snapshot.exists()) {
          const deletePromises = [];

          // Looping melalui setiap listing yang ditemukan dan tambahkan penghapusan ke dalam array Promise
          snapshot.forEach((childSnapshot) => {
            console.log(`Menghapus listing dengan key: ${childSnapshot.key}`);
            deletePromises.push(remove(ref(db, `listings/${childSnapshot.key}`)));
          });

          // Tunggu sampai semua proses penghapusan selesai
          await Promise.all(deletePromises);
        } else {
          console.log('Tidak ada listing yang ditemukan untuk pengguna ini.');
        }

        // Hapus data pengguna dari tabel users
        const userRef = ref(db, `users/${user.uid}`);
        await remove(userRef);

        // Hapus akun pengguna dari Authentication
        await deleteUser(auth.currentUser);

        toast.success('Akun dan semua data terkait berhasil dihapus!', {
          position: 'top-center',
          autoClose: 5000,
        });

        navigate('/');
      } catch (error) {
        console.error('Error saat menonaktifkan akun:', error);

        if (error.code === 'auth/wrong-password') {
          toast.error('Password salah. Silakan coba lagi.', {
            position: 'top-center',
            autoClose: 5000,
          });
        } else {
          toast.error('Gagal menonaktifkan akun. Silakan coba lagi.', {
            position: 'top-center',
            autoClose: 5000,
          });
        }
      }
    } else {
      toast.warning('Pengguna tidak ditemukan. Pastikan Anda sudah login.', {
        position: 'top-center',
        autoClose: 5000,
      });
    }
  };

  return (
    <>
      <Navbar />
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="security-container">
        <div className="breadcrumb">
          <span onClick={handleNavigateToProfile} style={{ cursor: 'pointer', color: '#007bff' }}>
            Account
          </span>{' '}
          &gt; Login & security
        </div>

        <h1 className="security-title">Login & security</h1>

        <div className="security-content">
          <div className="security-main">
            <div className="security-tabs">
              <button className="tab active">LOGIN</button>
            </div>

            <div className="security-section">
              <h2>Login</h2>

              <div className="security-item">
                <div>
                  <h3>Password</h3>
                  <p>Last updated: {lastUpdated ? lastUpdated : 'No information available'}</p>
                </div>
                <button className="update-btn" onClick={handleResetPassword}>
                  Change Password
                </button>
              </div>

              <div className="security-item">
                <div>
                  <h3>Deactivate Account</h3>
                  <p>Deactivate Your Account</p>
                </div>
                <button
                  className="disconnect-btn"
                  onClick={() => handleDeactivateAccount(user)}
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>

          <div className="security-info">
            <FontAwesomeIcon icon={faShield} size="2x" />
            <h3>Keeping your account secure</h3>
            <p>
              We regularly review accounts to make sure they're as secure as possible. We'll also let
              you know if there's more we can do to increase the security of your account.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Security;
