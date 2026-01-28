import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { User, Mail, Phone, CreditCard, Calendar, Edit2, Save, X } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get("/students/me");
      setProfile(response.data);
      setFormData({
        firstName: response.data.firstName || "",
        lastName: response.data.lastName || "",
        email: response.data.email || "",
        phone: response.data.phone || "",
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch("/students/me", formData);
      await loadProfile();
      setEditing(false);
      alert("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      email: profile.email || "",
      phone: profile.phone || "",
    });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
          <p className="mt-1 text-gray-600">Manage your personal information</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 rounded-lg bg-red-800 px-4 py-2 text-sm font-medium text-white hover:bg-red-900"
          >
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-red-800 px-4 py-2 text-sm font-medium text-white hover:bg-red-900 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="rounded-xl bg-white p-8 shadow-sm border border-gray-200">
        {/* Avatar */}
        <div className="mb-8 flex items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-800 to-red-900 text-white shadow-lg">
            <User className="h-12 w-12" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{profile.name}</h3>
            <p className="text-sm text-gray-600">{profile.studentNumber}</p>
            <span className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              STUDENT
            </span>
          </div>
        </div>

        {/* Information */}
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <User className="h-4 w-4" />
              Full Name
            </label>
            {editing ? (
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>
            ) : (
              <p className="rounded-lg bg-gray-50 px-4 py-3 text-gray-800">
                {profile.firstName} {profile.lastName}
              </p>
            )}
          </div>

          {/* Student Number */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <CreditCard className="h-4 w-4" />
              Student Number
            </label>
            <p className="rounded-lg bg-gray-50 px-4 py-3 text-gray-800">
              {profile.studentNumber}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Student number cannot be changed
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Mail className="h-4 w-4" />
              Email Address
            </label>
            {editing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            ) : (
              <p className="rounded-lg bg-gray-50 px-4 py-3 text-gray-800">
                {profile.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Phone className="h-4 w-4" />
              Contact Number
            </label>
            {editing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                placeholder="09123456789"
              />
            ) : (
              <p className="rounded-lg bg-gray-50 px-4 py-3 text-gray-800">
                {profile.phone || "Not provided"}
              </p>
            )}
          </div>

          {/* Account Created */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Calendar className="h-4 w-4" />
              Account Created
            </label>
            <p className="rounded-lg bg-gray-50 px-4 py-3 text-gray-800">
              {new Date(profile.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Requests</p>
          <p className="mt-2 text-3xl font-bold text-red-800">
            {profile._count?.requests || 0}
          </p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Approved</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {profile.requests?.filter((r) => r.status === "APPROVED").length || 0}
          </p>
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Pending</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {profile.requests?.filter((r) => 
              r.status === "FOR_EVALUATION" || r.status === "PENDING"
            ).length || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
