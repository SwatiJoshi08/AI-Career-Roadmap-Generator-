import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../lib/auth/authStore';
import { dashboardApi } from '../features/acrg/api/dashboard.api';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorAlert } from '../components/ui/ErrorAlert';
import { Map, Target, BookOpen, Bell, Users, Activity } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboard,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <LoadingSkeleton key={i} className="h-32" />)}
      </div>
    );
  }

  if (isError) {
    return <ErrorAlert message="Failed to load dashboard data." onRetry={refetch} />;
  }

  const role = currentUser?.role;
  const stats = data?.data || {};

  const renderStudentDashboard = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-blue-900 mb-2">Welcome back, {currentUser?.email}!</h2>
        <p className="text-blue-800">
          {stats.nextAction || 'Ready to plan your next career move? Check out your roadmap.'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Roadmaps" value={stats.activeRoadmaps ?? 0} icon={Map} color="blue" />
        <StatCard title="Pending Milestones" value={stats.pendingMilestones ?? 0} icon={Target} color="yellow" />
        <StatCard title="Skills Added" value={stats.skillsAdded ?? 0} icon={BookOpen} color="green" />
        <StatCard title="Unread Notifications" value={stats.unreadNotifications ?? 0} icon={Bell} color="red" />
      </div>
    </div>
  );

  const renderMentorDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard title="Pending Reviews" value={stats.pendingReviews ?? 0} icon={Users} color="blue" />
    </div>
  );

  const renderPlacementOfficerDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <StatCard title="Total Students" value={stats.totalStudents ?? 0} icon={Users} color="blue" />
      <StatCard title="Roadmap Activation Rate" value={`${stats.activationRate ?? 0}%`} icon={Activity} color="green" />
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Users" value={stats.totalUsers ?? 0} icon={Users} color="blue" />
      <StatCard title="Active Goals" value={stats.activeGoals ?? 0} icon={Target} color="green" />
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      {role === 'student' && renderStudentDashboard()}
      {role === 'career_mentor' && renderMentorDashboard()}
      {role === 'placement_officer' && renderPlacementOfficerDashboard()}
      {role === 'career_content_admin' && renderAdminDashboard()}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => {
  const colorMap: any = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
      <div className={`p-3 rounded-lg ${colorMap[color]} mr-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};
