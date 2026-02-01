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
  const [granularity, setGranularity] = useState("day");

  const chartData = useMemo(() => {
    // DEBUG: Check console to ensure data arrives
    console.log("Chart received:", transactions.length, "transactions");

    if (!transactions || transactions.length === 0) return [];

    const dataMap = {};

    transactions.forEach((t) => {
      // Parse "2025-01-01" strictly from string
      const dateStr = t.date.split("T")[0];
      const [year, month, day] = dateStr.split("-").map(Number);

      let key, label, sortTime;

      // "Monthly" Button -> Logic = 'day' (Show Days 1-31)
      if (granularity === "day") {
        key = dateStr;
        label = `${month}/${day}`; // Simple label: 1/31
        sortTime = new Date(year, month - 1, day).getTime();
      }
      // "Weekly" Button -> Logic = 'week'
      else if (granularity === "week") {
        const d = new Date(year, month - 1, day);
        const dayOfWeek = d.getDay();
        const diff = d.getDate() - dayOfWeek;
        const wkStart = new Date(d.setDate(diff));
        key = wkStart.toISOString().split("T")[0];
        label = `Wk ${wkStart.getDate()}`;
        sortTime = wkStart.getTime();
      }
      // "Yearly" Button -> Logic = 'month' (Show Jan-Dec)
      else if (granularity === "month") {
        key = `${year}-${month}`;
        const dateObj = new Date(year, month - 1, 1);
        label = dateObj.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
        sortTime = dateObj.getTime();
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
          <p className="text-xs text-slate-400">Trend Analysis</p>
        </div>
        <div className="flex p-1 rounded-lg bg-slate-950">
          <button
            onClick={() => setGranularity("day")}
            className={`px-3 py-1 text-xs font-medium rounded ${granularity === "day" ? "bg-blue-600 text-white" : "text-slate-400"}`}
          >
            Monthly
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
            Yearly
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#1e293b",
                  color: "#fff",
                }}
              />
              <Legend verticalAlign="top" height={36} />
              {/* Force dots to appear with r:6 */}
              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#colorIncome)"
                dot={{ r: 6, fill: "#10b981" }}
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="Expense"
                stroke="#ef4444"
                strokeWidth={3}
                fill="url(#colorExpense)"
                dot={{ r: 6, fill: "#ef4444" }}
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
