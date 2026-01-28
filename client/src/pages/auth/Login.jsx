import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { GraduationCap, Eye, EyeOff, LogIn } from "lucide-react";
import { useState } from "react";

export default function Login() {
  const { register, handleSubmit, formState } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    try {
      setError("");
      const user = await login(data.email, data.password);
      if (user.role === "STUDENT") return navigate("/student");
      return navigate("/staff");
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Account does not exist. Please create an account.");
      } else if (err.response?.status === 401) {
        setError("Incorrect password. Please check your spelling.");
      } else {
        setError("Login failed. Please try again later.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-red-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-800 shadow-lg">
            <GraduationCap className="h-10 w-10 text-yellow-400" />
          </div>
          <h1 className="text-4xl font-bold text-white">COERTS</h1>
          <p className="mt-2 text-sm text-red-100">
            Centralized Online Enrollment Request & Tracking System
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-white/95 backdrop-blur p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
            <p className="mt-1 text-sm text-gray-600">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200">
              <p className="font-semibold">Login Failed</p>
              <p>{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                type="email"
                placeholder="you@example.com"
                {...register("email", { required: true })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password", { required: true })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-800 py-3 font-semibold text-white shadow-md transition hover:bg-red-900 disabled:opacity-50"
              type="submit"
              disabled={formState.isSubmitting}
            >
              <LogIn className="h-5 w-5" />
              {formState.isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              className="font-medium text-red-800 hover:text-red-900"
              onClick={() => navigate("/register")}
            >
              Create account
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-red-100">
          © 2026 PUP Computer Engineering Department
        </p>
      </div>
    </div>
  );
}
