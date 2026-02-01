import { API_URL } from "../api"; // <--- Import this at the top
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  LogOut,
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  Filter,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import TransactionModal from "../components/TransactionModal";
import DashboardChart from "../components/DashboardChart";
import CategoryPieChart from "../components/CategoryPieChart";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Filter States ---
  const [filters, setFilters] = useState({
    division: "All",
    type: "All",
    category: "All",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    // 1. Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // 2. Fetch Transactions
    fetchTransactions(parsedUser.token);
  }, [navigate]);

  const fetchTransactions = async (token) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const response = await axios.get(`${API_URL}/transactions`, config);
      setTransactions(response.data.data);
      setLoading(false);
    } catch (error) {
      toast.error("Could not load data");
      setLoading(false);
    }
  };

  // --- 1. FILTER LOGIC ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchDivision =
        filters.division === "All" || t.division === filters.division;
      const matchType = filters.type === "All" || t.type === filters.type;
      const matchCategory =
        filters.category === "All" || t.category === filters.category;

      let matchDate = true;
      if (filters.startDate && filters.endDate) {
        const tDate = new Date(t.date);
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);
        // Reset hours to compare just dates strictly if needed, or keep time
        matchDate = tDate >= start && tDate <= end;
      }

      return matchDivision && matchType && matchCategory && matchDate;
    });
  }, [transactions, filters]);

  // --- 2. STATS CALCULATION (Based on Filters) ---
  const { totalBalance, income, expense } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === "income") inc += t.amount;
      else exp += t.amount;
    });
    return { totalBalance: inc - exp, income: inc, expense: exp };
  }, [filteredTransactions]);

  // Extract unique categories for the dropdown
  const categories = [...new Set(transactions.map((t) => t.category))];

  // --- 3. ACTIONS ---
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      division: "All",
      type: "All",
      category: "All",
      startDate: "",
      endDate: "",
    });
  };

  const onLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // --- 4. DELETE WITH 12-HOUR LIMIT ---
  const handleDelete = async (id, date) => {
    const transactionTime = new Date(date).getTime();
    const twelveHours = 12 * 60 * 60 * 1000;

    // Check if 12 hours have passed
    if (Date.now() - transactionTime > twelveHours) {
      toast.error("⏳ Cannot edit/delete transactions older than 12 hours!");
      return;
    }

    if (window.confirm("Are you sure you want to delete this?")) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`${API_URL}/transactions/${id}`, config);
        toast.success("Transaction Removed");
        fetchTransactions(user.token); // Refresh data
      } catch (error) {
        toast.error("Delete failed");
      }
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-blue-500 bg-slate-950">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen font-sans text-white bg-slate-950 selection:bg-blue-500 selection:text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
                FinTrack
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden text-slate-400 sm:block">
                Hello, {user?.name.split(" ")[0]}
              </span>
              <button
                onClick={onLogout}
                className="p-2 transition-colors rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative p-6 overflow-hidden shadow-lg bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-blue-500/20"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Wallet className="w-24 h-24 text-white" />
            </div>
            <p className="mb-1 text-sm font-medium text-blue-100">
              Total Balance
            </p>
            <h3 className="text-4xl font-bold text-white">
              ₹ {totalBalance.toLocaleString()}
            </h3>
          </motion.div>

          {/* Income Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 border bg-slate-900 border-slate-800 rounded-2xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-emerald-500/10 rounded text-emerald-500">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-sm text-slate-400">Total Income</span>
            </div>
            <h3 className="text-2xl font-bold text-white">
              ₹ {income.toLocaleString()}
            </h3>
          </motion.div>

          {/* Expense Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 border bg-slate-900 border-slate-800 rounded-2xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-red-500/10 rounded text-red-500">
                <TrendingDown className="w-4 h-4" />
              </div>
              <span className="text-sm text-slate-400">Total Expense</span>
            </div>
            <h3 className="text-2xl font-bold text-white">
              ₹ {expense.toLocaleString()}
            </h3>
          </motion.div>
        </div>

        {/* Charts Section - 2 Columns on large screens */}
        <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
          {/* Left: Trend Graph */}
          <DashboardChart transactions={filteredTransactions} />

          {/* Right: Pie Chart */}
          <CategoryPieChart transactions={filteredTransactions} />
        </div>

        {/* --- FILTERS & ADD BUTTON BAR --- */}
        <div className="flex flex-col items-end justify-between gap-4 p-4 mb-6 border md:flex-row md:items-center bg-slate-900/50 rounded-xl border-slate-800 backdrop-blur-sm">
          <div className="flex flex-wrap items-center w-full gap-3 md:w-auto">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Filter className="w-4 h-4" /> Filters:
            </div>

            {/* Division Filter */}
            <select
              name="division"
              value={filters.division}
              onChange={handleFilterChange}
              className="px-3 py-2 text-sm transition-colors border rounded-lg outline-none cursor-pointer bg-slate-950 border-slate-800 text-slate-300 focus:border-blue-500 hover:bg-slate-900"
            >
              <option value="All">All Divisions</option>
              <option value="Office">Office</option>
              <option value="Personal">Personal</option>
            </select>

            {/* Type Filter */}
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="px-3 py-2 text-sm transition-colors border rounded-lg outline-none cursor-pointer bg-slate-950 border-slate-800 text-slate-300 focus:border-blue-500 hover:bg-slate-900"
            >
              <option value="All">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            {/* Category Filter */}
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="px-3 py-2 text-sm transition-colors border rounded-lg outline-none cursor-pointer bg-slate-950 border-slate-800 text-slate-300 focus:border-blue-500 hover:bg-slate-900"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Date Range */}
            <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-slate-950 border-slate-800">
              <span className="text-xs text-slate-500">From</span>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="text-sm bg-transparent outline-none text-slate-300"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-slate-950 border-slate-800">
              <span className="text-xs text-slate-500">To</span>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="text-sm bg-transparent outline-none text-slate-300"
              />
            </div>

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="p-2 transition-colors rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
              title="Clear Filters"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 shadow-blue-500/20 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        </div>

        {/* --- TRANSACTIONS LIST --- */}
        <div className="p-6 border bg-slate-900/50 border-slate-800 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {filteredTransactions.length} Transactions Found
            </h3>
          </div>

          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-slate-500">
                  No transactions found matching your filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-2 text-sm text-blue-500 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              filteredTransactions.map((t) => (
                <motion.div
                  key={t._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 transition-colors border border-transparent bg-slate-800/50 rounded-xl hover:bg-slate-800 hover:border-slate-700 group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-full ${t.type === "income" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}
                    >
                      {t.type === "income" ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{t.category}</h4>
                      <p className="flex items-center gap-2 text-sm text-slate-400">
                        <span>{new Date(t.date).toLocaleDateString()}</span>
                        {t.description && (
                          <span className="text-slate-600">
                            • {t.description}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p
                        className={`font-bold text-lg ${t.type === "income" ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {t.type === "income" ? "+" : "-"} ₹{t.amount}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${t.division === "Office" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"}`}
                      >
                        {t.division}
                      </span>
                    </div>

                    {/* DELETE BUTTON (With 12hr check) */}
                    <button
                      onClick={() => handleDelete(t._id, t.date)}
                      className="p-2 transition-all rounded-lg opacity-0 text-slate-600 hover:text-red-500 hover:bg-red-500/10 group-hover:opacity-100"
                      title="Delete Transaction"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        refreshData={() => fetchTransactions(user.token)}
      />
    </div>
  );
};

export default Dashboard;
