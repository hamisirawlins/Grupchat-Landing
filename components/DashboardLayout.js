'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  LogOut, 
  User, 
  Settings, 
  Home,
  BarChart3,
  FolderOpen,
  Bell,
  Menu,
  X
} from 'lucide-react';

export default function DashboardLayout({ children, title, subtitle }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    phone: user?.phone || ''
  });

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Homepage', icon: Home, path: '/dashboard' },
    { id: 'pools', label: 'Pools', icon: FolderOpen, path: '/pools' },
    { id: 'transactions', label: 'Transactions', icon: BarChart3, path: '/transactions' },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: 3, path: '/notifications' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
  ];

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isActivePage = (path) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-80 bg-white border-r border-gray-200 fixed h-full z-50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">GrupChat</span>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Label */}
        <div className="px-6 pb-4">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Dashboard</h2>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="px-4 space-y-1 flex-1 overflow-y-auto">
          {sidebarItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => {
                  router.push(item.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  isActivePage(item.path)
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            </div>
          ))}
        </nav>

        {/* User Profile Section - Sticky to Bottom */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 flex-1 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {(user?.displayName || user?.email)?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-80">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg lg:text-xl font-semibold text-gray-900">
                  {title || `Hey, ${user?.displayName || 'User'}`}
                </h1>
                <p className="text-sm text-gray-500">
                  {subtitle || getCurrentDate()}
                </p>
              </div>
            </div>

          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                <input
                  type="text"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement profile update logic
                  setShowProfileModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
