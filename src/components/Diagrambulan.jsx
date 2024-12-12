import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useMediaQuery } from 'react-responsive';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

const MonthlyBarChart = ({ 
  listings = [], 
  dataType = 'monthly',
  activityHistory = []
}) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [dateRange, setDateRange] = useState({
    from: format(new Date(), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  });
  const [activeLines, setActiveLines] = useState({
    total: true,
    pending: true,
    approved: true,
    deleted: true,
    uploaded: true
  });

  const chartData = useMemo(() => {
    if (!Array.isArray(listings) || !Array.isArray(activityHistory)) {
      return [];
    }

    const startDate = parseISO(dateRange.from);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = parseISO(dateRange.to);
    endDate.setHours(23, 59, 59, 999);

    // Filter listings and activities within selected date range
    const filteredListings = listings.filter(listing => {
      if (!listing?.createdAt) return false;
      const listingDate = new Date(listing.createdAt);
      return listingDate >= startDate && listingDate <= endDate;
    });

    const filteredActivities = activityHistory.filter(activity => {
      if (!activity?.timestamp) return false;
      const activityDate = new Date(activity.timestamp);
      return activityDate >= startDate && activityDate <= endDate;
    });

    // Generate data for each day in the selected range
    const dailyData = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dailyData.push({
        name: format(currentDate, 'dd MMM', { locale: id }),
        fullDate: format(currentDate, 'yyyy-MM-dd'),
        total: 0,
        pending: 0,
        approved: 0,
        deleted: 0,
        uploaded: 0
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Populate data
    filteredListings.forEach(listing => {
      const listingDate = new Date(listing.createdAt);
      const dateStr = format(listingDate, 'yyyy-MM-dd');
      const dayData = dailyData.find(d => d.fullDate === dateStr);
      
      if (dayData) {
        dayData.total += 1;
        dayData.uploaded += 1;
        
        if (listing?.status) {
          const status = listing.status.toLowerCase();
          if (status === 'pending') {
            dayData.pending += 1;
          } else if (status === 'approved') {
            dayData.approved += 1;
          }
        }
      }
    });

    filteredActivities.forEach(activity => {
      if (activity.type === 'deletion') {
        const activityDate = new Date(activity.timestamp);
        const dateStr = format(activityDate, 'yyyy-MM-dd');
        const dayData = dailyData.find(d => d.fullDate === dateStr);
        
        if (dayData) {
          dayData.deleted += 1;
        }
      }
    });

    return dailyData;
  }, [listings, dataType, activityHistory, dateRange]);

  const handleLegendClick = (dataKey) => {
    setActiveLines(prev => ({
      ...prev,
      [dataKey]: !prev[dataKey]
    }));
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className={`flex ${isMobile ? 'flex-wrap gap-2 px-2' : 'flex-row gap-4'} justify-center mt-4`}>
        {payload.map((entry) => (
          <div
            key={entry.value}
            className={`flex items-center cursor-pointer ${isMobile ? 'text-sm' : ''}`}
            onClick={() => handleLegendClick(entry.dataKey)}
          >
            <div
              className={`w-3 h-3 rounded-full mr-1`}
              style={{
                backgroundColor: entry.color,
                opacity: activeLines[entry.dataKey] ? 1 : 0.3
              }}
            />
            <span style={{ opacity: activeLines[entry.dataKey] ? 1 : 0.3 }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            className="border rounded px-2 py-1"
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>

      <div className={`${isMobile ? 'h-64' : 'h-96'}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{
              top: 5,
              right: isMobile ? 10 : 30,
              left: isMobile ? -20 : 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: isMobile ? 12 : 14 }}
              width={isMobile ? 60 : 80}
            />
            <Tooltip
              contentStyle={{
                fontSize: isMobile ? 12 : 14,
                padding: isMobile ? '8px' : '10px'
              }}
              labelFormatter={(label, payload) => {
                if (payload[0]?.payload?.fullDate) {
                  return format(parseISO(payload[0].payload.fullDate), "EEEE, dd MMMM yyyy", { locale: id });
                }
                return label;
              }}
            />
            {activeLines.total && (
              <Bar
                dataKey="total"
                fill="#8884d8"
                name="Total"
                radius={[0, 4, 4, 0]}
                stackId="a"
              />
            )}
            {activeLines.pending && (
              <Bar
                dataKey="pending"
                fill="#82ca9d"
                name="Pending"
                radius={[0, 4, 4, 0]}
                stackId="a"
              />
            )}
            {activeLines.approved && (
              <Bar
                dataKey="approved"
                fill="#ffc658"
                name="Approved"
                radius={[0, 4, 4, 0]}
                stackId="a"
              />
            )}
            {activeLines.deleted && (
              <Bar
                dataKey="deleted"
                fill="#ff7300"
                name="Deleted"
                radius={[0, 4, 4, 0]}
                stackId="a"
              />
            )}
            {activeLines.uploaded && (
              <Bar
                dataKey="uploaded"
                fill="#0088fe"
                name="Uploaded"
                radius={[0, 4, 4, 0]}
                stackId="a"
              />
            )}
            <Legend content={<CustomLegend />} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyBarChart;