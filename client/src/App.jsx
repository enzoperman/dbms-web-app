import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import NewRequest from "./pages/student/NewRequest.jsx";
import MyRequests from "./pages/student/MyRequests.jsx";
import Profile from "./pages/student/Profile.jsx";
import StaffDashboard from "./pages/staff/StaffDashboard.jsx";
import AllRequests from "./pages/staff/AllRequests.jsx";
import StudentsList from "./pages/staff/StudentsList.jsx";
import RequestDetail from "./pages/staff/RequestDetail.jsx";
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
        <Route path="/register" element={<Register />} />
        
        {/* Student Routes */}
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
          path="/student/request/new"
          element={
            <ProtectedRoute roles={["STUDENT"]}>
              <AppLayout>
                <NewRequest />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/requests"
          element={
            <ProtectedRoute roles={["STUDENT"]}>
              <AppLayout>
                <MyRequests />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/requests/:id"
          element={
            <ProtectedRoute roles={["STUDENT"]}>
              <AppLayout>
                <RequestDetail />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute roles={["STUDENT"]}>
              <AppLayout>
                <Profile />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Staff Routes */}
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
        <Route
          path="/staff/requests"
          element={
            <ProtectedRoute roles={["STAFF", "CHAIR", "ADMIN"]}>
              <AppLayout>
                <AllRequests />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/requests/:id"
          element={
            <ProtectedRoute roles={["STAFF", "CHAIR", "ADMIN"]}>
              <AppLayout>
                <RequestDetail />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/students"
          element={
            <ProtectedRoute roles={["STAFF", "CHAIR", "ADMIN"]}>
              <AppLayout>
                <StudentsList />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
