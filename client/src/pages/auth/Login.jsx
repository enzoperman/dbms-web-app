import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { GraduationCap, Eye, EyeOff, LogIn, Users, UserCog, ArrowLeft } from "lucide-react";
import { useState } from "react";

const ROLE_OPTIONS = [
  {
    id: "STUDENT",
    title: "Student",
    description: "Submit and track enrollment requests",
    icon: GraduationCap,
    color: "bg-blue-500",
  },
  {
    id: "STAFF",
    title: "Staff",
    description: "Process and manage student requests",
    icon: Users,
    color: "bg-green-500",
  },
  {
    id: "CHAIR",
    title: "Department Chair",
    description: "Oversee and approve enrollment requests",
    icon: UserCog,
    color: "bg-purple-500",
  },
];

export default function Login() {
  const { register, handleSubmit, formState } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [step, setStep] = useState(1); // 1 = role selection, 2 = login form

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

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep(2);
    setError("");
  };

  const handleBack = () => {
    setStep(1);
    setSelectedRole(null);
    setError("");
  };

  const selectedRoleInfo = ROLE_OPTIONS.find((r) => r.id === selectedRole);

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

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="rounded-2xl bg-white/95 backdrop-blur p-8 shadow-2xl">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800">Welcome</h2>
              <p className="mt-1 text-sm text-gray-600">
                Select your role to continue
              </p>
            </div>

            <div className="space-y-3">
              {ROLE_OPTIONS.map((role) => {
                const IconComponent = role.icon;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className="flex w-full items-center gap-4 rounded-xl border-2 border-gray-200 p-4 text-left transition-all hover:border-red-500 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-full ${role.color}`}
                    >
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {role.title}
                      </h3>
                      <p className="text-sm text-gray-500">{role.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

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
        )}

        {/* Step 2: Login Form */}
        {step === 2 && (
          <div className="rounded-2xl bg-white/95 backdrop-blur p-8 shadow-2xl">
            {/* Back Button and Role Badge */}
            <div className="mb-6">
              <button
                onClick={handleBack}
                className="mb-4 flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to role selection
              </button>

              {selectedRoleInfo && (
                <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${selectedRoleInfo.color}`}
                  >
                    <selectedRoleInfo.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Signing in as</p>
                    <p className="font-semibold text-gray-800">
                      {selectedRoleInfo.title}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Sign In</h2>
              <p className="mt-1 text-sm text-gray-600">
                Enter your credentials to continue
              </p>
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
        )}

        <p className="mt-6 text-center text-xs text-red-100">
          © 2026 PUP Computer Engineering Department
        </p>
      </div>
    </div>
  );
}
