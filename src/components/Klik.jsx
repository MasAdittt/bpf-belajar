import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { X, Calendar } from 'lucide-react';
import { getDatabase, ref, get } from 'firebase/database';
import ModernCalendar from './CalenderModern';

const ClicksChart = ({ listingId, onClose }) => {
  const [clickData, setClickData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalClicks, setTotalClicks] = useState(0);
  const [dailyAverage, setDailyAverage] = useState(0);
  const [dateRange, setDateRange] = useState(null);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const fetchClickData = async () => {
      try {
        const db = getDatabase();
        const clicksRef = ref(db, `listings/${listingId}/clicks`);
        const snapshot = await get(clicksRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const formattedData = [];
          let totalClickCount = 0;
          
          Object.entries(data).forEach(([dateKey, dateData]) => {
            if (dateKey !== 'lastUpdated') {
              const clickCount = dateData.count || 0;
              totalClickCount += clickCount;
              
              formattedData.push({
                date: new Date(dateKey).toLocaleDateString('id-ID', {
                  month: 'short',
                  day: 'numeric'
                }),
                fullDate: dateKey,
                clicks: clickCount,
                timestamp: new Date(dateKey).getTime()
              });
            }
          });

          formattedData.sort((a, b) => a.timestamp - b.timestamp);
          const average = totalClickCount / formattedData.length;

          setClickData(formattedData);
          setFilteredData(formattedData);
          setTotalClicks(totalClickCount);
          setDailyAverage(Math.round(average * 10) / 10);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching click data:', error);
        setLoading(false);
      }
    };

    if (listingId) {
      fetchClickData();
    }
  }, [listingId]);

  useEffect(() => {
    if (dateRange?.start && dateRange?.end) {
      setIsFilterActive(true);
      const filtered = clickData.filter(item => {
        const itemDate = new Date(item.fullDate);
        return itemDate >= dateRange.start && itemDate <= dateRange.end;
      });

      const totalFilteredClicks = filtered.reduce((sum, item) => sum + item.clicks, 0);
      const filteredAverage = filtered.length > 0 ? totalFilteredClicks / filtered.length : 0;

      setFilteredData(filtered);
      setTotalClicks(totalFilteredClicks);
      setDailyAverage(Math.round(filteredAverage * 10) / 10);
    }
  }, [dateRange, clickData]);

  const clearFilters = () => {
    setDateRange(null);
    setIsFilterActive(false);
    setFilteredData(clickData);
    const totalClickCount = clickData.reduce((sum, item) => sum + item.clicks, 0);
    const average = clickData.length > 0 ? totalClickCount / clickData.length : 0;
    setTotalClicks(totalClickCount);
    setDailyAverage(Math.round(average * 10) / 10);
  };

  // Click outside handler for calendar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCalendar && !event.target.closest('.calendar-wrapper')) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCalendar]);

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
          title="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (clickData.length === 0) {
    return (
      <div className="w-full bg-white rounded-lg shadow-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
          title="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No click data available for this listing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6 relative">
     
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold" style={{ fontFamily: 'Quicksand' }}>
            Page Views Analytics
          </h2>
       
          <div className="flex items-center gap-4" >
            <div className="relative calendar-wrapper">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                {dateRange ? 
                  `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}` : 
                  'Select Date Range'
                }
              </button>
           
              {showCalendar && (
                <div className="absolute right-0 top-12 z-50">
                  <ModernCalendar
                    value={dateRange}
                    onChange={(range) => {
                      setDateRange(range);
                      setShowCalendar(false);
                    }}
                  />
                </div>
              )}
            </div>
            {isFilterActive && (
              <button
                onClick={clearFilters}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                title="Clear filters"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
                          <button
        onClick={onClose}
        className=" top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
        title="Close"
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 mb-1">Total Views</p>
            <p className="text-2xl font-bold text-blue-700">{totalClicks.toLocaleString()}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 mb-1">Daily Average</p>
            <p className="text-2xl font-bold text-green-700">{dailyAverage.toLocaleString()}</p>
          </div>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date"
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              allowDecimals={false}
              stroke="#6b7280"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '8px'
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="clicks"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 4, fill: '#3B82F6' }}
              activeDot={{ r: 6, fill: '#2563EB' }}
              name="Page Views"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ClicksChart;