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
  const [timeRange, setTimeRange] = useState("month"); // week, month, year

  // Group data based on time range
  const chartData = useMemo(() => {
    if (!transactions.length) return [];

    const dataMap = {};

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const amount = t.amount;

      // --- LOGIC CHANGE: Trust the Parent Filter ---
      // We removed the "if (date === today)" checks.
      // Now it simply groups whatever data passes through the filter.

      if (timeRange === "week") {
        // Group by Day of Week (0=Sun, 1=Mon...)
        // This ensures correct sorting order
        const dayIdx = date.getDay();
        dataMap[dayIdx] = (dataMap[dayIdx] || 0) + amount;
      } else if (timeRange === "month") {
        // Group by Date (1, 2, 3... 31)
        // Perfect for your "Jan 1 - Jan 31" filter
        const dayNum = date.getDate();
        dataMap[dayNum] = (dataMap[dayNum] || 0) + amount;
      } else if (timeRange === "year") {
        // Group by Month (0=Jan, 1=Feb...)
        const monthIdx = date.getMonth();
        dataMap[monthIdx] = (dataMap[monthIdx] || 0) + amount;
      }
    });

    // Convert Object to Array and SORT
    return Object.keys(dataMap)
      .map((key) => {
        const numKey = parseInt(key);
        let label = key;

        // Create readable labels based on the numeric keys
        if (timeRange === "week") {
          const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          label = days[numKey];
        } else if (timeRange === "month") {
          label = `Day ${numKey}`;
        } else if (timeRange === "year") {
          const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          label = months[numKey];
        }

        return {
          name: label,
          amount: dataMap[key],
          sortKey: numKey,
        };
      })
      .sort((a, b) => a.sortKey - b.sortKey); // Numerical Sort (Jan before Feb, 1 before 2)
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
