import { API_URL } from "../api"; // <--- Import this at the top
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion"; // <--- The magic animation library
import { UserPlus, Mail, Lock, User, ArrowRight } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const { firstName, lastName, email, password, confirmPassword } = formData;

  // Validation Logic
  const validate = () => {
    let tempErrors = {};
    if (!firstName) tempErrors.firstName = "First name is required";
    if (!lastName) tempErrors.lastName = "Last name is required";
    if (!email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/))
      tempErrors.email = "Invalid email format";
    if (password.length < 6)
      tempErrors.password = "Password must be at least 6 chars";
    if (password !== confirmPassword)
      tempErrors.confirmPassword = "Passwords do not match";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await axios.post(`${API_URL}/auth/register`, formData);
      if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
        toast.success("Welcome to the club! 🚀");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden bg-slate-950">
      {/* Background decoration (The "Splash" of Blue) */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md p-8 border shadow-2xl bg-slate-900/50 backdrop-blur-xl border-slate-800 rounded-2xl"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="flex items-center justify-center w-16 h-16 mx-auto mb-4 shadow-lg bg-gradient-to-tr from-blue-500 to-blue-700 rounded-xl shadow-blue-500/30"
          >
            <UserPlus className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="mb-2 text-3xl font-bold text-white">Create Account</h1>
          <p className="text-slate-400">
            Join us to manage your wealth efficiently.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={onChange}
                  placeholder="First Name"
                  className={`w-full bg-slate-950 border ${errors.firstName ? "border-red-500" : "border-slate-800"} text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all`}
                />
              </div>
              {errors.firstName && (
                <span className="pl-1 text-xs text-red-500">
                  {errors.firstName}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <input
                type="text"
                name="lastName"
                value={lastName}
                onChange={onChange}
                placeholder="Last Name"
                className={`w-full bg-slate-950 border ${errors.lastName ? "border-red-500" : "border-slate-800"} text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all`}
              />
              {errors.lastName && (
                <span className="pl-1 text-xs text-red-500">
                  {errors.lastName}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="Email Address"
                className={`w-full bg-slate-950 border ${errors.email ? "border-red-500" : "border-slate-800"} text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all`}
              />
            </div>
            {errors.email && (
              <span className="pl-1 text-xs text-red-500">{errors.email}</span>
            )}
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                placeholder="Password"
                className={`w-full bg-slate-950 border ${errors.password ? "border-red-500" : "border-slate-800"} text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all`}
              />
            </div>
            {errors.password && (
              <span className="pl-1 text-xs text-red-500">
                {errors.password}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-500" />
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={onChange}
                placeholder="Confirm Password"
                className={`w-full bg-slate-950 border ${errors.confirmPassword ? "border-red-500" : "border-slate-800"} text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all`}
              />
            </div>
            {errors.confirmPassword && (
              <span className="pl-1 text-xs text-red-500">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="flex items-center justify-center w-full gap-2 px-4 py-3 font-bold text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 shadow-blue-500/30 hover:shadow-blue-500/50"
          >
            Create Account <ArrowRight className="w-5 h-5" />
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-400 transition-colors hover:text-blue-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
