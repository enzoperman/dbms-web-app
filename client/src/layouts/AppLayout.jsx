import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  FilePlus, 
  Users, 
  User, 
  LogOut, 
  GraduationCap 
} from "lucide-react";

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isStudent = user?.role === "STUDENT";
  const isStaff = user?.role === "STAFF" || user?.role === "CHAIR" || user?.role === "ADMIN";

  const studentNav = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/student" },
    { icon: FilePlus, label: "New Request", path: "/student/request/new" },
    { icon: FileText, label: "My Requests", path: "/student/requests" },
    { icon: User, label: "Profile", path: "/student/profile" },
  ];

  const staffNav = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/staff" },
    { icon: FileText, label: "All Requests", path: "/staff/requests" },
    { icon: Users, label: "Students", path: "/staff/students" },
  ];

  const navItems = isStudent ? studentNav : staffNav;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-red-900 via-red-800 to-red-900 text-white">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-red-700 px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-800">
              <GraduationCap className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold">COERTS</h1>
              <p className="text-xs text-red-200">PUP CpE Dept.</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-red-800 text-white shadow-lg"
                      : "text-red-100 hover:bg-red-800/50 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="border-t border-red-700 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-800">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{user?.name || "User"}</p>
                <p className="text-xs text-red-200">
                  {user?.role === "STUDENT" ? "STUDENT" : user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg bg-red-800 px-3 py-2 text-sm font-medium text-red-100 transition hover:bg-red-700 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  );
}
