import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  FileText,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";

export default function MyRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    loadRequests();
    // Poll for updates every 5 seconds
    const interval = setInterval(loadRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchQuery, statusFilter, typeFilter]);

  const loadRequests = async () => {
    try {
      const response = await api.get("/requests");
      setRequests(response.data);
    } catch (error) {
      console.error("Failed to load requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    // Status filter
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== "ALL") {
      filtered = filtered.filter((r) => r.requestType === typeFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.requestType.toLowerCase().includes(query) ||
          r.semester.toLowerCase().includes(query) ||
          r.status.toLowerCase().includes(query) ||
          r.subjects?.some(
            (s) =>
              s.code.toLowerCase().includes(query) ||
              s.title.toLowerCase().includes(query)
          )
      );
    }

    setFilteredRequests(filtered);
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

  const getStatusIcon = (status) => {
    const icons = {
      FOR_EVALUATION: Clock,
      PENDING: Clock,
      DISCREPANCY: AlertTriangle,
      APPROVED: CheckCircle,
      REJECTED: XCircle,
    };
    const Icon = icons[status] || Clock;
    return <Icon className="h-5 w-5" />;
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
      <div>
        <h2 className="text-3xl font-bold text-gray-800">My Requests</h2>
        <p className="mt-1 text-gray-600">
          View and track all your enrollment requests
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="FOR_EVALUATION">For Evaluation</option>
              <option value="PENDING">Pending</option>
              <option value="DISCREPANCY">Discrepancy</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option value="ALL">All Types</option>
              <option value="OVERLOAD">Overload</option>
              <option value="OVERRIDE">Override</option>
              <option value="MANUAL_TAGGING">Manual Tagging</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredRequests.length} of {requests.length} requests
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-gray-200">
            <FileText className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2 text-gray-500">No requests found</p>
            <button
              onClick={() => navigate("/student/request/new")}
              className="mt-4 text-sm font-medium text-red-800 hover:text-red-900"
            >
              Create your first request
            </button>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              onClick={() => navigate(`/student/requests/${request.id}`)}
              className="cursor-pointer rounded-xl bg-white p-6 shadow-sm border border-gray-200 transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-red-100 p-2">
                      {getStatusIcon(request.status)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {request.requestType.replace("_", " ")} Request
                      </h3>
                      <p className="text-sm text-gray-600">
                        {request.semester} • Submitted {formatDate(request.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold text-gray-500">
                      SUBJECTS ({request.subjects?.length || 0})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {request.subjects?.map((subject, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                        >
                          {subject.code}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Remarks */}
                  {request.remarks && (
                    <div className="mt-3 rounded-lg bg-gray-50 p-3">
                      <p className="text-xs font-semibold text-gray-600">
                        Latest Remarks:
                      </p>
                      <p className="mt-1 text-sm text-gray-700">
                        {request.remarks}
                      </p>
                    </div>
                  )}
                </div>

                <div className="ml-4 text-right">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${getStatusBadge(
                      request.status
                    )}`}
                  >
                    {getStatusLabel(request.status)}
                  </span>
                  <p className="mt-2 text-xs text-gray-400">
                    Updated {formatDate(request.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
