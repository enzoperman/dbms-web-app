import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  FilePlus,
  ArrowRight,
} from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    actionRequired: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await api.get("/requests");
      const requests = response.data;

      setStats({
        total: requests.length,
        pending: requests.filter((r) => r.status === "FOR_EVALUATION").length,
        approved: requests.filter((r) => r.status === "APPROVED").length,
        actionRequired: requests.filter((r) => r.status === "DISCREPANCY").length,
      });

      setRecentRequests(requests.slice(0, 3));
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      FOR_EVALUATION: "bg-purple-100 text-purple-700 border-purple-300",
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-300",
      DISCREPANCY: "bg-orange-100 text-orange-700 border-orange-300",
      APPROVED: "bg-green-100 text-green-700 border-green-300",
      REJECTED: "bg-red-100 text-red-700 border-red-300",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const getStatusLabel = (status) => {
    const labels = {
      FOR_EVALUATION: "FOR EVALUATION",
      PENDING: "PENDING",
      DISCREPANCY: "DISCREPANCY",
      APPROVED: "APPROVED",
      REJECTED: "REJECTED",
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Welcome back, {user?.name?.split(",")[0] || "Student"}!
          </h2>
          <p className="mt-1 text-gray-600">
            Manage your enrollment requests from your dashboard.
          </p>
        </div>
        <button
          onClick={() => navigate("/student/request/new")}
          className="flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2.5 font-semibold text-gray-900 shadow-md transition hover:bg-yellow-500"
        >
          <FilePlus className="h-5 w-5" />
          New Request
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-red-100 p-3">
              <FileText className="h-6 w-6 text-red-700" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Requests</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-yellow-100 p-3">
              <Clock className="h-6 w-6 text-yellow-700" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-green-100 p-3">
              <CheckCircle className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{stats.approved}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-orange-100 p-3">
              <AlertTriangle className="h-6 w-6 text-orange-700" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{stats.actionRequired}</p>
              <p className="text-sm text-gray-600">Action Required</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Recent Requests</h3>
          <button
            onClick={() => navigate("/student/requests")}
            className="text-sm font-medium text-red-800 hover:text-red-900"
          >
            View All
          </button>
        </div>

        {recentRequests.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No requests yet</p>
            <button
              onClick={() => navigate("/student/request/new")}
              className="mt-4 text-sm font-medium text-red-800 hover:text-red-900"
            >
              Create your first request
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((request) => (
              <div
                key={request.id}
                onClick={() => navigate(`/student/requests/${request.id}`)}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-purple-100 p-2">
                    <Clock className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {request.requestType.replace("_", " ")} Request
                    </p>
                    <p className="text-sm text-gray-500">
                      {request.semester} • {formatDate(request.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(
                      request.status
                    )}`}
                  >
                    {getStatusLabel(request.status)}
                  </span>
                  <span className="text-sm text-gray-400">
                    {formatDate(request.updatedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
