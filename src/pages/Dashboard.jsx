import { API_URL } from "../api";
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
  RefreshCw,
  Trash2,
  Download,
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

  const [filters, setFilters] = useState({
    division: "All",
    type: "All",
    category: "All",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchTransactions(JSON.parse(storedUser).token);
  }, [navigate]);

  const fetchTransactions = async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}/transactions`, config);
      setTransactions(response.data.data);
      setLoading(false);
    } catch (error) {
      toast.error("Could not load data");
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    const result = transactions.filter((t) => {
      const matchDivision =
        filters.division === "All" || t.division === filters.division;
      const matchType = filters.type === "All" || t.type === filters.type;
      const matchCategory =
        filters.category === "All" || t.category === filters.category;
      let matchDate = true;
      if (filters.startDate && filters.endDate) {
        const tDate = t.date.split("T")[0];
        matchDate = tDate >= filters.startDate && tDate <= filters.endDate;
      }
      return matchDivision && matchType && matchCategory && matchDate;
    });
    return result.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filters]);

  const { totalBalance, income, expense } = useMemo(() => {
    let inc = 0,
      exp = 0;
    filteredTransactions.forEach((t) =>
      t.type === "income" ? (inc += t.amount) : (exp += t.amount),
    );
    return { totalBalance: inc - exp, income: inc, expense: exp };
  }, [filteredTransactions]);

  const categories = [...new Set(transactions.map((t) => t.category))];

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });
  const clearFilters = () =>
    setFilters({
      division: "All",
      type: "All",
      category: "All",
      startDate: "",
      endDate: "",
    });
  const onLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleDelete = async (id, date) => {
    if (window.confirm("Delete this transaction?")) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`${API_URL}/transactions/${id}`, config);
        toast.success("Deleted");
        fetchTransactions(user.token);
      } catch (error) {
        toast.error(error.response?.data?.error || "Delete failed");
      }
    }
  };

  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      toast.error("No data");
      return;
    }
    const headers = [
      "Date",
      "Description",
      "Category",
      "Amount",
      "Type",
      "Division",
    ];
    const rows = filteredTransactions.map((t) => [
      t.date.split("T")[0],
      `"${(t.description || "").replace(/"/g, '""')}"`,
      t.category,
      t.amount,
      t.type,
      t.division,
    ]);
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `fintrack_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-blue-500 bg-slate-950">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen font-sans text-white bg-slate-950 selection:bg-blue-500 selection:text-white">
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text">
                FinTrack
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden text-slate-400 sm:block">
                Hello, {user?.name.split(" ")[0]}
              </span>
              <button
                onClick={onLogout}
                className="p-2 transition-colors rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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

        <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
          <DashboardChart transactions={filteredTransactions} />
          <CategoryPieChart transactions={filteredTransactions} />
        </div>

        {/* --- SIMPLE FLEX FILTER BAR --- */}
        <div className="p-4 mb-6 border shadow-lg bg-slate-800 rounded-xl border-slate-700">
          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
            <div className="flex flex-wrap items-center w-full gap-2 lg:w-auto">
              <div className="flex items-center gap-2 mr-2 text-slate-400">
                <Filter className="w-4 h-4" />
                <span className="hidden text-sm font-medium md:block">
                  Filters:
                </span>
              </div>
              <select
                name="division"
                value={filters.division}
                onChange={handleFilterChange}
                className="h-10 px-3 text-sm border rounded-lg outline-none bg-slate-700 border-slate-600 text-slate-200 focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Divisions</option>
                <option value="Office">Office</option>
                <option value="Personal">Personal</option>
              </select>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="h-10 px-3 text-sm border rounded-lg outline-none bg-slate-700 border-slate-600 text-slate-200 focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="h-10 px-3 text-sm border rounded-lg outline-none bg-slate-700 border-slate-600 text-slate-200 focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                onClick={clearFilters}
                className="flex items-center justify-center w-10 h-10 border rounded-lg bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-300"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-end w-full gap-2 lg:w-auto">
              <div className="flex items-center gap-1 p-1 border rounded-lg bg-slate-900 border-slate-600">
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="h-8 px-2 text-sm bg-transparent outline-none text-slate-200"
                />
                <span className="text-slate-500">-</span>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="h-8 px-2 text-sm bg-transparent outline-none text-slate-200"
                />
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center h-10 gap-2 px-4 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" /> <span>Add</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center h-10 gap-2 px-4 text-sm font-medium text-white rounded-lg shadow-lg bg-emerald-600 hover:bg-emerald-700"
              >
                <Download className="w-4 h-4" /> <span>CSV</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border bg-slate-900/50 backdrop-blur-sm border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">
              {filteredTransactions.length} Transactions
            </h3>
          </div>
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <p>No transactions found.</p>
                <button
                  onClick={clearFilters}
                  className="mt-2 text-sm text-blue-500 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredTransactions.map((t) => (
                <motion.div
                  key={t._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 border border-transparent bg-slate-800/50 hover:border-slate-700 hover:bg-slate-800 rounded-xl group"
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
                        className={`text-lg font-bold ${t.type === "income" ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {t.type === "income" ? "+" : "-"} ₹{t.amount}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${t.division === "Office" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"}`}
                      >
                        {t.division}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(t._id, t.date)}
                      className="p-2 rounded-lg opacity-0 text-slate-600 hover:text-red-500 hover:bg-red-500/10 group-hover:opacity-100"
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
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        refreshData={() => fetchTransactions(user.token)}
      />
    </div>
  );
};

export default Dashboard;
