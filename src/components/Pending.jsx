import React, { useState, useEffect } from 'react';
import { ref, onValue, update, remove, set } from 'firebase/database';
import { database } from '../config/firebase';
import { AlertCircle, Check, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PendingEditsManagement = () => {
  const [pendingEdits, setPendingEdits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const pendingEditsRef = ref(database, 'pending-edits');
    
    const unsubscribe = onValue(pendingEditsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const editsArray = Object.entries(data).map(([id, edit]) => ({
          id,
          ...edit
        }));
        setPendingEdits(editsArray);
      } else {
        setPendingEdits([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApproveEdit = async (edit) => {
    try {
      // Update the original listing with proposed changes
      const listingRef = ref(database, `listings/${edit.listingId}`);
      await update(listingRef, {
        ...edit.proposedChanges,
        status: 'approved',
        lastModified: Date.now()
      });

      // Remove the pending edit
      const pendingEditRef = ref(database, `pending-edits/${edit.id}`);
      await remove(pendingEditRef);

      // Add to edit history
      const historyRef = ref(database, `edit-history/${edit.listingId}/${edit.id}`);
      await set(historyRef, {
        ...edit,
        approvedAt: Date.now(),
        status: 'approved'
      });
    } catch (error) {
      setError(`Error approving edit: ${error.message}`);
    }
  };

  const handleRejectEdit = async (edit) => {
    try {
      // Remove the pending edit
      const pendingEditRef = ref(database, `pending-edits/${edit.id}`);
      await remove(pendingEditRef);

      // Add to edit history
      const historyRef = ref(database, `edit-history/${edit.listingId}/${edit.id}`);
      await set(historyRef, {
        ...edit,
        rejectedAt: Date.now(),
        status: 'rejected'
      });
    } catch (error) {
      setError(`Error rejecting edit: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold mb-6">Pending Edits</h2>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {pendingEdits.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No pending edits to review
        </div>
      ) : (
        <div className="space-y-6">
          {pendingEdits.map((edit) => (
            <div key={edit.id} className="bg-white rounded-lg shadow-md p-6 border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{edit.proposedChanges.title}</h3>
                  <p className="text-sm text-gray-500">
                    Submitted by: {edit.userEmail} at {new Date(edit.submittedAt).toLocaleString()}
                  </p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  Pending Review
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold mb-2">Original Data</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(edit.originalData).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium">{key}: </span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Proposed Changes</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(edit.proposedChanges).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium">{key}: </span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleApproveEdit(edit)}
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve Changes
                </button>
                <button
                  onClick={() => handleRejectEdit(edit)}
                  className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject Changes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingEditsManagement;