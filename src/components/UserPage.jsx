import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Search, Activity,Radio
} from 'lucide-react';
import { 
  ref, 
  onValue, 
  off, 
  update, 
  serverTimestamp, 
  onDisconnect 
} from 'firebase/database';
import { database } from '../config/firebase';
import { useAuth } from '../config/Auth';

const UsersContent = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // Get current user from auth context
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    new: 0,
    verified: 0,
    online: 0
  });

  
  // Tambahkan fungsi formatLastActive yang hilang
  const formatLastActive = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Function to check if user is offline based on last seen timestamp
  const isUserOffline = (lastSeen) => {
    if (!lastSeen) return true;
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    return lastSeen < fiveMinutesAgo;
  };

  // Setup user's online status when component mounts
  useEffect(() => {
    if (!currentUser?.uid) return;

    const userStatusRef = ref(database, `status/${currentUser.uid}`);
    const userRef = ref(database, `users/${currentUser.uid}`);

    // Set user as online
    const setupOnlineStatus = async () => {
      await update(userStatusRef, {
        state: 'online',
        lastSeen: serverTimestamp(),
        lastLogin: serverTimestamp() // Tambahkan lastLogin
      });

      // Setup offline status for when user disconnects
      onDisconnect(userStatusRef).update({
        state: 'offline',
        lastSeen: serverTimestamp()
      });
    };

    setupOnlineStatus();

    // Cleanup function
    return () => {
      // Update status to offline when component unmounts
      update(userStatusRef, {
        state: 'offline',
        lastSeen: serverTimestamp()
      });
    };
  }, [currentUser]);

  useEffect(() => {
    const usersRef = ref(database, 'users');
    const listingsRef = ref(database, 'listings');
    const statusRef = ref(database, 'status');
  
    const fetchData = async () => {
      onValue(statusRef, (statusSnapshot) => {
        const statusData = statusSnapshot.val() || {};
        
        onValue(listingsRef, (listingSnapshot) => {
          const listingsData = listingSnapshot.val() || {};
          
          onValue(usersRef, (userSnapshot) => {
            const userData = userSnapshot.val();
            if (userData) {
              const usersList = Object.entries(userData).map(([uid, userData]) => {
                // Get user's online status
                const userStatus = statusData[uid] || {};
                const isOnline = userStatus.state === 'online' && !isUserOffline(userStatus.lastSeen);
                
                // Count listings for this user
                const userListings = Object.values(listingsData).filter(
                  listing => listing.userId === uid
                );
                
                return {
                  ...userData,
                  uid,
                  status: userData.status || 'active',
                  isOnline,
                  lastActive: isOnline ? 'Online now' : formatLastActive(userStatus.lastSeen),
                  lastLoginTime: userStatus.lastLogin,
                  totalListings: userListings.length
                };
              })
              .filter(user => user.email)
              .sort((a, b) => {
                // Sort by online status first, then by last active time
                if (a.isOnline && !b.isOnline) return -1;
                if (!a.isOnline && b.isOnline) return 1;
                const timeA = a.lastLoginTime || 0;
                const timeB = b.lastLoginTime || 0;
                return timeB - timeA;
              });
              
              setUsers(usersList);
              setFilteredUsers(usersList);

              // Calculate statistics including online users
              const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
              setUserStats({
                total: usersList.length,
                active: usersList.filter(u => u.status === 'active').length,
                new: usersList.filter(u => u.timestamp > oneWeekAgo).length,
                verified: usersList.filter(u => u.isVerified).length,
                online: usersList.filter(u => u.isOnline).length
              });
            }
          });
        });
      });
    };

    fetchData();
    
    return () => {
      off(usersRef);
      off(listingsRef);
      off(statusRef);
    };
  }, []);


  // Handler untuk mengupdate status dan timestamp
  const handleStatusUpdate = (userId, currentStatus) => {
    update(ref(database, `users/${userId}`), {
      status: currentStatus === 'active' ? 'inactive' : 'active',
      lastActive: serverTimestamp()
    });
    
  };

  useEffect(() => {
    const filtered = users.filter(user => {
      const matchesSearch = 
        (user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (selectedFilter === 'all') return matchesSearch;
      if (selectedFilter === 'active') return matchesSearch && user.status === 'active';
      if (selectedFilter === 'inactive') return matchesSearch && user.status === 'inactive';
      if (selectedFilter === 'online') return matchesSearch && user.isOnline; // Tambahan filter untuk user online
      if (selectedFilter === 'new') {
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return matchesSearch && user.timestamp > oneWeekAgo;
      }
      return matchesSearch;
    });
    setFilteredUsers(filtered);
  }, [searchTerm, selectedFilter, users]);

  const handleUserClick = (userId) => {
    navigate(`/Stalking/${userId}`);
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h4 className="text-2xl font-bold mt-1">{value}</h4>
        </div>
        <div className={`p-3 rounded-full ${color.replace('border', 'bg')} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('border', 'text')}`} />
        </div>
      </div>        
    </div>
  );

 
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6" style={{marginTop:'30px'}}>
        <StatCard
          title="Total Users"
          value={userStats.total}
          icon={Users}
          color="border-blue-500"
        />
        <StatCard
          title="Active Users"
          value={userStats.active}
          icon={Activity}
          color="border-green-500"
        />
        <StatCard
          title="Online Now"
          value={userStats.online}
          icon={Radio}
          color="border-emerald-500"
        />
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="online">Online Now</option>
              <option value="new">New Users</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                  Total Listings
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr 
                  key={user.uid}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 relative" onClick={() => handleUserClick(user.uid)}
                           style={{cursor:"pointer"}}>
                        {user.profilePhoto ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.profilePhoto}
                            alt=""
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-500" />
                          </div>
                        )}
                        {/* Online status indicator */}
                        <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                          user.isOnline ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName && user.lastName 
                            ? `${user.firstName} ${user.lastName}`
                            : user.username || 'Unknown User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center w-40">
                    <div className="flex justify-center items-center">
                      {user.totalListings || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center w-40">
                    <div className="flex justify-center items-center">
                      {user.lastActive}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleStatusUpdate(user.uid, user.status)}
                        className={`text-white px-3 py-1 rounded-lg ${
                          user.status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {user.status === 'active' ? 'Inactive' : 'Active'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersContent;