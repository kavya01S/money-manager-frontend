import { API_URL } from "../api"; // <--- Import this at the top
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Wallet, Building, User } from "lucide-react";

const TransactionModal = ({ isOpen, onClose, refreshData }) => {
  const [formData, setFormData] = useState({
    amount: "",
    type: "expense", // Default to expense
    category: "",
    division: "Personal", // Default
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const { amount, type, category, division, description, date } = formData;

  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      await axios.post(`${API_URL}/transactions`, formData, config);
      toast.success("Transaction Added! 🎉");
      refreshData(); // Refresh the dashboard
      onClose(); // Close the modal

      // Reset form
      setFormData({
        amount: "",
        type: "expense",
        category: "",
        division: "Personal",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      toast.error("Failed to add transaction");
    }
  };

  // Categories list based on type
  const categories =
    type === "income"
      ? ["Salary", "Freelance", "Investment", "Other"]
      : [
          "Food",
          "Transport",
          "Rent",
          "Utilities",
          "Entertainment",
          "Health",
          "Other",
        ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-md overflow-hidden border shadow-2xl bg-slate-900 border-slate-800 rounded-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white">Add Transaction</h2>
            <button
              onClick={onClose}
              className="transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-4">
            {/* Type Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-slate-950">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "income" })}
                className={`py-2 rounded-md text-sm font-medium transition-all ${type === "income" ? "bg-emerald-500/10 text-emerald-500 shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "expense" })}
                className={`py-2 rounded-md text-sm font-medium transition-all ${type === "expense" ? "bg-red-500/10 text-red-500 shadow-sm" : "text-slate-400 hover:text-slate-200"}`}
              >
                Expense
              </button>
            </div>

            {/* Amount */}
            <div>
              <label className="block mb-1 text-xs font-medium text-slate-400">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500">₹</span>
                <input
                  type="number"
                  name="amount"
                  value={amount}
                  onChange={onChange}
                  placeholder="0.00"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-8 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Category & Date Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-xs font-medium text-slate-400">
                  Category
                </label>
                <select
                  name="category"
                  value={category}
                  onChange={onChange}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="">Select</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 text-xs font-medium text-slate-400">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={date}
                  onChange={onChange}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Division Toggle (Office/Personal) */}
            <div>
              <label className="block mb-2 text-xs font-medium text-slate-400">
                Division
              </label>
              <div className="flex gap-4">
                <label
                  className={`flex items-center gap-2 cursor-pointer p-3 rounded-lg border transition-all flex-1 ${division === "Office" ? "border-blue-500 bg-blue-500/10" : "border-slate-800 bg-slate-950"}`}
                >
                  <input
                    type="radio"
                    name="division"
                    value="Office"
                    checked={division === "Office"}
                    onChange={onChange}
                    className="hidden"
                  />
                  <Building
                    className={`h-4 w-4 ${division === "Office" ? "text-blue-400" : "text-slate-500"}`}
                  />
                  <span
                    className={`text-sm ${division === "Office" ? "text-blue-100" : "text-slate-400"}`}
                  >
                    Office
                  </span>
                </label>

                <label
                  className={`flex items-center gap-2 cursor-pointer p-3 rounded-lg border transition-all flex-1 ${division === "Personal" ? "border-purple-500 bg-purple-500/10" : "border-slate-800 bg-slate-950"}`}
                >
                  <input
                    type="radio"
                    name="division"
                    value="Personal"
                    checked={division === "Personal"}
                    onChange={onChange}
                    className="hidden"
                  />
                  <User
                    className={`h-4 w-4 ${division === "Personal" ? "text-purple-400" : "text-slate-500"}`}
                  />
                  <span
                    className={`text-sm ${division === "Personal" ? "text-purple-100" : "text-slate-400"}`}
                  >
                    Personal
                  </span>
                </label>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="flex items-center justify-center w-full gap-2 py-3 mt-2 font-bold text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-blue-500/20"
            >
              <Check className="w-5 h-5" /> Save Transaction
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TransactionModal;
