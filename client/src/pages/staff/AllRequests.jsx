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
  Download,
} from "lucide-react";

export default function AllRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    filterAndSortRequests();
  }, [requests, searchQuery, statusFilter, typeFilter, sortBy]);

  const loadRequests = async () => {
    try {
      const response = await api.get("/requests/all");
      setRequests(response.data);
    } catch (error) {
      console.error("Failed to load requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRequests = () => {
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
          r.student?.name.toLowerCase().includes(query) ||
          r.student?.studentNumber.toLowerCase().includes(query) ||
          r.requestType.toLowerCase().includes(query) ||
          r.semester.toLowerCase().includes(query) ||
          r.subjects?.some(
            (s) =>
              s.code.toLowerCase().includes(query) ||
              s.title.toLowerCase().includes(query)
          )
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "updated":
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        case "student":
          return (a.student?.name || "").localeCompare(b.student?.name || "");
        default:
          return 0;
      }
    });

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

  const exportToCSV = () => {
    const headers = [
      "Student Name",
      "Student Number",
      "Request Type",
      "Semester",
      "Status",
      "Subjects",
      "Submitted",
      "Updated",
    ];
    const rows = filteredRequests.map((r) => [
      r.student?.name || "N/A",
      r.student?.studentNumber || "N/A",
      r.requestType,
      r.semester,
      r.status,
      r.subjects?.map((s) => s.code).join("; ") || "",
      formatDate(r.createdAt),
      formatDate(r.updatedAt),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `requests_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
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
          <h2 className="text-3xl font-bold text-gray-800">All Requests</h2>
          <p className="mt-1 text-gray-600">
            Review and manage all enrollment requests
          </p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="updated">Recently Updated</option>
            <option value="student">Student Name (A-Z)</option>
          </select>
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
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              onClick={() => navigate(`/staff/requests/${request.id}`)}
              className="cursor-pointer rounded-xl bg-white p-6 shadow-sm border border-gray-200 transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-red-100 p-2">
                      {getStatusIcon(request.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">
                            {request.student?.name || "Unknown Student"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {request.student?.studentNumber || "N/A"}
                          </p>
                        </div>
                        <span
                          className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${getStatusBadge(
                            request.status
                          )}`}
                        >
                          {getStatusLabel(request.status)}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="font-medium">
                          {request.requestType.replace("_", " ")}
                        </span>
                        <span>•</span>
                        <span>{request.semester}</span>
                        <span>•</span>
                        <span>{request.subjects?.length || 0} subjects</span>
                      </div>

                      {/* Subjects */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {request.subjects?.slice(0, 4).map((subject, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                          >
                            {subject.code}
                          </span>
                        ))}
                        {request.subjects?.length > 4 && (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            +{request.subjects.length - 4} more
                          </span>
                        )}
                      </div>

                      {/* Remarks */}
                      {request.remarks && (
                        <div className="mt-3 rounded-lg bg-gray-50 p-3">
                          <p className="text-xs font-semibold text-gray-600">
                            Latest Remarks:
                          </p>
                          <p className="mt-1 text-sm text-gray-700">
                            {request.remarks.length > 100
                              ? `${request.remarks.substring(0, 100)}...`
                              : request.remarks}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
                <span>Submitted {formatDate(request.createdAt)}</span>
                <span>Updated {formatDate(request.updatedAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
