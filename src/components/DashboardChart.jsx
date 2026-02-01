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
  // "day" = Daily view (for looking at a Month)
  // "month" = Monthly view (for looking at a Year)
  const [granularity, setGranularity] = useState("day");

  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const dataMap = {};

    transactions.forEach((t) => {
      if (!t.date) return;

      // STRICT STRING PARSING (Fixes Timezone/Empty Graph issues)
      // We assume date comes as "YYYY-MM-DDTHH:mm:ss.sssZ"
      const dateStr = t.date.split('T')[0]; // "2025-01-01"
      const [year, month, day] = dateStr.split('-').map(Number);
      
      let key, label, sortTime;

      if (granularity === "day") {
        // Key: "2025-01-01"
        key = dateStr; 
        // Label: "Jan 1"
        label = new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        sortTime = new Date(year, month - 1, day).getTime();
      } 
      else if (granularity === "week") {
        // Calculate Week Start (Sunday) using UTC to stay consistent
        const dateObj = new Date(year, month - 1, day);
        const dayOfWeek = dateObj.getDay(); 
        const diff = dateObj.getDate() - dayOfWeek;
        const weekStart = new Date(dateObj.setDate(diff));
        
        key = weekStart.toISOString().split('T')[0];
        label = `Wk ${weekStart.getDate()} ${weekStart.toLocaleDateString("en-US", { month: "short" })}`;
        sortTime = weekStart.getTime();
      } 
      else if (granularity === "month") {
        // Key: "2025-01"
        key = `${year}-${month}`;
        // Label: "Jan 25"
        label = new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        sortTime = new Date(year, month - 1, 1).getTime();
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
          <p className="text-xs text-slate-400">
             {granularity === 'day' ? "Daily Breakdown (1-31)" : granularity === 'month' ? "Monthly Breakdown (Jan-Dec)" : "Weekly Trends"}
          </p>
        </div>

        <div className="flex p-1 space-x-1 rounded-lg bg-slate-950">
          <button onClick={() => setGranularity("day")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${granularity === "day" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
            Monthly
          </button>
          <button onClick={() => setGranularity("week")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${granularity === "week" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
            Weekly
          </button>
          <button onClick={() => setGranularity("month")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${granularity === "month" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
            Yearly
          </button>
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
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
            <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", color: "#fff" }} itemStyle={{ fontSize: '12px' }} formatter={(value, name) => [`₹${value.toLocaleString()}`, name]} />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" dot={{ r: 4, strokeWidth: 2, fill: "#10b981" }} activeDot={{ r: 6 }} animationDuration={500} />
            <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" dot={{ r: 4, strokeWidth: 2, fill: "#ef4444" }} activeDot={{ r: 6 }} animationDuration={500} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardChart;