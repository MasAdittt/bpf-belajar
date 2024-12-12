import React, { useRef, useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { storage, database } from '../config/firebase';
import { ref as databaseRef, onValue } from 'firebase/database';
import { ref as storageRef, deleteObject, uploadBytes, getDownloadURL } from 'firebase/storage';

const Editimage = forwardRef(({ listingUid, onFileSelect, existingImages = [] }, ref) => {
  const [images, setImages] = useState(Array(5).fill(null));
  const [imageFiles, setImageFiles] = useState(Array(5).fill(null));
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [originalImages, setOriginalImages] = useState([]);
  const fileInputRefs = useRef(Array(5).fill(null).map(() => React.createRef()));

  useEffect(() => {
    // Referensi ke listing spesifik di database
    const listingRef = databaseRef(database, `listings/${listingUid}`);

    // Listener untuk perubahan data
    const unsubscribe = onValue(listingRef, (snapshot) => {
      const listingData = snapshot.val();
      
      if (listingData && listingData.imageUrls) {
        // Proses gambar yang sudah ada dari database
        const dbImageUrls = listingData.imageUrls;
        const initialImages = [...dbImageUrls, ...Array(5 - dbImageUrls.length).fill(null)];
        
        setImages(initialImages);
        setExistingImageUrls(dbImageUrls);
        setOriginalImages(dbImageUrls);
      }
    }, (error) => {
      console.error("Error fetching listing images:", error);
    });

    // Cleanup listener saat komponen unmount
    return () => unsubscribe();
  }, [listingUid]);
  // Gunakan useImperativeHandle untuk membuat method reset
  useImperativeHandle(ref, () => ({
    resetImages: () => {
      // Reset to original images from database
      const resetImages = [...originalImages, ...Array(5 - originalImages.length).fill(null)];
      setImages(resetImages);
      setImageFiles(Array(5).fill(null));
      setExistingImageUrls(originalImages);
      
      // Reset file inputs
      fileInputRefs.current.forEach(inputRef => {
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      });
  
      // Notify parent component about reset
      if (onFileSelect) {
        onFileSelect({
          file: null,
          preview: null,
          index: null,
          isReset: true
        });
      }
    },
    uploadImages: async () => {
      const uploadPromises = imageFiles.map(async (file, index) => {
        if (file) {
          const imageStorageRef = storageRef(storage, `listings/${listingUid}/images/${Date.now()}_${file.name}`);
          try {
            const snapshot = await uploadBytes(imageStorageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
          } catch (error) {
            console.error(`Error uploading image ${index}:`, error);
            return null;
          }
        }
        // Return existing image URL if no new file is uploaded for this slot
        return images[index];
      });
    
      const results = await Promise.all(uploadPromises);
      return results.filter(url => url !== null); // Filter out null values
    }
  }));

  const handleBoxClick = (index) => {
    fileInputRefs.current[index].current.click();
  };

  const handleFileChange = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      // Store the actual file
      const newImageFiles = [...imageFiles];
      newImageFiles[index] = file;
      setImageFiles(newImageFiles);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImages = [...images];
        newImages[index] = e.target.result;
        setImages(newImages);
      };
      reader.readAsDataURL(file);

      // Pass the file to parent component
      if (onFileSelect) {
        onFileSelect({
          file,
          preview: URL.createObjectURL(file),
          index
        });
      }
    }
  };

  const handleRemoveImage = async (index) => {
    const newImages = [...images];
    const newImageFiles = [...imageFiles];
    const newExistingImageUrls = [...existingImageUrls];
  
    // If dealing with an existing image in Firebase
    if (existingImageUrls[index]) {
      try {
        // Convert full URL to storage path
        const fullUrl = existingImageUrls[index];
        // Extract the path after '/o/' and before '?'
        const urlPath = fullUrl.split('/o/')[1]?.split('?')[0];
        
        if (!urlPath) {
          console.error('Invalid storage URL format');
          return;
        }
        
        // Decode the URL-encoded path
        const storagePath = decodeURIComponent(urlPath);
        const imageRef = storageRef(storage, storagePath);
        
        try {
          await deleteObject(imageRef);
          console.log('Image deleted successfully from path:', storagePath);
        } catch (error) {
          if (error.code === 'storage/object-not-found') {
            console.log('Image already deleted or does not exist');
          } else {
            console.error('Error deleting image:', error);
            return;
          }
        }
        
        // Update the existing URLs array
        newExistingImageUrls.splice(index, 1);
        setExistingImageUrls(newExistingImageUrls);
      } catch (error) {
        console.error('Error in image deletion process:', error);
        return;
      }
    }
  
    // Update UI state
    newImages[index] = null;
    newImageFiles[index] = null;
    
    setImages(newImages);
    setImageFiles(newImageFiles);
  
    // Reset file input
    if (fileInputRefs.current[index]?.current) {
      fileInputRefs.current[index].current.value = '';
    }
  
    // Notify parent component
    if (onFileSelect) {
      onFileSelect({
        file: null,
        preview: null,
        index
      });
    }
  };
  const uploadedImagesCount = images.filter(img => img !== null).length;

  return (
    <div className="w-full">
      <p className="font-lexend text-sm text-gray-500 mb-3">
        Upload Places Photo* (Max 5 images)
      </p>
      <div className="grid grid-cols-5 gap-4 w-full">
        {images.map((image, i) => (
          <div
            key={i}
            onClick={() => !image && handleBoxClick(i)}
            className="relative aspect-square group"
          >
            <div className={`
              w-full h-full rounded-lg border border-gray-200
              flex flex-col items-center justify-center
              overflow-hidden transition-all duration-200
              ${!image && 'hover:bg-gray-50 cursor-pointer'}
            `}>
              {image ? (
                <>
                  <img
                    src={image}
                    alt={`Upload ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay saat hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(i);
                      }}
                      className="p-2 bg-red-500 rounded-full hover:bg-red-600 transform hover:scale-110 transition-all duration-200"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <ImagePlus className="w-6 h-6 text-gray-400 opacity-40" />
                  <p className="text-xs text-gray-400 text-center mt-2">
                    Add images {uploadedImagesCount}/5
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRefs.current[i]}
              onChange={(e) => handleFileChange(e, i)}
              accept="image/*"
              className="hidden"
            />
          </div>
        ))}
      </div>
    </div>
  );
});

Editimage.displayName = 'Editimage';
export default Editimage;