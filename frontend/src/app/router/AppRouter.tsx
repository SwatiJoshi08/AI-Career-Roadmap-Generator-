import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth/authStore';

// Layouts
import { MainLayout } from './layouts/MainLayout';

// Public Pages
import { LandingPage } from '../../pages/LandingPage';
import { LoginPage } from '../../pages/auth/LoginPage';
import { RegisterPage } from '../../pages/auth/RegisterPage';

// Protected Pages
import { DashboardPage } from '../../pages/DashboardPage';
import { GoalSelectionPage } from '../../pages/GoalSelectionPage';
import { SkillInventoryPage } from '../../pages/SkillInventoryPage';
import { GapAnalysisPage } from '../../pages/GapAnalysisPage';
import { RoadmapPage } from '../../pages/RoadmapPage';
import { NotificationsPage } from '../../pages/NotificationsPage';
import { MentorPage } from '../../pages/MentorPage';
import { AdminConsolePage } from '../../pages/admin/AdminConsolePage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const RoleRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const { currentUser } = useAuth();
  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    return <div className="p-8 text-center text-red-500 font-bold">403 Forbidden — Insufficient Role</div>;
  }
  return <>{children}</>;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes inside MainLayout */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/goals" element={<GoalSelectionPage />} />
          <Route path="/skills" element={<SkillInventoryPage />} />
          <Route path="/gap-analysis" element={<GapAnalysisPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          <Route path="/mentor" element={
            <RoleRoute allowedRoles={['career_mentor']}>
              <MentorPage />
            </RoleRoute>
          } />

          <Route path="/admin" element={
            <RoleRoute allowedRoles={['career_content_admin']}>
              <AdminConsolePage />
            </RoleRoute>
          } />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
