import React from 'react';
import { AlertCircle, Clock, Check, X } from 'lucide-react';

const EditHistoryComponent = ({ editHistory, listing }) => {
  if (!editHistory || editHistory.length === 0) {
    return null;
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'approved':
        return <Check className="w-5 h-5" />;
      case 'rejected':
        return <X className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const formatChanges = (changes) => {
    return Object.entries(changes).map(([key, value]) => {
      // Handle nested objects like businessHours
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return Object.entries(value).map(([subKey, subValue]) => (
          <div key={`${key}-${subKey}`} className="ml-4">
            <span className="font-semibold">{subKey}: </span>
            {String(subValue)}
          </div>
        ));
      }
      
      // Skip arrays (like imageUrls) as they're too verbose
      if (Array.isArray(value)) {
        return (
          <div key={key} className="ml-4">
            <span className="font-semibold">{key}: </span>
            [Updated]
          </div>
        );
      }

      return (
        <div key={key} className="ml-4">
          <span className="font-semibold">{key}: </span>
          {String(value)}
        </div>
      );
    });
  };

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Edit History</h2>
      {editHistory.map((edit, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getStatusIcon(edit.status)}
              <span className={`font-medium ${getStatusColor(edit.status)}`}>
                {edit.status.charAt(0).toUpperCase() + edit.status.slice(1)}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {formatTimestamp(edit.timestamp)}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600">
              Editor: {edit.userEmail}
            </div>
            <div className="mt-4">
              <div className="font-medium text-gray-900">Changes:</div>
              {formatChanges(edit.changes)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EditHistoryComponent;