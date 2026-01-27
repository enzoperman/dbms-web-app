import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import StaffDashboard from "./pages/staff/StaffDashboard.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import AppLayout from "./layouts/AppLayout.jsx";

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/student"
          element={
            <ProtectedRoute roles={["STUDENT"]}>
              <AppLayout>
                <StudentDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute roles={["STAFF", "CHAIR", "ADMIN"]}>
              <AppLayout>
                <StaffDashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
