import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faTimes, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

const Foto = ({ photo, username, onPhotoChange }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handlePhotoChange = (e) => {
    if (e.target.files[0]) {
      onPhotoChange(e.target.files[0]);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 bg-gray-200 rounded-full overflow-hidden">
          {photo ? (
            <img src={photo} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-4xl font-bold">
              {username ? username[0].toUpperCase() : 'A'}
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-pink-500 opacity-20 rounded-full"></div>
        <input
          type="file"
          id="photo-upload"
          accept="image/*"
          onChange={handlePhotoChange}
          className="hidden"
        />
        <label
          htmlFor="photo-upload"
          className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer"
        >
          <FontAwesomeIcon icon={faCamera} className="text-gray-600" />
        </label>
      </div>
      <div>
        {isEditing ? (
          <div className="flex space-x-2">
            <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm">
              <FontAwesomeIcon icon={faTimes} className="mr-1" /> Preview
            </button>
            <label htmlFor="photo-upload" className="px-3 py-1 bg-pink-500 text-white rounded-md text-sm cursor-pointer">
              <FontAwesomeIcon icon={faPencilAlt} className="mr-1" /> Edit photo
            </label>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="px-3 py-1 bg-pink-500 text-white rounded-md text-sm">
            Update photo
          </button>
        )}
      </div>
    </div>
  );
};

export default Foto;