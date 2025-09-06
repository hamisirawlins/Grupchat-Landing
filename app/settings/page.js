'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { dashboardAPI, handleApiError } from '@/lib/api';
import { 
  User,
  Bell,
  Smartphone,
  Mail,
  Volume2,
  Save,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    // Profile section
    displayName: '',
    phone: '',
    language: 'en',
    timezone: 'Africa/Nairobi',

    // Notification section
    in_app: true,
    fcm: true,
    email: true
  });

  // Phone number formatting state
  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Load settings function
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load profile settings
      const profileResponse = await dashboardAPI.getUserProfile();
      if (profileResponse.success) {
        const userData = profileResponse.data.user;
        const phone = userData.phone || '';
        
        setFormData(prev => ({
          ...prev,
          displayName: userData.displayName || '',
          phone: phone
        }));
        
        // Format phone for display (remove + and show local format)
        if (phone) {
          setPhoneDisplay(formatPhoneForDisplay(phone));
        }
      }

      // Load notification settings
      const notificationResponse = await dashboardAPI.getNotificationSettings();
      if (notificationResponse.success) {
        setFormData(prev => ({
          ...prev,
          in_app: notificationResponse.data.in_app ?? true,
          fcm: notificationResponse.data.fcm ?? true,
          email: notificationResponse.data.email ?? true
        }));
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setError('Failed to load settings');
      setLoading(false);
    }
  };

  // Phone number formatting functions
  const formatPhoneForDisplay = (internationalPhone) => {
    if (!internationalPhone) return '';
    
    // Remove + and convert to local format
    const cleanPhone = internationalPhone.replace('+', '');
    
    // Handle Kenya numbers (254)
    if (cleanPhone.startsWith('254')) {
      return '0' + cleanPhone.substring(3);
    }
    
    // Handle other countries (add more as needed)
    if (cleanPhone.startsWith('1')) { // US/Canada
      return cleanPhone;
    }
    
    return cleanPhone;
  };

  const formatPhoneForAPI = (localPhone) => {
    if (!localPhone) return '';
    
    // Convert local format to international
    let internationalPhone = localPhone;
    
    // Handle Kenya numbers (0 -> +254)
    if (localPhone.startsWith('0')) {
      internationalPhone = '+254' + localPhone.substring(1);
    } else if (localPhone.startsWith('254')) {
      internationalPhone = '+' + localPhone;
    } else if (!localPhone.startsWith('+')) {
      // Assume it's a local number, add +254 for Kenya
      internationalPhone = '+254' + localPhone;
    }
    
    return internationalPhone;
  };

  const validatePhone = (phone) => {
    if (!phone) return 'Phone number is required';
    
    const digits = phone.replace(/\D/g, '');
    
    // Kenya mobile number validation
    if (digits.startsWith('254')) {
      // International format: +254712345678
      if (digits.length !== 12) {
        return 'Kenya international number must be 12 digits (254 + 9 digits)';
      }
      // Validate that the part after 254 is a valid mobile prefix
      const mobilePart = digits.substring(3);
      if (!/^[17]\d{8}$/.test(mobilePart)) {
        return 'Invalid Kenya mobile number format after 254';
      }
    } else if (digits.startsWith('07') || digits.startsWith('01')) {
      // Local format: 0712345678 or 0112345678
      if (digits.length !== 10) {
        return 'Kenya local number must be 10 digits (07XX XXX XXX)';
      }
      // Validate mobile prefixes (07) and landline prefixes (01)
      if (digits.startsWith('07')) {
        // Mobile: 07XX XXX XXX
        if (!/^07[17]\d{7}$/.test(digits)) {
          return 'Invalid Kenya mobile number format (07XX XXX XXX)';
        }
      } else if (digits.startsWith('01')) {
        // Landline: 01XX XXX XXX
        if (!/^01\d{8}$/.test(digits)) {
          return 'Invalid Kenya landline number format (01XX XXX XXX)';
        }
      }
    } else {
      return 'Please enter a valid Kenya phone number starting with 07, 01, or +254';
    }
    
    if (/^0+$/.test(digits)) {
      return 'Phone number cannot be all zeros';
    }
    
    return '';
  };

  const handlePhoneChange = (value) => {
    setFormData(prev => ({ ...prev, phone: value }));
    setPhoneDisplay(value);
    
    const error = validatePhone(value);
    setPhoneError(error);
  };

  // Save settings function
  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage('');

      // Validate phone number
      const phoneError = validatePhone(formData.phone);
      if (phoneError) {
        setError(phoneError);
        setSaving(false);
        return;
      }

      // Format phone for API
      const internationalPhone = formatPhoneForAPI(formData.phone);

      // Save profile settings
      const profileResponse = await dashboardAPI.updateProfile({
        displayName: formData.displayName,
        phone: internationalPhone
      });

      if (!profileResponse.success) {
        throw new Error(profileResponse.message || 'Failed to update profile');
      }

      // Save notification settings
      const notificationResponse = await dashboardAPI.updateNotificationSettings({
        in_app: formData.in_app,
        fcm: formData.fcm,
        email: formData.email
      });

      if (!notificationResponse.success) {
        throw new Error(notificationResponse.message || 'Failed to update notifications');
      }

      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      setError(handleApiError(error, 'Failed to save settings'));
    } finally {
      setSaving(false);
    }
  };

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
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </DashboardLayout>
    );
  }

    return (
      <DashboardLayout 
        title="Settings"
      subtitle="Manage your account preferences and settings"
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-xl border border-red-200/50 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50/80 backdrop-blur-xl border border-green-200/50 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-green-700">{successMessage}</p>
            </div>
        </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-8 w-full lg:w-3/4 lg:mx-auto">
          
          {/* Profile Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                <p className="text-sm text-gray-500">Update your personal details and payment number</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your display name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="p-4 bg-purple-50/80 backdrop-blur-xl border border-purple-200/50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Smartphone className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-purple-900">M-Pesa Payment Number</p>
                       </div>
                  </div>
                  
                  <input
                    type="tel"
                    value={phoneDisplay}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      phoneError ? 'border-red-300' : 'border-purple-300'
                    }`}
                    placeholder="e.g., 0712345678"
                  />
                  {phoneError && (
                    <p className="text-sm text-red-600 mt-1">{phoneError}</p>
                  )}
                  <p className="text-xs text-purple-600 mt-1">
                    e.g., 0712345678
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-white/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-500">Choose how you want to be notified</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50/80 backdrop-blur-xl rounded-xl">
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
                    checked={formData.in_app}
                    onChange={(e) => setFormData({...formData, in_app: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50/80 backdrop-blur-xl rounded-xl">
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
                    checked={formData.fcm}
                    onChange={(e) => setFormData({...formData, fcm: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50/80 backdrop-blur-xl rounded-xl">
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
                    checked={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="sticky bottom-4 pt-4">
    <button
              type="submit"
              disabled={saving || phoneError}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                saving || phoneError
          ? 'bg-gray-400 text-white cursor-not-allowed'
          : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
      }`}
    >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Saving...
        </>
      ) : (
        <>
                  <Save className="w-5 h-5" />
                  Save All Changes
        </>
      )}
    </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
