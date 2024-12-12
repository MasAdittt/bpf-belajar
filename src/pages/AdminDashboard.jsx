import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ref, onValue, off, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../config/firebase';
import Sidebar from '../components/sidebar';
import Header from '../components/Header';
import DashboardContent from '../components/Dashboard';
import UsersContent from '../components/UserPage';
import ProductListings from '../components/Product';
import Calendar from '../components/calendar';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalListings, setTotalListings] = useState(0);
  const [publicListings, setPublicListings] = useState(0);
  const [pendingListings, setPendingListings] = useState(0);

  useEffect(() => {
    const usersRef = ref(database, 'users');
    const listingsRef = ref(database, 'listings');
    const pendingQuery = query(ref(database, 'listings'), orderByChild('status'), equalTo('pending'));

    const usersListener = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersList = Object.values(data);
        setTotalUsers(usersList.length);
      } else {
        setTotalUsers(0);
      }
    });

    const listingsListener = onValue(listingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const listingsArray = Object.values(data);
        setTotalListings(listingsArray.length);
        const publicListingsCount = listingsArray.filter(listing => listing.isPublic).length;
        setPublicListings(publicListingsCount);
      } else {
        setTotalListings(0);
        setPublicListings(0);
      }
    });

    const pendingListener = onValue(pendingQuery, (snapshot) => {
      const pendingCount = snapshot.size || 0;
      setPendingListings(pendingCount);
    });

    return () => {
      off(usersRef);
      off(listingsRef);
      off(pendingQuery);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of the dashboard.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!',
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/');
      }
    });
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'users':
        return <UsersContent />;
      case 'dashboard':
        return (
          <DashboardContent
            totalUsers={totalUsers}
            totalListings={totalListings}
            publicListings={publicListings}
            pendingListings={pendingListings}
          />
        );
      case 'products':
        return <ProductListings />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        handleLogout={handleLogout}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />
      
      <Header 
        isOpen={isSidebarOpen} 
        activeMenu={activeMenu}
        toggleSidebar={toggleSidebar}
      />

<main 
  className={`transition-all duration-300 p-4 sm:p-6
    ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}
    ${isSidebarOpen ? 'ml-0' : 'ml-0'}
    mt-14 sm:mt-16 md:mt-[60px]`}  // Responsive pada berbagai breakpoint
>
  {renderContent()}
</main>
    </div>
  );
};

export default AdminDashboard;