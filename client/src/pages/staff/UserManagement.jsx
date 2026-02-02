import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { UserPlus, Users, UserCog, Trash2, Eye, EyeOff, Shield } from "lucide-react";
import api from "../../services/api";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { register, handleSubmit, reset, formState } = useForm();

  const fetchUsers = async () => {
    try {
      const res = await api.get("/auth/users");
      setUsers(res.data.users);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onSubmit = async (data) => {
    try {
      setError("");
      setSuccess("");
      await api.post("/auth/create-staff", {
        email: data.email,
        password: data.password,
        role: data.role,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      setSuccess(`${data.role} account created successfully!`);
      reset();
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create account");
    }
  };

  const handleDelete = async (userId, userEmail) => {
    if (!confirm(`Are you sure you want to delete ${userEmail}?`)) return;
    
    try {
      await api.delete(`/auth/users/${userId}`);
      setSuccess("User deleted successfully");
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  const staffUsers = users.filter((u) => u.role === "STAFF" || u.role === "CHAIR");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create and manage staff and chairperson accounts
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setError("");
            setSuccess("");
          }}
          className="flex items-center gap-2 rounded-lg bg-red-800 px-4 py-2 font-medium text-white transition hover:bg-red-900"
        >
          <UserPlus className="h-5 w-5" />
          Add New User
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800 border border-green-200">
          {success}
        </div>
      )}

      {/* Create User Form */}
      {showForm && (
        <div className="rounded-xl bg-white p-6 shadow-md border border-gray-200">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Create Staff/Chair Account
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                Password
              </label>
              <div className="relative mt-1">
                <input
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  type={showPassword ? "text" : "password"}
                  {...register("password", { required: true, minLength: 6 })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                {...register("role", { required: true })}
              >
                <option value="STAFF">Staff</option>
                <option value="CHAIR">Department Chair</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={formState.isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-red-800 px-4 py-2 font-medium text-white transition hover:bg-red-900 disabled:opacity-50"
              >
                <UserPlus className="h-5 w-5" />
                {formState.isSubmitting ? "Creating..." : "Create Account"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  reset();
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="rounded-xl bg-white shadow-md border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Staff & Chair Accounts
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading...</div>
        ) : staffUsers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No staff or chair accounts found.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {staffUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      user.role === "CHAIR" ? "bg-purple-100" : "bg-green-100"
                    }`}
                  >
                    {user.role === "CHAIR" ? (
                      <UserCog className={`h-5 w-5 text-purple-600`} />
                    ) : (
                      <Users className={`h-5 w-5 text-green-600`} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.email}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      user.role === "CHAIR"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.role === "CHAIR" ? "Department Chair" : "Staff"}
                  </span>
                  <button
                    onClick={() => handleDelete(user.id, user.email)}
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                    title="Delete user"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
        <div className="flex gap-3">
          <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">About User Management</p>
            <p className="mt-1">
              Only Department Chairs can create and manage staff accounts. Students can
              self-register through the public registration page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
