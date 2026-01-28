import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  Users,
  Search,
  Mail,
  Phone,
  CreditCard,
  FileText,
  Download,
} from "lucide-react";

export default function StudentsList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchQuery]);

  const loadStudents = async () => {
    try {
      const response = await api.get("/students");
      setStudents(response.data);
    } catch (error) {
      console.error("Failed to load students:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.studentNumber.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query)
      );
    }

    setFilteredStudents(filtered);
  };

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Student Number",
      "Email",
      "Phone",
      "Total Requests",
      "Pending",
      "Approved",
    ];
    const rows = filteredStudents.map((s) => [
      s.name,
      s.studentNumber,
      s.email,
      s.phone || "N/A",
      s._count?.requests || 0,
      s.requests?.filter(
        (r) => r.status === "FOR_EVALUATION" || r.status === "PENDING"
      ).length || 0,
      s.requests?.filter((r) => r.status === "APPROVED").length || 0,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students_${new Date().toISOString().split("T")[0]}.csv`;
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
          <h2 className="text-3xl font-bold text-gray-800">Students</h2>
          <p className="mt-1 text-gray-600">View and manage student information</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, student number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      </div>

      {/* Students Grid */}
      {filteredStudents.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm border border-gray-200">
          <Users className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-gray-500">No students found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 transition hover:shadow-md"
            >
              {/* Avatar and Name */}
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-800 to-red-900 text-white">
                  <Users className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{student.name}</h3>
                  <p className="text-sm text-gray-600">{student.studentNumber}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{student.email}</span>
                </div>
                {student.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{student.phone}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-gray-800">
                    {student._count?.requests || 0}
                  </p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-yellow-600">
                    {student.requests?.filter(
                      (r) =>
                        r.status === "FOR_EVALUATION" || r.status === "PENDING"
                    ).length || 0}
                  </p>
                  <p className="text-xs text-gray-600">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-green-600">
                    {student.requests?.filter((r) => r.status === "APPROVED")
                      .length || 0}
                  </p>
                  <p className="text-xs text-gray-600">Approved</p>
                </div>
              </div>

              {/* View Requests Button */}
              {student._count?.requests > 0 && (
                <button
                  onClick={() => {
                    // Navigate to all requests filtered by this student
                    navigate("/staff/requests");
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-800 transition hover:bg-red-100"
                >
                  <FileText className="h-4 w-4" />
                  View Requests
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
