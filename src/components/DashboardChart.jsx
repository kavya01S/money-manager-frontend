import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DashboardChart = ({ transactions }) => {
  const [timeRange, setTimeRange] = useState('week'); // week, month, year

  // Group data based on time range
  const chartData = useMemo(() => {
    if (!transactions.length) return [];

    const dataMap = {};
    const today = new Date();

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const amount = t.amount;
      
      // Filter Logic
      if (timeRange === 'week') {
        // Show last 7 days
        const diffTime = Math.abs(today - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            dataMap[dayName] = (dataMap[dayName] || 0) + amount;
        }
      } else if (timeRange === 'month') {
        // Show days of current month
        if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) {
            const dayNum = date.getDate();
            dataMap[dayNum] = (dataMap[dayNum] || 0) + amount;
        }
      } else if (timeRange === 'year') {
        // Show months of current year
        if (date.getFullYear() === today.getFullYear()) {
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });
            dataMap[monthName] = (dataMap[monthName] || 0) + amount;
        }
      }
    });

    // Convert Object to Array for Recharts
    return Object.keys(dataMap).map((key) => ({
      name: key,
      amount: dataMap[key]
    }));
  }, [transactions, timeRange]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">Analytics</h3>
        
        {/* Time Range Toggles */}
        <div className="bg-slate-950 p-1 rounded-lg flex gap-1">
          {['week', 'month', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
                timeRange === range 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
              itemStyle={{ color: '#3b82f6' }}
            />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorAmount)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardChart;