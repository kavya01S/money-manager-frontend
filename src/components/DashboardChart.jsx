import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const DashboardChart = ({ transactions }) => {
  const [granularity, setGranularity] = useState("day");

  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const dataMap = {};

    transactions.forEach((t) => {
      const date = new Date(t.date);
      let key;      
      let label;    
      let sortTime; 

      if (granularity === "day") {
        key = date.toISOString().split("T")[0];
        label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        sortTime = date.getTime();
      } 
      else if (granularity === "week") {
        const d = new Date(date);
        const day = d.getDay(); 
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
        const weekStart = new Date(d.setDate(diff));
        weekStart.setHours(0,0,0,0);
        
        key = weekStart.toISOString().split("T")[0];
        label = `Wk ${weekStart.getDate()} ${weekStart.toLocaleDateString("en-US", { month: "short" })}`;
        sortTime = weekStart.getTime();
      }
      else if (granularity === "month") {
        key = `${date.getFullYear()}-${date.getMonth()}`;
        label = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        sortTime = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
      }

      if (!dataMap[key]) {
        dataMap[key] = { name: label, income: 0, expense: 0, sortTime: sortTime };
      }
      
      if (t.type === 'income') {
        dataMap[key].income += t.amount;
      } else {
        dataMap[key].expense += t.amount;
      }
    });

    return Object.values(dataMap).sort((a, b) => a.sortTime - b.sortTime);

  }, [transactions, granularity]);

  return (
    <div className="p-6 mb-8 border shadow-lg bg-slate-900 border-slate-800 rounded-2xl">
      <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-xl font-bold text-white">Income vs Expense</h3>
          <p className="text-xs text-slate-400">Compare your cash flow trends</p>
        </div>

        <div className="flex p-1 space-x-1 rounded-lg bg-slate-950">
          {["day", "week", "month"].map((view) => (
            <button
              key={view}
              onClick={() => setGranularity(view)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
                granularity === view
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              minTickGap={30}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#1e293b",
                color: "#fff",
              }}
              itemStyle={{ fontSize: '12px' }}
              formatter={(value, name) => [`₹${value.toLocaleString()}`, name.charAt(0).toUpperCase() + name.slice(1)]}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            
            <Area
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorIncome)"
              dot={{ r: 4, strokeWidth: 2 }} 
              animationDuration={800}
            />
            <Area
              type="monotone"
              dataKey="expense"
              name="Expense"
              stroke="#ef4444"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorExpense)"
              dot={{ r: 4, strokeWidth: 2 }}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardChart;