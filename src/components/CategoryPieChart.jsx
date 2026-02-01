import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = [
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#6366f1', // Indigo
];

const CategoryPieChart = ({ transactions }) => {
  const [type, setType] = useState('expense'); // 'income' or 'expense'

  // Logic: Group Data based on selected Type
  const data = useMemo(() => {
    // 1. Filter by the selected toggle (Income or Expense)
    const filtered = transactions.filter(t => t.type === type);
    
    // 2. Sum up amounts per category
    const categoryMap = {};
    filtered.forEach(t => {
      if (categoryMap[t.category]) {
        categoryMap[t.category] += t.amount;
      } else {
        categoryMap[t.category] = t.amount;
      }
    });

    // 3. Convert to array for Recharts
    return Object.keys(categoryMap).map(key => ({
      name: key,
      value: categoryMap[key]
    })).sort((a, b) => b.value - a.value); // Sort biggest to smallest
  }, [transactions, type]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">
          {type === 'expense' ? 'Expense' : 'Income'} Breakdown
        </h3>
        
        {/* Toggle Switch */}
        <div className="bg-slate-950 p-1 rounded-lg flex gap-1">
          <button
            onClick={() => setType('income')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              type === 'income' 
                ? 'bg-emerald-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setType('expense')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              type === 'expense' 
                ? 'bg-red-600 text-white shadow-lg' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Expense
          </button>
        </div>
      </div>

      <div className="w-full flex-1 min-h-0">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <p>No {type} data found.</p>
            <p className="text-xs mt-2 opacity-50">Add a transaction to see the chart.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPieChart;