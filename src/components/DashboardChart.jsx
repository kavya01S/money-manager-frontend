import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DashboardChart = ({ transactions }) => {
  // View mode: 'day' shows every single day, 'month' groups by month
  const [granularity, setGranularity] = useState("day");

  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const dataMap = {};

    transactions.forEach((t) => {
      const date = new Date(t.date);
      let key; // Unique ID for the group
      let label; // What the user sees
      let sortTime; // For correct ordering

      if (granularity === "day") {
        // Key: YYYY-MM-DD (Ensures Jan 1 2025 is different from Jan 1 2026)
        key = date.toISOString().split("T")[0];
        label = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        sortTime = date.getTime();
      } else {
        // Key: YYYY-MM
        key = `${date.getFullYear()}-${date.getMonth()}`;
        label = date.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
        // Set sortTime to the 1st of that month
        sortTime = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
      }

      if (!dataMap[key]) {
        dataMap[key] = { name: label, amount: 0, sortTime: sortTime };
      }

      // Sum the amounts
      dataMap[key].amount += t.amount;
    });

    // Transform Object -> Array AND Sort Chronologically
    return Object.values(dataMap).sort((a, b) => a.sortTime - b.sortTime);
  }, [transactions, granularity]);

  return (
    <div className="p-6 mb-8 border shadow-lg bg-slate-900 border-slate-800 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Financial Trends</h3>

        <div className="flex p-1 space-x-1 rounded-lg bg-slate-950">
          <button
            onClick={() => setGranularity("day")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              granularity === "day"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setGranularity("month")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              granularity === "month"
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
              itemStyle={{ color: "#3b82f6" }}
              formatter={(value) => [`₹${value}`, "Amount"]}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#3b82f6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAmount)"
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardChart;
