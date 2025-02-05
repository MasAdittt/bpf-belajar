import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ResponsivePagination = ({ currentPage, totalPages, onPageChange }) => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 640);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;

    const buttons = [];
    const showEllipsis = totalPages > 5;

    const buttonClass = (isActive) => `
      ${isMobile ? 'w-[32px] h-[32px]' : 'w-[40px] h-[33px]'}
      rounded-md 
      transition-colors 
      duration-200 
      font-['Quicksand'] 
      ${isMobile ? 'text-[12px]' : 'text-[14px]'}
      flex 
      items-center 
      justify-center
      ${isActive 
        ? 'bg-[#1DA19E] text-white border-0' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-[1px] border-[#6B6B6B33]'
      }
    `;

    // Always show first page
    buttons.push(
      <button
        key={1}
        onClick={() => onPageChange(1)}
        className={buttonClass(currentPage === 1)}
        style={{ fontWeight: 600 }}
      >
        1
      </button>
    );

    if (showEllipsis) {
      let leftEllipsis = currentPage > (isMobile ? 3 : 4);
      let rightEllipsis = currentPage < totalPages - (isMobile ? 2 : 3);

      if (leftEllipsis) {
        buttons.push(
          <span key="left-ellipsis" className={`px-${isMobile ? '1' : '2'} text-gray-700`}>
            ...
          </span>
        );
      }

      // Show pages around current page
      let start, end;
      
      if (isMobile) {
        // Mobile: Show 2 buttons in the middle
        if (currentPage <= 3) {
          start = 2;
          end = 3;
        } else if (currentPage >= totalPages - 2) {
          start = totalPages - 2;
          end = totalPages - 1;
        } else {
          start = currentPage;
          end = currentPage + 1;
        }
      } else {
        // Desktop: Keep original logic
        if (currentPage <= 3) {
          start = 2;
          end = 3;
        } else if (currentPage >= totalPages - 2) {
          start = totalPages - 2;
          end = totalPages - 1;
        } else {
          start = currentPage;
          end = currentPage + 1;
        }
      }

      for (let i = start; i <= end; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={buttonClass(currentPage === i)}
            style={{ fontWeight: 600 }}
          >
            {i}
          </button>
        );
      }

      if (rightEllipsis) {
        buttons.push(
          <span key="right-ellipsis" className={`px-${isMobile ? '1' : '2'} text-gray-700`}>
            ...
          </span>
        );
      }
    } else {
      // If few pages, show all
      for (let i = 2; i < totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => onPageChange(i)}
            className={buttonClass(currentPage === i)}
            style={{ fontWeight: 600 }}
          >
            {i}
          </button>
        );
      }
    }

    // Always show last page if more than one page
    if (totalPages > 1) {
      buttons.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className={buttonClass(currentPage === totalPages)}
          style={{ fontWeight: 600 }}
        >
          {totalPages}
        </button>
      );
    }

    return (
      <div className={`flex justify-center items-center flex-wrap ${isMobile ? 'gap-3' : 'gap-3'} mt-8 mb-6`}>
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            ${isMobile ? 'w-[32px] h-[32px]' : 'w-[40px] h-[33px]'}
            rounded-md 
            transition-colors 
            duration-200 
            flex 
            items-center 
            justify-center
            ${currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-[1px] border-[#6B6B6B33]'
            }
          `}
        >
          <ChevronLeft size={isMobile ? 16 : 20} />
        </button>
        
        {buttons}
        
        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            ${isMobile ? 'w-[32px] h-[32px]' : 'w-[40px] h-[33px]'}
            rounded-md 
            transition-colors 
            duration-200 
            flex 
            items-center 
            justify-center
            ${currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-[1px] border-[#6B6B6B33]'
            }
          `}
        >
          <ChevronRight size={isMobile ? 16 : 20} />
        </button>
      </div>
    );
  };

  return renderPaginationButtons();
};

export default ResponsivePagination;