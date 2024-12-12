import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, FileText, Clock9, AlertCircle } from 'lucide-react';
import Diagram from './Diagram';
import { database } from '../config/firebase';
import { ref, onValue } from 'firebase/database';
import ListingDistributionCharts from './DiagramBatang';

const DashboardContent = () => {
  const [selectedDataType, setSelectedDataType] = useState('monthly');
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    publicListings: 0,
    pendingListings: 0
  });

  // Fetch data from Realtime Database
  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        // Create refs for both paths
        const listingsRef = ref(database, 'listings');
        const usersRef = ref(database, 'users');

        // Set up listeners for real-time updates
        const listingsUnsubscribe = onValue(listingsRef, (snapshot) => {
          if (snapshot.exists()) {
            const listingsData = Object.entries(snapshot.val()).map(([id, data]) => ({
              id,
              ...data
            }));
            setListings(listingsData);
            updateStats(listingsData);
          } else {
            setListings([]);
            updateStats([]);
          }
        }, (error) => {
          setError('Error fetching listings: ' + error.message);
        });

        const usersUnsubscribe = onValue(usersRef, (snapshot) => {
          if (snapshot.exists()) {
            setStats(prevStats => ({
              ...prevStats,
              totalUsers: Object.keys(snapshot.val()).length
            }));
          }
        }, (error) => {
          setError('Error fetching users: ' + error.message);
        });

        setLoading(false);

        // Cleanup function
        return () => {
          listingsUnsubscribe();
          usersUnsubscribe();
        };
      } catch (error) {
        setError('Error initializing database connection: ' + error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateStats = (listingsData) => {
    const newStats = listingsData.reduce((acc, listing) => ({
      ...acc,
      totalListings: acc.totalListings + 1,
      publicListings: listing.status === 'approved' ? acc.publicListings + 1 : acc.publicListings,
      pendingListings: listing.status === 'pending' ? acc.pendingListings + 1 : acc.pendingListings
    }), {
      totalUsers: stats.totalUsers,
      totalListings: 0,
      publicListings: 0,
      pendingListings: 0
    });
    
    setStats(newStats);
  };

  const statsData = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers.toString(), 
      color: 'bg-blue-500', 
      icon: <Users className="text-white" size={24} /> 
    },
    { 
      title: 'Approved Listings', 
      value: stats.publicListings.toString(),  
      color: 'bg-green-500', 
      icon: <CheckCircle className="text-white" size={24} /> 
    },
    { 
      title: 'Total Listings', 
      value: stats.totalListings.toString(),
      color: 'bg-yellow-500', 
      icon: <FileText className="text-white" size={24} /> 
    },
    { 
      title: 'Pending Approval', 
      value: stats.pendingListings.toString(),
      color: 'bg-red-500', 
      icon: <Clock9 className="text-white" size={24} /> 
    },
  ];

  const getChartTitle = () => {
    switch(selectedDataType) {
      case 'monthly':
        return 'Listings per Month';
      case 'weekly':
        return 'Listings per Week';
      case 'daily':
        return 'Listings per Day (Last 30 Days)';
      default:
        return 'Listings';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}

      {/* Updated grid layout for mobile */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {statsData.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white rounded-lg shadow-md p-4 md:p-6 transition-transform hover:scale-105"
          >
            <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.color} rounded-full mb-3 md:mb-4 flex items-center justify-center`}>
              {stat.icon}
            </div>
            <h3 className="text-gray-500 text-xs md:text-sm font-medium" style={{fontFamily:'Quicksand'}}>{stat.title}</h3>
            <p className="text-lg md:text-2xl font-bold text-gray-800" style={{fontFamily:'Quicksand'}}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label htmlFor="dataType" className="text-gray-600 font-bold text-sm md:text-base" style={{fontFamily:'Quicksand'}}>
            Select Chart Type
          </label>
          <select 
            id="dataType" 
            value={selectedDataType} 
            onChange={(e) => setSelectedDataType(e.target.value)} 
            className="p-2 border rounded-md bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base" 
            style={{fontFamily:'Quicksand'}}
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="daily">Daily (Last 30 Days)</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <h2 className="mb-4 md:mb-6 text-lg md:text-xl font-bold text-gray-800" style={{fontFamily:'Quicksand'}}>
            {getChartTitle()}
          </h2>
          <Diagram 
            listings={listings}
            dataType={selectedDataType}
          />
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            
        <ListingDistributionCharts listings={listings} />

        </div>
      </div>
    </div>
  );
};

export default DashboardContent;