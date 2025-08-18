'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { dashboardAPI, handleApiError } from '@/lib/api';
import { 
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  Smartphone,
  Mail,
  Lock,
  Globe,
  Moon,
  Sun,
  Volume2,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Settings state
  const [profileSettings, setProfileSettings] = useState({
    displayName: '',
    email: '',
    phone: '',
    language: 'en',
    timezone: 'Africa/Nairobi'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    in_app: true,
    fcm: true,
    email: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: '30',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [paymentSettings, setPaymentSettings] = useState({
    defaultPaymentMethod: 'mpesa',
    mpesaNumber: '+254712345678',
    autoContribution: false,
    contributionAmount: '5000',
    contributionFrequency: 'monthly'
  });

  // Load settings function
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load profile settings
      const profileResponse = await dashboardAPI.getUserProfile();
      if (profileResponse.success) {
        const userData = profileResponse.data.user;
        setProfileSettings(prev => ({
          ...prev,
          displayName: userData.displayName || '',
          email: userData.email || '',
          phone: userData.phone || ''
        }));
      }

      // Load notification settings
      const notificationResponse = await dashboardAPI.getNotificationSettings();
      if (notificationResponse.success) {
        setNotificationSettings(notificationResponse.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setError('Failed to load settings');
      setLoading(false);
    }
  };

  // Memoized functions - moved to top level to fix hooks order
  const handleSave = async (settingsType) => {
    setSaveStatus('saving');
    
    try {
      if (settingsType === 'profile') {
        const response = await dashboardAPI.updateProfile({
          displayName: profileSettings.displayName,
          phone: profileSettings.phone
        });
        
        if (response.success) {
          setSaveStatus('success');
          setTimeout(() => setSaveStatus(''), 3000);
        } else {
          setSaveStatus('error');
          setTimeout(() => setSaveStatus(''), 3000);
        }
      } else if (settingsType === 'notifications') {
        const response = await dashboardAPI.updateNotificationSettings(notificationSettings);
        
        if (response.success) {
          setSaveStatus('success');
          setTimeout(() => setSaveStatus(''), 3000);
        } else {
          setSaveStatus('error');
          setTimeout(() => setSaveStatus(''), 3000);
        }
      } else if (settingsType === 'payment') {
        // For payment settings, simulate API call for now
        setTimeout(() => {
          setSaveStatus('success');
          setTimeout(() => setSaveStatus(''), 3000);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const ProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
            <input
              type="text"
              value={profileSettings.displayName}
              onChange={(e) => setProfileSettings({...profileSettings, displayName: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={profileSettings.phone}
              onChange={(e) => setProfileSettings({...profileSettings, phone: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={profileSettings.email}
              disabled
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed for security reasons</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={profileSettings.language}
              onChange={(e) => setProfileSettings({...profileSettings, language: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="en">English</option>
              <option value="sw">Kiswahili</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
            <select
              value={profileSettings.timezone}
              onChange={(e) => setProfileSettings({...profileSettings, timezone: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton onClick={() => handleSave('profile')} />
      </div>
    </div>
  );

  const NotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Channels</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">In-App Notifications</p>
                <p className="text-sm text-gray-500">Receive notifications within the app</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.in_app}
                onChange={(e) => setNotificationSettings({...notificationSettings, in_app: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">Receive notifications on your device</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.fcm}
                onChange={(e) => setNotificationSettings({...notificationSettings, fcm: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.email}
                onChange={(e) => setNotificationSettings({...notificationSettings, email: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton onClick={() => handleSave('notifications')} />
      </div>
    </div>
  );

  const PaymentTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
        <div className="space-y-4">
          <div className="p-4 border border-gray-300 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Smartphone className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">M-Pesa</p>
                <p className="text-sm text-gray-500">Mobile money payments</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={paymentSettings.mpesaNumber}
                onChange={(e) => setPaymentSettings({...paymentSettings, mpesaNumber: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto Contribution</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Enable Auto Contribution</p>
              <p className="text-sm text-gray-500">Automatically contribute to your pools</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={paymentSettings.autoContribution}
                onChange={(e) => setPaymentSettings({...paymentSettings, autoContribution: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {paymentSettings.autoContribution && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (KSh)</label>
                <input
                  type="number"
                  value={paymentSettings.contributionAmount}
                  onChange={(e) => setPaymentSettings({...paymentSettings, contributionAmount: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <select
                  value={paymentSettings.contributionFrequency}
                  onChange={(e) => setPaymentSettings({...paymentSettings, contributionFrequency: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <SaveButton onClick={() => handleSave('payment')} />
      </div>
    </div>
  );

  // Load settings on component mount
  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }
    
    loadSettings();
  }, [user, router]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout 
        title="Settings"
        subtitle="Manage your account preferences"
      >
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout 
        title="Settings"
        subtitle="Manage your account preferences"
      >
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load settings</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadSettings();
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payment', label: 'Payment', icon: CreditCard }
  ];

  const SaveButton = ({ onClick, disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled || saveStatus === 'saving'}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        saveStatus === 'success' 
          ? 'bg-green-600 text-white' 
          : saveStatus === 'saving'
          ? 'bg-gray-400 text-white cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {saveStatus === 'success' ? (
        <>
          <CheckCircle className="w-4 h-4" />
          Saved!
        </>
      ) : saveStatus === 'saving' ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Save className="w-4 h-4" />
          Save Changes
        </>
      )}
    </button>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return <ProfileTab />;
      case 'notifications': return <NotificationsTab />;
      case 'payment': return <PaymentTab />;
      default: return <ProfileTab />;
    }
  };

  return (
    <DashboardLayout 
      title="Settings"
      subtitle="Manage your account preferences and settings"
    >
      <div className="max-w-4xl mx-auto">
        {/* Horizontal Scrolling Tabs */}
        <div className="bg-white rounded-xl border border-gray-100 p-1 mb-6">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 lg:p-8">
          {renderTabContent()}
        </div>
      </div>
    </DashboardLayout>
  );
}
