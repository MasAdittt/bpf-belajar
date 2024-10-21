import React from 'react';
import '../style/Loading.css'; // Kita akan buat file CSS ini

const Loading = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
    </div>
  );
};

export default Loading;