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
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const listingRef = databaseRef(database, `listings/${listingUid}`);
    
    const unsubscribe = onValue(listingRef, (snapshot) => {
      const listingData = snapshot.val();
      
      if (listingData && listingData.imageUrls) {
        const dbImageUrls = listingData.imageUrls;
        const initialImages = [...dbImageUrls, ...Array(5 - dbImageUrls.length).fill(null)];
        
        setImages(initialImages);
        setExistingImageUrls(dbImageUrls);
        setOriginalImages(dbImageUrls);
      }
    });

    return () => unsubscribe();
  }, [listingUid]);

  useImperativeHandle(ref, () => ({
    resetImages: () => {
      const resetImages = [...originalImages, ...Array(5 - originalImages.length).fill(null)];
      setImages(resetImages);
      setImageFiles(Array(5).fill(null));
      setExistingImageUrls(originalImages);
      
      fileInputRefs.current.forEach(inputRef => {
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      });

      if (onFileSelect) {
        onFileSelect({
          files: Array(5).fill(null),
          previews: resetImages,
          isReset: true
        });
      }
    },
    uploadImages: async () => {
      const uploadPromises = images.map(async (image, index) => {
        if (imageFiles[index]) {
          const imageStorageRef = storageRef(storage, `listings/${listingUid}/images/${Date.now()}_${imageFiles[index].name}`);
          try {
            const snapshot = await uploadBytes(imageStorageRef, imageFiles[index]);
            return await getDownloadURL(snapshot.ref);
          } catch (error) {
            console.error(`Error uploading image ${index}:`, error);
            return null;
          }
        }
        return image; // Return existing image URL if no new file
      });
    
      const results = await Promise.all(uploadPromises);
      return results.filter(url => url !== null);
    }
  }));

  const handleBoxClick = (index) => {
    if (!isDeleting) {
      fileInputRefs.current[index].current.click();
    }
  };

  const handleFileChange = (event, index) => {
    const file = event.target.files[0];
    if (file) {
      const newImageFiles = [...imageFiles];
      newImageFiles[index] = file;
      setImageFiles(newImageFiles);

      const reader = new FileReader();
      reader.onload = (e) => {
        const newImages = [...images];
        newImages[index] = e.target.result;
        setImages(newImages);
      };
      reader.readAsDataURL(file);

      if (onFileSelect) {
        onFileSelect({
          files: newImageFiles,
          previews: [...images],
          index,
          file,
          preview: URL.createObjectURL(file)
        });
      }
    }
  };

  const handleRemoveImage = async (event, index) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDeleting(true);
    
    try {
      const newImages = [...images];
      const newImageFiles = [...imageFiles];
      const newExistingImageUrls = [...existingImageUrls];

      if (existingImageUrls[index]) {
        try {
          const fullUrl = existingImageUrls[index];
          const urlPath = fullUrl.split('/o/')[1]?.split('?')[0];
          
          if (urlPath) {
            const storagePath = decodeURIComponent(urlPath);
            const imageRef = storageRef(storage, storagePath);
            
            try {
              await deleteObject(imageRef);
            } catch (error) {
              // Only log the error if it's not a "not found" error
              if (error.code !== 'storage/object-not-found') {
                console.error('Error deleting image:', error);
              }
            }
          }
          
          newExistingImageUrls.splice(index, 1);
          setExistingImageUrls(newExistingImageUrls);
        } catch (error) {
          console.error('Error in image deletion process:', error);
        }
      }

      newImages[index] = null;
      newImageFiles[index] = null;
      
      setImages(newImages);
      setImageFiles(newImageFiles);

      if (fileInputRefs.current[index]?.current) {
        fileInputRefs.current[index].current.value = '';
      }

      if (onFileSelect) {
        onFileSelect({
          files: newImageFiles,
          previews: newImages,
          index,
          isRemoved: true
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const uploadedImagesCount = images.filter(img => img !== null).length;

  return (
    <div className="w-full">
      <p className="font-lexend text-sm text-gray-500 mb-3">
        Upload Places Photo*
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 w-full">
        {images.map((image, i) => (
          <div
            key={i}
            onClick={() => !isDeleting && handleBoxClick(i)}
            className="relative aspect-square group"
          >
            <div className={`
              w-full h-full rounded-lg border border-gray-200
              flex flex-col items-center justify-center
              overflow-hidden transition-all duration-200
              ${!image && !isDeleting && 'hover:bg-gray-50 cursor-pointer'}
            `}>
              {image ? (
                <>
                  <img
                    src={image}
                    alt={`Upload ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <button
                      onClick={(e) => handleRemoveImage(e, i)}
                      disabled={isDeleting}
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