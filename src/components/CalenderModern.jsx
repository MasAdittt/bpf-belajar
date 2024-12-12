import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const ModernCalendar = ({ value, onChange }) => {
  const [currentDate, setCurrentDate] = useState(value?.start || new Date());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = () => {
    return new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();
  };

  const getFirstDayOfMonth = () => {
    return new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    ).getDay();
  };

  const generateDays = () => {
    const daysInMonth = getDaysInMonth();
    const firstDay = getFirstDayOfMonth();
    const days = [];

    // Previous month days
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    const prevMonthDays = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(prevMonth.getFullYear(), prevMonth.getMonth(), prevMonthDays - i)
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 rows × 7 days = 42
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i)
      });
    }

    return days;
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleDragStart = (date) => {
    setIsDragging(true);
    setDragStart(date);
    setDragEnd(date);
  };

  const handleDragEnter = (date) => {
    if (isDragging) {
      setDragEnd(date);
    }
    setHoveredDay(date);
  };

  const handleDragEnd = () => {
    if (isDragging && dragStart && dragEnd) {
      const start = new Date(Math.min(dragStart, dragEnd));
      const end = new Date(Math.max(dragStart, dragEnd));
      onChange?.({ start, end });
    }
    setIsDragging(false);
    setHoveredDay(null);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging, dragStart, dragEnd]);

  const isInRange = (date) => {
    if (!dragStart || !dragEnd) return false;
    const start = Math.min(dragStart.getTime(), dragEnd.getTime());
    const end = Math.max(dragStart.getTime(), dragEnd.getTime());
    return date.getTime() >= start && date.getTime() <= end;
  };

  const isSelectedDate = (date) => {
    if (!value) return false;
    if (value.start && value.end) {
      return date.getTime() >= value.start.getTime() && date.getTime() <= value.end.getTime();
    }
    return false;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + direction,
      1
    ));
  };

  return (
    <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-800">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {days.map(day => (
          <div 
            key={day} 
            className="text-xs font-medium text-gray-400 p-2 text-center"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {generateDays().map((day, index) => (
          <div
            key={index}
            onMouseDown={() => handleDragStart(day.date)}
            onMouseEnter={() => handleDragEnter(day.date)}
            onMouseUp={handleDragEnd}
            className={`
              p-2 text-sm rounded-lg text-center cursor-pointer transition-all
              ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
              ${(isDragging && isInRange(day.date)) || isSelectedDate(day.date) ? 
                'bg-blue-500 text-white hover:bg-blue-600' : 
                'hover:bg-gray-100'
              }
              ${isToday(day.date) && !isInRange(day.date) && !isSelectedDate(day.date) ? 
                'ring-1 ring-blue-500' : ''
              }
              ${hoveredDay?.toDateString() === day.date.toDateString() && 
                !isInRange(day.date) && 
                !isSelectedDate(day.date) ? 
                'bg-gray-100' : ''
              }
              ${isDragging ? 'select-none' : ''}
            `}
          >
            {day.day}
          </div>
        ))}
      </div>

      {/* Selected Range Display */}
      {value?.start && value?.end && (
        <div className="mt-4 text-sm text-gray-600 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          Selected: {value.start.toLocaleDateString()} - {value.end.toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default ModernCalendar;