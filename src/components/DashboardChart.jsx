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
  const [timeRange, setTimeRange] = useState("week"); // week, month, year

  // Group data based on time range
  const chartData = useMemo(() => {
    if (!transactions.length) return [];

    const dataMap = {};
    const today = new Date();

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const amount = t.amount;

      // Filter Logic
      if (timeRange === "week") {
        const diffTime = Math.abs(today - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
          // Key format: "YYYY-MM-DD" so we can sort easily later
          const dayKey = date.toISOString().split("T")[0];
          dataMap[dayKey] = (dataMap[dayKey] || 0) + amount;
        }
      } else if (timeRange === "month") {
        if (
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        ) {
          const dayNum = date.getDate(); // Key: 1, 2, 3...
          dataMap[dayNum] = (dataMap[dayNum] || 0) + amount;
        }
      } else if (timeRange === "year") {
        if (date.getFullYear() === today.getFullYear()) {
          // Key: 0 (Jan), 1 (Feb)... easier to sort than strings
          const monthIdx = date.getMonth();
          dataMap[monthIdx] = (dataMap[monthIdx] || 0) + amount;
        }
      }
    });

    // Convert Object to Array and SORT IT properly
    return (
      Object.keys(dataMap)
        .map((key) => {
          // Convert keys back to readable labels for the chart
          let label = key;
          if (timeRange === "week") {
            const d = new Date(key);
            label = d.toLocaleDateString("en-US", { weekday: "short" });
          } else if (timeRange === "year") {
            const d = new Date();
            d.setMonth(key);
            label = d.toLocaleDateString("en-US", { month: "short" });
          }

          return {
            originalKey: key, // Keep original for sorting
            name: label,
            amount: dataMap[key],
          };
        })
        // The sort function: compares keys (Dates or Numbers)
        .sort((a, b) => (a.originalKey > b.originalKey ? 1 : -1))
    );
  }, [transactions, timeRange]);

  return (
    <div className="p-6 mb-8 border shadow-lg bg-slate-900 border-slate-800 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Analytics</h3>

        {/* Time Range Toggles */}
        <div className="flex gap-1 p-1 rounded-lg bg-slate-950">
          {["week", "month", "year"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
                timeRange === range
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
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
