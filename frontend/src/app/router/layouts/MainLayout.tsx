import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../lib/auth/authStore';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../../../features/acrg/api/notifications.api';
import { Menu, X, Bell, LogOut, LayoutDashboard, Target, BookOpen, Activity, Map as MapIcon, Users, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const MainLayout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsApi.getNotifications({ isRead: false, limit: 1 }),
    enabled: !!currentUser,
    refetchInterval: 60000,
  });

  const unreadCount = (notificationsData as any)?.pagination?.total || 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!currentUser) return [];
    const role = currentUser.role;
    const links: { name: string; href: string; icon: React.ComponentType<{ className?: string }> }[] = [];
    links.push({ name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard });
    if (role === 'student') {
      links.push(
        { name: 'Goals', href: '/goals', icon: Target },
        { name: 'Skills', href: '/skills', icon: BookOpen },
        { name: 'Gap Analysis', href: '/gap-analysis', icon: Activity },
        { name: 'Roadmap', href: '/roadmap', icon: MapIcon }
      );
    } else if (role === 'career_mentor') {
      links.push({ name: 'Mentor Queue', href: '/mentor', icon: Users });
    } else if (role === 'career_content_admin') {
      links.push({ name: 'Admin Console', href: '/admin', icon: Settings });
    }
    return links;
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/dashboard" className="text-xl font-bold text-blue-600">
                  AI Career Roadmap
                </Link>
              </div>
              <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                {navLinks.map((link) => {
                  const isActive = location.pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      className={twMerge(clsx(
                        'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                        isActive
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      ))}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:gap-4">
              <Link
                to="/notifications"
                className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>

              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <span className="text-sm font-medium text-gray-700">{currentUser?.email}</span>
                <button
                  onClick={handleLogout}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200">
            <div className="pt-2 pb-3 space-y-1">
              {navLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={twMerge(clsx(
                      'block pl-3 pr-4 py-2 border-l-4 text-base font-medium',
                      isActive
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                    ))}
                  >
                    <div className="flex items-center gap-2">
                      <link.icon className="w-5 h-5" />
                      {link.name}
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200 px-4">
              <div className="text-base font-medium text-gray-800">{currentUser?.email}</div>
              <div className="text-sm text-gray-500 capitalize">{currentUser?.role?.replace(/_/g, ' ')}</div>
              <button
                onClick={handleLogout}
                className="mt-3 block w-full text-left text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 py-2 px-1 rounded"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};
