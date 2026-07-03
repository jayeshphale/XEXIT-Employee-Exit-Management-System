import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Provider } from "react-redux";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { Toaster } from "react-hot-toast";

import { store, useAppSelector, useAppDispatch } from "./store";
import { getThemeOptions } from "./theme";
import Layout from "./components/Layout";

// Import Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ResignationForm from "./pages/ResignationForm";
import ExitInterview from "./pages/ExitInterview";
import Profile from "./pages/Profile";

// Route Guard for Authenticated Users
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Route Guard for HR Admins only
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { token, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Router Switch helper to redirect / to correct dashboard based on role
function DashboardRedirect() {
  const { user } = useAppSelector((state) => state.auth);

  if (user?.role === "admin") {
    return <AdminDashboard />;
  }
  return <EmployeeDashboard />;
}

function MainAppShell() {
  // Read theme mode preference from LocalStorage or default to dark
  const [mode, setMode] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme_mode");
    return saved === "light" ? "light" : "dark";
  });

  const toggleColorMode = () => {
    setMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme_mode", next);
      return next;
    });
  };

  const currentTheme = React.useMemo(() => createTheme(getThemeOptions(mode)), [mode]);

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: mode === "dark" ? "#1f2937" : "#ffffff",
            color: mode === "dark" ? "#f3f4f6" : "#1f2937",
            border: mode === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.05)",
            fontFamily: "Inter, sans-serif",
            fontSize: "0.9rem",
            fontWeight: 500,
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Employee & Admin Workspaces */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout toggleColorMode={toggleColorMode} mode={mode}>
                  <Routes>
                    {/* Unified Dashboard Route */}
                    <Route path="/dashboard" element={<DashboardRedirect />} />

                    {/* Employee Only Modules */}
                    <Route path="/resignation/new" element={<ResignationForm />} />
                    <Route path="/exit-interview" element={<ExitInterview />} />

                    {/* HR Admin Only Modules */}
                    <Route
                      path="/admin/dashboard"
                      element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/resignations"
                      element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      }
                    />
                    <Route
                      path="/admin/exit-reviews"
                      element={
                        <AdminRoute>
                          <AdminDashboard />
                        </AdminRoute>
                      }
                    />

                    {/* Shared Core Profiles */}
                    <Route path="/profile" element={<Profile />} />

                    {/* Index Fallback Redirects */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <MainAppShell />
    </Provider>
  );
}
