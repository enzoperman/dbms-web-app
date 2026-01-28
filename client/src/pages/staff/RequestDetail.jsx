import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  ArrowLeft,
  User,
  CreditCard,
  Mail,
  Phone,
  FileText,
  Calendar,
  Clock,
  BookOpen,
  Save,
} from "lucide-react";

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    try {
      const response = await api.get(`/requests/${id}`);
      setRequest(response.data);
      setSelectedStatus(response.data.status);
      setRemarks(response.data.remarks || "");
    } catch (error) {
      console.error("Failed to load request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await api.patch(`/requests/${id}/status`, {
        status: selectedStatus,
        remarks: remarks,
      });
      await loadRequest();
      alert("Status updated successfully");
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status");
    } finally {
      setUpdating(false);
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
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  const isChairOnly = selectedStatus === "APPROVED" || selectedStatus === "REJECTED";
  const canUpdate = user?.role === "ADMIN" || user?.role === "STAFF" || 
    (user?.role === "CHAIR" && isChairOnly);
  const canPerformUpdates = ["STAFF", "CHAIR", "ADMIN"].includes(user?.role);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-gray-500">Request not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <span
          className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${getStatusBadge(
            request.status
          )}`}
        >
          {getStatusLabel(request.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Request Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Student Information */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
            <h3 className="mb-4 text-lg font-bold text-gray-800">
              Student Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gray-100 p-2">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-semibold text-gray-800">
                    {request.student?.name || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gray-100 p-2">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Student Number</p>
                  <p className="font-semibold text-gray-800">
                    {request.student?.studentNumber || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gray-100 p-2">
                  <Mail className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-semibold text-gray-800">
                    {request.student?.email || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gray-100 p-2">
                  <Phone className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Contact</p>
                  <p className="font-semibold text-gray-800">
                    {request.student?.phone || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
            <h3 className="mb-4 text-lg font-bold text-gray-800">Request Details</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gray-100 p-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="font-semibold text-gray-800">
                    {request.requestType.replace("_", " ")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gray-100 p-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Semester</p>
                  <p className="font-semibold text-gray-800">{request.semester}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gray-100 p-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Submitted</p>
                  <p className="font-semibold text-gray-800">
                    {formatDate(request.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Subjects */}
            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold text-gray-700">
                Requested Subjects ({request.subjects?.length || 0})
              </p>
              <div className="space-y-3">
                {request.subjects?.map((subject, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg border border-gray-200 p-4"
                  >
                    <div className="rounded-lg bg-red-100 p-2">
                      <BookOpen className="h-5 w-5 text-red-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {subject.code} ({subject.section || "BScpE 4-1"})
                      </p>
                      <p className="text-sm text-gray-600">{subject.title}</p>
                      <p className="mt-1 text-xs text-gray-500">{subject.schedule}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Status Update */}
        <div className="space-y-6">
          {/* Update Status */}
          {canPerformUpdates && (
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
              <h3 className="mb-4 text-lg font-bold text-gray-800">Update Status</h3>
              <div className="space-y-3">
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 ${
                    selectedStatus === "PENDING"
                      ? "border-yellow-500 bg-yellow-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    value="PENDING"
                    checked={selectedStatus === "PENDING"}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="h-4 w-4 text-yellow-600"
                  />
                  <span className="font-medium text-gray-800">PENDING</span>
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 ${
                    selectedStatus === "DISCREPANCY"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    value="DISCREPANCY"
                    checked={selectedStatus === "DISCREPANCY"}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="h-4 w-4 text-orange-600"
                  />
                  <span className="font-medium text-gray-800">DISCREPANCY</span>
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 ${
                    selectedStatus === "APPROVED"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                  } ${!canUpdate && isChairOnly ? "opacity-50" : ""}`}
                >
                  <input
                    type="radio"
                    value="APPROVED"
                    checked={selectedStatus === "APPROVED"}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="h-4 w-4 text-green-600"
                    disabled={!canUpdate && isChairOnly}
                  />
                  <div>
                    <span className="font-medium text-gray-800">APPROVED</span>
                    {isChairOnly && (
                      <p className="text-xs text-gray-500">Chairperson only</p>
                    )}
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 ${
                    selectedStatus === "REJECTED"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200"
                  } ${!canUpdate && isChairOnly ? "opacity-50" : ""}`}
                >
                  <input
                    type="radio"
                    value="REJECTED"
                    checked={selectedStatus === "REJECTED"}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="h-4 w-4 text-red-600"
                    disabled={!canUpdate && isChairOnly}
                  />
                  <div>
                    <span className="font-medium text-gray-800">REJECTED</span>
                    {isChairOnly && (
                      <p className="text-xs text-gray-500">Chairperson only</p>
                    )}
                  </div>
                </label>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Remarks / Feedback
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  placeholder="Add remarks or feedback for the student..."
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={updating || selectedStatus === request.status}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-red-800 py-3 font-semibold text-white hover:bg-red-900 disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                {updating ? "Updating..." : "Update Status"}
              </button>
            </div>
          )}

          {/* Current Remarks */}
          {request.remarks && (
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
              <h3 className="mb-2 text-lg font-bold text-gray-800">
                Current Remarks
              </h3>
              <p className="text-sm text-gray-600">{request.remarks}</p>
              <p className="mt-2 text-xs text-gray-400">
                Last updated: {formatDate(request.updatedAt)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
