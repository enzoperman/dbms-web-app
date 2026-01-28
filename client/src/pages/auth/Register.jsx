import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { GraduationCap, UserPlus } from "lucide-react";

export default function Register() {
  const { register, handleSubmit, formState } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await api.post("/auth/register", {
        email: data.email,
        password: data.password,
        role: "STUDENT",
        firstName: data.firstName,
        lastName: data.lastName,
        studentNo: data.studentNumber,
        phone: data.phone
      });
      navigate("/login");
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      alert(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-red-900 px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-800 shadow-lg">
            <GraduationCap className="h-10 w-10 text-yellow-400" />
          </div>
          <h1 className="text-4xl font-bold text-white">COERTS</h1>
          <p className="mt-2 text-sm text-red-100">
            Centralized Online Enrollment Request & Tracking System
          </p>
        </div>

        <div className="rounded-2xl bg-white/95 backdrop-blur p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
            <p className="mt-1 text-sm text-gray-600">
              Register as a student to submit requests
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  type="text"
                  {...register("firstName", { required: true })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  type="text"
                  {...register("lastName", { required: true })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Student Number
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                type="text"
                {...register("studentNumber", { required: true })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                type="email"
                {...register("email", { required: true })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contact Number
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                type="tel"
                placeholder="09123456789"
                {...register("phone", { required: true })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                type="password"
                {...register("password", { required: true, minLength: 6 })}
              />
              <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
            </div>

            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-800 py-3 font-semibold text-white hover:bg-red-900 disabled:opacity-50"
              type="submit"
              disabled={formState.isSubmitting}
            >
              <UserPlus className="h-5 w-5" />
              {formState.isSubmitting ? "Creating..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button
              className="font-medium text-red-800 hover:text-red-900"
              onClick={() => navigate("/login")}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
