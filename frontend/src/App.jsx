import { useEffect } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import { useAuthStore } from "./store/authStore";
import History from "./pages/History";
import Humanizer from "./pages/Humanizer";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Pricing from "./pages/Pricing";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import { useThemeStore } from "./store/themeStore";
import VerifyEmail from "./pages/VerifyEmail";
import GlobalBackButton from "./components/ui/GlobalBackButton";

function ProtectedRoute() {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

function PublicAuthRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  if (token) return <Navigate to="/humanizer" replace />;
  return children;
}

function Bootstrap() {
  const token = useAuthStore((state) => state.token);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const initTheme = useThemeStore((state) => state.init);

  useEffect(() => {
    initTheme();
    if (token) fetchMe();
  }, [token, fetchMe, initTheme]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Bootstrap />
      <GlobalBackButton />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/login" element={<PublicAuthRoute><Login /></PublicAuthRoute>} />
        <Route path="/register" element={<PublicAuthRoute><Register /></PublicAuthRoute>} />
        <Route path="/verify-email/:uid/:token" element={<VerifyEmail />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/humanizer" element={<Humanizer />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/dashboard" element={<Navigate to="/humanizer" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
