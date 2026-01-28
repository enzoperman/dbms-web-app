import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

export default function StaffDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    pendingEvaluation: 0,
    approved: 0,
    discrepancies: 0,
  });
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [typeBreakdown, setTypeBreakdown] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await api.get("/requests/all");
      const requests = response.data;

      // Stats
      setStats({
        total: requests.length,
        pendingEvaluation: requests.filter((r) => r.status === "FOR_EVALUATION")
          .length,
        approved: requests.filter((r) => r.status === "APPROVED").length,
        discrepancies: requests.filter((r) => r.status === "DISCREPANCY").length,
      });

      // Status breakdown
      const statusCounts = {
        FOR_EVALUATION: requests.filter((r) => r.status === "FOR_EVALUATION")
          .length,
        DISCREPANCY: requests.filter((r) => r.status === "DISCREPANCY").length,
        APPROVED: requests.filter((r) => r.status === "APPROVED").length,
      };
      setStatusBreakdown([
        { label: "FOR EVALUATION", count: statusCounts.FOR_EVALUATION, color: "bg-purple-500" },
        { label: "DISCREPANCY", count: statusCounts.DISCREPANCY, color: "bg-orange-500" },
        { label: "APPROVED", count: statusCounts.APPROVED, color: "bg-green-500" },
      ]);

      // Type breakdown
      const typeCounts = {
        OVERLOAD: requests.filter((r) => r.requestType === "OVERLOAD").length,
        OVERRIDE: requests.filter((r) => r.requestType === "OVERRIDE").length,
        MANUAL_TAGGING: requests.filter((r) => r.requestType === "MANUAL_TAGGING")
          .length,
      };
      setTypeBreakdown([
        { label: "OVERLOAD", count: typeCounts.OVERLOAD },
        { label: "OVERRIDE", count: typeCounts.OVERRIDE },
        { label: "MANUAL TAGGING", count: typeCounts.MANUAL_TAGGING },
      ]);

      setRecentRequests(requests.slice(0, 3));
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      FOR_EVALUATION: "bg-purple-100 text-purple-700",
      PENDING: "bg-yellow-100 text-yellow-700",
      DISCREPANCY: "bg-orange-100 text-orange-700",
      APPROVED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
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
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Staff Dashboard</h2>
        <p className="mt-1 text-gray-600">
          Overview of enrollment requests and status
        </p>
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
              <p className="text-3xl font-bold text-gray-800">
                {stats.pendingEvaluation}
              </p>
              <p className="text-sm text-gray-600">Pending Evaluation</p>
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
              <p className="text-3xl font-bold text-gray-800">
                {stats.discrepancies}
              </p>
              <p className="text-sm text-gray-600">Discrepancies</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Breakdown */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
          <h3 className="mb-4 text-lg font-bold text-gray-800">Status Breakdown</h3>
          <div className="space-y-4">
            {statusBreakdown.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{item.label}</span>
                  <span className="font-semibold text-gray-800">{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{
                      width: `${stats.total ? (item.count / stats.total) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Request Type */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
          <h3 className="mb-4 text-lg font-bold text-gray-800">By Request Type</h3>
          <div className="space-y-4">
            {typeBreakdown.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"
              >
                <span className="font-medium text-gray-700">{item.label}</span>
                <span className="text-2xl font-bold text-red-800">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">Recent Requests</h3>
          <button
            onClick={() => navigate("/staff/requests")}
            className="flex items-center gap-1 text-sm font-medium text-red-800 hover:text-red-900"
          >
            View All <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {recentRequests.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No requests available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((request) => (
              <div
                key={request.id}
                onClick={() => navigate(`/staff/requests/${request.id}`)}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {request.student?.name || "Unknown Student"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {request.student?.studentNumber || "N/A"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(
                    request.status
                  )}`}
                >
                  {getStatusLabel(request.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
