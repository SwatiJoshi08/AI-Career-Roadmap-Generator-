import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../features/acrg/api/admin.api';
import { dashboardApi } from '../../features/acrg/api/dashboard.api';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ErrorAlert } from '../../components/ui/ErrorAlert';
import { Settings, Users, Target, Map } from 'lucide-react';

export const AdminConsolePage: React.FC = () => {
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: dashboardApi.getDashboard,
  });

  const { data: auditData, isLoading: isAuditLoading, isError: isAuditError } = useQuery({
    queryKey: ['auditEvents'],
    queryFn: () => adminApi.getAuditEvents({ limit: 20 }),
  });

  const { data: analyticsData, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: adminApi.getAnalyticsSummary,
  });

  const stats = statsData || {};
  const events = auditData || [];
  const chartData = analyticsData || []; // Assuming { date: '...', count: number }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-gray-800" />
        <h1 className="text-2xl font-bold text-gray-900">Admin Console</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isStatsLoading ? (
          <>
            <LoadingSkeleton className="h-24" />
            <LoadingSkeleton className="h-24" />
            <LoadingSkeleton className="h-24" />
          </>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Users className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Map className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Roadmaps</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeRoadmaps || 0}</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg"><Target className="w-6 h-6" /></div>
              <div>
                <p className="text-sm font-medium text-gray-500">Active Goals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeGoals || 0}</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Audit Logs */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Recent System Activity</h2>
          {isAuditError && <ErrorAlert message="Failed to load audit logs" />}
          {isAuditLoading && <LoadingSkeleton className="h-96" />}
          {!isAuditLoading && !isAuditError && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.map((ev: any) => (
                      <tr key={ev._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(ev.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ev.actorEmail || ev.actor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                          {ev.action}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Analytics Chart */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Activity Overview</h2>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            {isAnalyticsLoading ? <LoadingSkeleton className="h-64" /> : (
              <div className="flex items-end justify-between h-48 gap-2">
                {chartData.length > 0 ? chartData.map((d: any, i: number) => {
                  const maxCount = Math.max(...chartData.map((x: any) => x.count || 1));
                  const heightPercent = ((d.count || 0) / maxCount) * 100;
                  return (
                    <div key={i} className="flex flex-col items-center flex-1 group">
                      <div className="w-full bg-blue-100 rounded-t-md relative hover:bg-blue-200 transition-colors" style={{ height: `${heightPercent}%`, minHeight: '10%' }}>
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                          {d.count} actions
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 mt-2 rotate-45 origin-left truncate w-full text-center">{d.date}</span>
                    </div>
                  );
                }) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    No analytics data available
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add missing icon for admin

