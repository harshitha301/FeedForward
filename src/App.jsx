
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import FoodDonations from "./pages/FoodDonations.jsx";
import AvailableFood from "./pages/AvailableFood.jsx";
import MyRequests from "./pages/MyRequests.jsx";
import DonorRequests from "./pages/DonorRequests.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import "./index.css";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("feedforward_token");

  let user = {};
  try {
    user = JSON.parse(
      localStorage.getItem("feedforward_user") || "{}"
    );
  } catch {
    user = {};
  }

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/donations"
          element={
            <ProtectedRoute allowedRoles={["donor"]}>
              <FoodDonations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/available-food"
          element={
            <ProtectedRoute allowedRoles={["organization"]}>
              <AvailableFood />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-requests"
          element={
            <ProtectedRoute allowedRoles={["organization"]}>
              <MyRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/donor-requests"
          element={
            <ProtectedRoute allowedRoles={["donor"]}>
              <DonorRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
