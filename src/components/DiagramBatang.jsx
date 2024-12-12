import React, { useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useMediaQuery } from 'react-responsive';

const ListingDistributionCharts = ({ listings = [] }) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [activeView, setActiveView] = useState('category');

  // Warna-warna untuk setiap bagian pie
  const COLORS = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6',
    '#06b6d4', '#84cc16', '#a855f7', '#64748b', '#d946ef'
  ];

  const { categoryData, cityData, approvedListings } = useMemo(() => {
    if (!Array.isArray(listings)) {
      return { categoryData: [], cityData: [], approvedListings: [] };
    }

    // Filter hanya listing yang approved
    const approvedListings = listings.filter(listing => listing.status === 'approved');

    // Process category data dari approved listings
    const categoryCountMap = approvedListings.reduce((acc, listing) => {
      const category = listing.category || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const categoryData = Object.entries(categoryCountMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Process city data dari approved listings
    const cityCountMap = approvedListings.reduce((acc, listing) => {
      const city = listing.city || 'Unknown';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});

    const cityData = Object.entries(cityCountMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { categoryData, cityData, approvedListings };
  }, [listings]);

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-2 border rounded shadow-lg">
          <p className="text-sm font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            Total: <span className="font-bold">{data.value}</span>
          </p>
          <p className="text-xs text-gray-500">
            {((data.value / approvedListings.length) * 100).toFixed(1)}% of approved listings
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend renderer
  const renderLegend = (props) => {
    const { payload } = props;
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm mt-4 justify-items-center" style={{fontFamily:'Quicksand',color:'#0000008A'}}>
        {payload.map((entry, index) => (
          <div 
            key={`legend-${index}`} 
            className="flex items-center justify-center"
          >
            <div 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="truncate text-center" style={{color:'#0000008A'}}>
              {entry.value} ({entry.payload.value})
            </span>
          </div>
        ))}
      </div>
    );
  };

  const chartData = activeView === 'category' ? categoryData : cityData;

  if (!approvedListings.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No approved listings available</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-4">
        <label htmlFor="viewType" className="text-gray-600 font-bold text-sm md:text-base" style={{fontFamily:'Quicksand'}}>
          View Distribution By
        </label>
        <select
          id="viewType"
          value={activeView}
          onChange={(e) => setActiveView(e.target.value)}
          className="p-2 border rounded-md bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
          style={{fontFamily:'Quicksand'}}
        >
          <option value="category">Category</option>
          <option value="city">City</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
        <h2 className="mb-4 text-lg md:text-xl font-bold text-gray-800" style={{fontFamily:"Quicksand"}}>
          Approved Listing Distribution by {activeView === 'category' ? 'Category' : 'City'}
        </h2>
        
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={isMobile ? 60 : 80}
                outerRadius={isMobile ? 100 : 140}
                paddingAngle={2}
                label={({ name, percent }) => 
                  `${name} (${(percent * 100).toFixed(1)}%)`
                }
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Summary:</h3>
          <ul className="text-sm text-gray-500 list-disc pl-5 space-y-1">
            <li>Total unique {activeView === 'category' ? 'categories' : 'cities'}: {chartData.length}</li>
            <li>Most common: {chartData[0]?.name} ({chartData[0]?.value} listings)</li>
            <li>Total approved listings: {approvedListings.length}</li>
            <li>Approval rate: {((approvedListings.length / listings.length) * 100).toFixed(1)}%</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ListingDistributionCharts;