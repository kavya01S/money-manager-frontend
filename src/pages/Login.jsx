import { API_URL } from "../api"; // <--- Import this at the top
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, ArrowRight } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const { email, password } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/auth/login`, formData);
      if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
        toast.success("Welcome back! 👋");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden bg-slate-950">
      {/* Background decoration */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-8 border shadow-2xl bg-slate-900/50 backdrop-blur-xl border-slate-800 rounded-2xl"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="flex items-center justify-center w-16 h-16 mx-auto mb-4 shadow-lg bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl shadow-blue-500/30"
          >
            <LogIn className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="mb-2 text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-slate-400">Access your financial dashboard.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-1">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="email"
                className="w-full py-3 pl-10 pr-4 text-white transition-all border rounded-lg bg-slate-950 border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                id="email"
                name="email"
                value={email}
                placeholder="Email Address"
                onChange={onChange}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="password"
                className="w-full py-3 pl-10 pr-4 text-white transition-all border rounded-lg bg-slate-950 border-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                id="password"
                name="password"
                value={password}
                placeholder="Password"
                onChange={onChange}
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="flex items-center justify-center w-full gap-2 px-4 py-3 font-bold text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/30 hover:shadow-blue-500/50"
          >
            Sign In <ArrowRight className="w-5 h-5" />
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-blue-400 transition-colors hover:text-blue-300"
            >
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
