import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const DashboardChart = ({ transactions }) => {
  // 'day' = Daily (1-31), 'week' = Weekly, 'month' = Monthly (Jan-Dec)
  const [granularity, setGranularity] = useState("day");

  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const dataMap = {};

    transactions.forEach((t) => {
      // Use Local Time (new Date) to match the dashboard list exactly
      const date = new Date(t.date);
      let key, label, sortTime;

      // 1. DAILY View (1-31)
      if (granularity === "day") {
        // Key: YYYY-MM-DD (Local)
        key = date.toLocaleDateString("en-CA"); // 'en-CA' gives YYYY-MM-DD in local time
        label = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        sortTime = date.getTime();
      }
      // 2. WEEKLY View
      else if (granularity === "week") {
        const day = date.getDay();
        const diff = date.getDate() - day; // Adjust to Sunday
        const weekStart = new Date(date);
        weekStart.setDate(diff);
        weekStart.setHours(0, 0, 0, 0);

        key = weekStart.toISOString();
        label = `Wk ${weekStart.getDate()} ${weekStart.toLocaleDateString("en-US", { month: "short" })}`;
        sortTime = weekStart.getTime();
      }
      // 3. MONTHLY View (Jan-Dec)
      else if (granularity === "month") {
        key = `${date.getFullYear()}-${date.getMonth()}`;
        label = date.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
        // Sort by 1st of month
        const sortDate = new Date(date);
        sortDate.setDate(1);
        sortTime = sortDate.getTime();
      }

      if (!dataMap[key])
        dataMap[key] = { name: label, income: 0, expense: 0, sortTime };

      t.type === "income"
        ? (dataMap[key].income += t.amount)
        : (dataMap[key].expense += t.amount);
    });

    return Object.values(dataMap).sort((a, b) => a.sortTime - b.sortTime);
  }, [transactions, granularity]);

  return (
    <div className="p-6 mb-8 border shadow-lg bg-slate-900 border-slate-800 rounded-2xl">
      <div className="flex flex-col items-center justify-between gap-4 mb-6 sm:flex-row">
        <div>
          <h3 className="text-xl font-bold text-white">Income vs Expense</h3>
          <p className="text-xs text-slate-400">Time Scale Analysis</p>
        </div>
        <div className="flex p-1 rounded-lg bg-slate-950">
          <button
            onClick={() => setGranularity("day")}
            className={`px-3 py-1 text-xs font-medium rounded ${granularity === "day" ? "bg-blue-600 text-white" : "text-slate-400"}`}
          >
            Daily
          </button>
          <button
            onClick={() => setGranularity("week")}
            className={`px-3 py-1 text-xs font-medium rounded ${granularity === "week" ? "bg-blue-600 text-white" : "text-slate-400"}`}
          >
            Weekly
          </button>
          <button
            onClick={() => setGranularity("month")}
            className={`px-3 py-1 text-xs font-medium rounded ${granularity === "month" ? "bg-blue-600 text-white" : "text-slate-400"}`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="h-[300px] w-full">
        {chartData.length > 0 ? (
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
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                minTickGap={20}
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
              />
              <Legend verticalAlign="top" height={36} />
              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#colorIncome)"
                dot={{ r: 4, fill: "#10b981" }}
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="Expense"
                stroke="#ef4444"
                strokeWidth={3}
                fill="url(#colorExpense)"
                dot={{ r: 4, fill: "#ef4444" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            No data for selected period
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardChart;
