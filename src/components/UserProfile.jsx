import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUser } from '@fortawesome/free-solid-svg-icons';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('Edit Profile');
  const [firstName, setFirstName] = useState('Arista');
  const [lastName, setLastName] = useState('Narendra');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('email@gmail.com');
  const [phoneNumber, setPhoneNumber] = useState('081999999');
  const [coverPhoto, setCoverPhoto] = useState(null);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleSave = () => {
    // Implement save functionality
    console.log('Profile saved');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <img src="/path-to-logo.png" alt="TailPet Friend Logo" className="h-8 mr-2" />
          <h1 className="text-xl font-bold">TailPet Friend</h1>
        </div>
        <div className="flex items-center">
          <div className="relative mr-4">
            <input
              type="text"
              placeholder="Search"
              className="pl-8 pr-2 py-1 border rounded-full"
            />
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button className="bg-teal-500 text-white px-4 py-2 rounded-full mr-4">
            Add Listing
          </button>
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faUser} className="text-gray-600" />
          </div>
        </div>
      </header>

      {/* Cover Photo */}
      <div className="relative h-48 bg-gray-300">
        {coverPhoto && (
          <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
        )}
        <div className="absolute bottom-4 left-4 flex items-center">
          <div className="w-20 h-20 bg-gray-400 rounded-full mr-4"></div>
          <div>
            <h2 className="text-2xl font-bold text-white">{`${firstName} ${lastName}`}</h2>
            <p className="text-white">@aristanarendra</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow">
        <ul className="flex">
          {['My Profile', 'Edit Profile', 'Security', 'Payments', 'My Listings'].map((tab) => (
            <li key={tab}>
              <button
                className={`px-4 py-2 ${activeTab === tab ? 'border-b-2 border-teal-500' : ''}`}
                onClick={() => handleTabClick(tab)}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Edit Profile Form */}
      {activeTab === 'Edit Profile' && (
        <div className="max-w-3xl mx-auto mt-8 bg-white p-8 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">First name *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Last name *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1">City *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <h3 className="text-xl font-bold mt-8 mb-4">Edit Contact</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-1">Phone number *</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <h3 className="text-xl font-bold mt-8 mb-4">Upload Cover Photo</h3>
          <div className="border-2 border-dashed border-gray-300 p-4 text-center">
            <p>Click to upload or drag and drop</p>
            <p className="text-sm text-gray-500">SVG, PNG, JPG or GIF (max. 3MB)</p>
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="cover-photo-upload"
            />
            <label
              htmlFor="cover-photo-upload"
              className="mt-2 inline-block bg-teal-500 text-white px-4 py-2 rounded cursor-pointer"
            >
              Select File
            </label>
          </div>

          <div className="mt-8 flex justify-end">
            <button className="bg-white text-teal-500 border border-teal-500 px-4 py-2 rounded-full mr-4">
              Cancel
            </button>
            <button
              className="bg-teal-500 text-white px-4 py-2 rounded-full"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">HAVE A PET FRIENDLY PLACE?</h2>
              <p>Join the community of hundreds of pet-friendly business in Bali</p>
            </div>
            <button className="bg-teal-500 text-white px-6 py-3 rounded-full">
              List Your Business
            </button>
          </div>
          <div className="mt-8 flex justify-between">
            <p>&copy; 2024 TailpetFriendly</p>
            <div>
              <a href="#" className="mr-4">FAQ</a>
              <a href="#">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserProfile;