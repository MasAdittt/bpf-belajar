import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';

const ImageUpload = ({ onFileSelect, ref }) => {
  const [images, setImages] = useState(Array(5).fill(null));
  const [imageFiles, setImageFiles] = useState(Array(5).fill(null));
  const fileInputRefs = useRef(Array(5).fill(null).map(() => React.createRef()));

  // Existing useImperativeHandle logic remains the same
  React.useImperativeHandle(ref, () => ({
    resetImages: () => {
      setImages(Array(5).fill(null));
      setImageFiles(Array(5).fill(null));
      
      fileInputRefs.current.forEach(inputRef => {
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      });

      if (onFileSelect) {
        onFileSelect({
          file: null,
          preview: null,
          index: null,
          isReset: true
        });
      }
    }
  }));

  // Existing handler methods remain the same
  const handleBoxClick = (index) => {
    fileInputRefs.current[index].current.click();
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
          file,
          preview: URL.createObjectURL(file),
          index
        });
      }
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    const newImageFiles = [...imageFiles];
    newImages[index] = null;
    newImageFiles[index] = null;
    setImages(newImages);
    setImageFiles(newImageFiles);

    if (fileInputRefs.current[index].current) {
      fileInputRefs.current[index].current.value = '';
    }

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
        Upload Places Photo*
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 w-full">
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
};

export default ImageUpload;