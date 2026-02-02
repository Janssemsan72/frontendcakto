// ✅ OTIMIZAÇÃO PERFORMANCE: Componente que só carrega admin quando necessário
// Isso garante que o bundle admin não seja incluído no bundle inicial
import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { ensureE2EAdminStorageAuthorized } from "@/utils/adminE2EBypass";

// ✅ OTIMIZAÇÃO: Todas as importações admin aqui, só carregadas quando este componente é renderizado
const AdminErrorBoundary = lazyWithRetry(() =>
  import("./AdminErrorBoundary").then((m) => ({ default: m.AdminErrorBoundary }))
);
const ProtectedAdminRoute = lazyWithRetry(() =>
  import("./admin/ProtectedAdminRoute").then((m) => ({ default: m.ProtectedAdminRoute }))
);
const AdminLayout = lazyWithRetry(() => import("../pages/admin/AdminLayout"));
const AdminOrders = lazyWithRetry(() => import("../pages/admin/AdminOrders"));
const AdminOrderDetails = lazyWithRetry(() => import("../pages/admin/AdminOrderDetails"));
const AdminSongs = lazyWithRetry(() => import("../pages/admin/AdminSongs"));
const AdminSongDetails = lazyWithRetry(() => import("../pages/admin/AdminSongDetails"));
const AdminLogs = lazyWithRetry(() => import("../pages/admin/AdminLogs"));
const AdminLyrics = lazyWithRetry(() => import("../pages/admin/AdminLyrics"));
const AdminReleases = lazyWithRetry(() => import("../pages/admin/AdminReleases"));
const AdminCollaborators = lazyWithRetry(() => import("../pages/admin/AdminCollaborators"));
const AdminEmails = lazyWithRetry(() => import("../pages/admin/AdminEmails"));
const AdminEmailLogs = lazyWithRetry(() => import("../pages/admin/AdminEmailLogs"));
const AdminPayments = lazyWithRetry(() => import("../pages/admin/AdminPayments"));
const AdminQuizMetrics = lazyWithRetry(() => import("../pages/admin/AdminQuizMetrics"));
const AdminAuth = lazyWithRetry(() => import("../pages/AdminAuth"));
const AdminDashboardRedirect = lazyWithRetry(() => import("./admin/AdminDashboardRedirect"));

const AdminRouteFallback = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

export default function AdminRoutes() {
  return (
    <Suspense fallback={<AdminRouteFallback />}>
      <AdminErrorBoundary>
        <Suspense fallback={<AdminRouteFallback />}>
          <Routes>
          <Route
            path="/auth"
            element={ensureE2EAdminStorageAuthorized() ? <Navigate to="/admin" replace /> : <AdminAuth />}
          />
          <Route 
            path="/" 
            element={
              <Suspense fallback={<AdminRouteFallback />}>
                <AdminLayout />
              </Suspense>
            }
          >
            <Route index element={
              <Suspense fallback={<AdminRouteFallback />}>
                <AdminDashboardRedirect />
              </Suspense>
            } />
            <Route path="offline" element={
              <Suspense fallback={null}>
                {React.createElement(lazyWithRetry(() => import("../pages/admin/Offline")))}
              </Suspense>
            } />
            <Route path="orders" element={
              <Suspense fallback={null}>
                <ProtectedAdminRoute requiredPermission="orders">
                  <AdminOrders />
                </ProtectedAdminRoute>
              </Suspense>
            } />
            <Route path="orders/:id" element={
              <Suspense fallback={null}>
                <ProtectedAdminRoute requiredPermission="orders">
                  <AdminOrderDetails />
                </ProtectedAdminRoute>
              </Suspense>
            } />
            <Route path="payments" element={
              <Suspense fallback={null}>
                <ProtectedAdminRoute requiredPermission="orders">
                  <AdminPayments />
                </ProtectedAdminRoute>
              </Suspense>
            } />
            <Route path="songs" element={
              <Suspense fallback={null}>
                <ProtectedAdminRoute requiredPermission="songs">
                  <AdminSongs />
                </ProtectedAdminRoute>
              </Suspense>
            } />
            <Route path="songs/:id" element={
              <Suspense fallback={null}>
                <ProtectedAdminRoute requiredPermission="songs">
                  <AdminSongDetails />
                </ProtectedAdminRoute>
              </Suspense>
            } />
            <Route path="lyrics" element={
              <Suspense fallback={null}>
                <ProtectedAdminRoute requiredPermission="lyrics">
                  <AdminLyrics />
                </ProtectedAdminRoute>
              </Suspense>
            } />
            <Route path="releases" element={
              <Suspense fallback={null}>
                <ProtectedAdminRoute requiredPermission="releases">
                  <AdminReleases />
                </ProtectedAdminRoute>
              </Suspense>
            } />
            <Route path="emails" element={
              <Suspense fallback={null}>
                <ProtectedAdminRoute requiredPermission="emails">
                  <AdminEmails />
                </ProtectedAdminRoute>
              </Suspense>
            } />
            <Route path="email-logs" element={
              <Suspense fallback={null}>
                <ProtectedAdminRoute requiredPermission="email_logs">
                  <AdminEmailLogs />
                </ProtectedAdminRoute>
              </Suspense>
            } />
            <Route path="quiz-metrics" element={
              <Suspense fallback={null}>
                <ProtectedAdminRoute requiredPermission="dashboard">
                  <AdminQuizMetrics />
                </ProtectedAdminRoute>
              </Suspense>
            } />
            <Route path="collaborators" element={
              <Suspense fallback={null}>
                <ProtectedAdminRoute requiredPermission="collaborators">
                  <AdminCollaborators />
                </ProtectedAdminRoute>
              </Suspense>
            } />
            <Route path="logs" element={
              <Suspense fallback={null}>
                <ProtectedAdminRoute requiredPermission="logs">
                  <AdminLogs />
                </ProtectedAdminRoute>
              </Suspense>
            } />
          </Route>
        </Routes>
        </Suspense>
      </AdminErrorBoundary>
    </Suspense>
  );
}
