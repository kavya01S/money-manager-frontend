import { API_URL } from '../api'; 
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { LogOut, Plus, Wallet, TrendingUp, TrendingDown, Filter, RefreshCw, Trash2, Download } from 'lucide-react';
import TransactionModal from '../components/TransactionModal';
import DashboardChart from '../components/DashboardChart';
import CategoryPieChart from '../components/CategoryPieChart';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    division: 'All',
    type: 'All',
    category: 'All',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { navigate('/login'); return; }
    setUser(JSON.parse(storedUser));
    fetchTransactions(JSON.parse(storedUser).token);
  }, [navigate]);

  const fetchTransactions = async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}/transactions`, config);
      setTransactions(response.data.data);
      setLoading(false);
    } catch (error) { toast.error('Could not load data'); setLoading(false); }
  };

  // --- STRICT LOCAL-TIME FILTER LOGIC ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchDivision = filters.division === 'All' || t.division === filters.division;
      const matchType = filters.type === 'All' || t.type === filters.type;
      const matchCategory = filters.category === 'All' || t.category === filters.category;
      
      let matchDate = true;
      if (filters.startDate && filters.endDate) {
        // Convert Transaction Date to Local Time Object
        const tDate = new Date(t.date);
        
        // Create Local Start Date (00:00:00)
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0);

        // Create Local End Date (23:59:59)
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);

        matchDate = tDate >= startDate && tDate <= endDate;
      }

      return matchDivision && matchType && matchCategory && matchDate;
    }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort Newest First
  }, [transactions, filters]);

  // --- STATS ---
  const { totalBalance, income, expense } = useMemo(() => {
    let inc = 0, exp = 0;
    filteredTransactions.forEach(t => t.type === 'income' ? inc += t.amount : exp += t.amount);
    return { totalBalance: inc - exp, income: inc, expense: exp };
  }, [filteredTransactions]);

  const categories = [...new Set(transactions.map(t => t.category))];
  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const clearFilters = () => setFilters({ division: 'All', type: 'All', category: 'All', startDate: '', endDate: '' });
  const onLogout = () => { localStorage.removeItem('user'); navigate('/login'); };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this transaction?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`${API_URL}/transactions/${id}`, config);
        toast.success('Deleted'); fetchTransactions(user.token); 
      } catch (error) { toast.error(error.response?.data?.error || 'Delete failed'); }
    }
  };

  const handleExport = () => {
    if (filteredTransactions.length === 0) { toast.error("No data"); return; }
    const headers = ["Date", "Description", "Category", "Amount", "Type", "Division"];
    const rows = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString(), // Local Date
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.category,
      t.amount,
      t.type,
      t.division
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `fintrack_export.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen text-blue-500 bg-slate-950">Loading...</div>;

  return (
    <div className="min-h-screen font-sans text-white bg-slate-950 selection:bg-blue-500 selection:text-white">
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg"><Wallet className="w-6 h-6 text-white" /></div>
              <span className="text-xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text">FinTrack</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden text-slate-400 sm:block">Hello, {user?.name.split(' ')[0]}</span>
              <button onClick={onLogout} className="p-2 transition-colors rounded-full text-slate-400 hover:text-white hover:bg-slate-800"><LogOut className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </nav>

      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
          <div className="relative p-6 overflow-hidden shadow-lg bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-blue-500/20">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet className="w-24 h-24 text-white" /></div>
            <p className="mb-1 text-sm font-medium text-blue-100">Total Balance</p>
            <h3 className="text-4xl font-bold text-white">₹ {totalBalance.toLocaleString()}</h3>
          </div>
          <div className="p-6 border bg-slate-900 border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-emerald-500" /><span className="text-sm text-slate-400">Income</span></div>
            <h3 className="text-2xl font-bold text-white">₹ {income.toLocaleString()}</h3>
          </div>
          <div className="p-6 border bg-slate-900 border-slate-800 rounded-2xl">
            <div className="flex items-center gap-2 mb-2"><TrendingDown className="w-4 h-4 text-red-500" /><span className="text-sm text-slate-400">Expense</span></div>
            <h3 className="text-2xl font-bold text-white">₹ {expense.toLocaleString()}</h3>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
          <DashboardChart transactions={filteredTransactions} />
          <CategoryPieChart transactions={filteredTransactions} />
        </div>

        {/* --- SIMPLE FLEX FILTER BAR (Safe Layout) --- */}
        <div className="p-4 mb-6 border shadow-lg bg-slate-800 rounded-xl border-slate-700">
          <div className="flex flex-col items-center justify-between gap-4 xl:flex-row">
            
            {/* Filters Group */}
            <div className="flex flex-wrap items-center justify-center w-full gap-2 xl:w-auto xl:justify-start">
              <div className="flex items-center gap-2 mr-2 text-slate-400"><Filter className="w-4 h-4" /> <span className="text-sm font-medium">Filters:</span></div>
              <select name="division" value={filters.division} onChange={handleFilterChange} className="h-10 px-2 text-sm text-white border rounded-lg bg-slate-700 border-slate-600 focus:outline-none focus:border-blue-500"><option value="All">All Divisions</option><option value="Office">Office</option><option value="Personal">Personal</option></select>
              <select name="type" value={filters.type} onChange={handleFilterChange} className="h-10 px-2 text-sm text-white border rounded-lg bg-slate-700 border-slate-600 focus:outline-none focus:border-blue-500"><option value="All">All Types</option><option value="income">Income</option><option value="expense">Expense</option></select>
              <select name="category" value={filters.category} onChange={handleFilterChange} className="h-10 px-2 text-sm text-white border rounded-lg bg-slate-700 border-slate-600 focus:outline-none focus:border-blue-500"><option value="All">All Categories</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
              <button onClick={clearFilters} className="flex items-center justify-center w-10 h-10 text-white border rounded-lg bg-slate-700 hover:bg-slate-600 border-slate-600" title="Reset"><RefreshCw className="w-4 h-4" /></button>
            </div>

            {/* Date & Actions Group */}
            <div className="flex flex-wrap items-center justify-center w-full gap-3 xl:w-auto xl:justify-end">
              <div className="flex items-center gap-1 p-1 border rounded-lg bg-slate-900 border-slate-600">
                <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="h-8 px-2 text-sm text-white bg-transparent outline-none cursor-pointer" />
                <span className="text-slate-500">-</span>
                <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="h-8 px-2 text-sm text-white bg-transparent outline-none cursor-pointer" />
              </div>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center h-10 gap-2 px-4 font-medium text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 whitespace-nowrap"><Plus className="w-4 h-4" /> Add</button>
              <button onClick={handleExport} className="flex items-center h-10 gap-2 px-4 font-medium text-white rounded-lg shadow-lg bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap"><Download className="w-4 h-4" /> CSV</button>
            </div>

          </div>
        </div>

        {/* List */}
        <div className="p-6 border bg-slate-900/50 backdrop-blur-sm border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-bold text-white">{filteredTransactions.length} Transactions</h3></div>
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? <p className="py-10 text-center text-slate-500">No transactions found.</p> : 
              filteredTransactions.map(t => (
                <div key={t._id} className="flex items-center justify-between p-4 border border-transparent bg-slate-800/50 rounded-xl hover:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{t.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}</div>
                    <div><h4 className="font-bold text-white">{t.category}</h4><p className="text-sm text-slate-400">{new Date(t.date).toLocaleDateString()} • {t.description}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right"><p className={`text-lg font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>{t.type === 'income' ? '+' : '-'} ₹{t.amount}</p><span className="text-xs text-slate-500">{t.division}</span></div>
                    <button onClick={() => handleDelete(t._id)} className="text-slate-600 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </main>
      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} refreshData={() => fetchTransactions(user.token)} />
    </div>
  );
};

export default Dashboard;