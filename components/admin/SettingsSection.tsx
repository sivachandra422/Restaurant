'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  DollarSign,
  CreditCard,
  Bell,
  Shield,
  Palette,
  Database,
  Globe,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface SettingsSectionProps {
  settings?: any;
  onSaveSettings?: (settings: any) => Promise<void>;
}

export default function SettingsSection({ settings, onSaveSettings }: SettingsSectionProps) {
  const [currentSettings, setCurrentSettings] = useState<any>({
    restaurant: {
      name: 'Sri Kanya Family Restaurants',
      description: 'Authentic Indian Cuisine',
      contact: {
        address: '',
        phone: '',
        email: ''
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: ''
      }
    },
    operating: {
      hours: {
        monday: { open: '09:00', close: '22:00', closed: false },
        tuesday: { open: '09:00', close: '22:00', closed: false },
        wednesday: { open: '09:00', close: '22:00', closed: false },
        thursday: { open: '09:00', close: '22:00', closed: false },
        friday: { open: '09:00', close: '22:00', closed: false },
        saturday: { open: '09:00', close: '22:00', closed: false },
        sunday: { open: '09:00', close: '22:00', closed: false }
      },
      specialHours: []
    },
    payment: {
      methods: ['cash', 'card', 'phonepe', 'gpay', 'upi'],
      taxRate: 5,
      serviceCharge: 0,
      minimumOrder: 100
    },
    notifications: {
      email: {
        enabled: true,
        address: '',
        newOrders: true,
        lowStock: true,
        dailyReports: true
      },
      sms: {
        enabled: false,
        number: '',
        newOrders: true,
        orderUpdates: true
      },
      push: {
        enabled: true,
        newOrders: true,
        orderUpdates: true,
        systemAlerts: true
      }
    },
    security: {
      adminPassword: '',
      sessionTimeout: 30,
      twoFactorAuth: false,
      loginAttempts: 3
    },
    appearance: {
      theme: 'light',
      primaryColor: '#f97316',
      logo: '',
      favicon: ''
    },
    integrations: {
      googleAnalytics: {
        enabled: false,
        trackingId: ''
      },
      facebookPixel: {
        enabled: false,
        pixelId: ''
      },
      cloudinary: {
        enabled: true,
        cloudName: '',
        apiKey: '',
        apiSecret: ''
      }
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionDays: 30,
      lastBackup: null
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('restaurant');
  const [showPassword, setShowPassword] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (settings) {
      setCurrentSettings(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    setIsLoading(true);
    setSaveStatus('saving');
    try {
      if (onSaveSettings) {
        await onSaveSettings(currentSettings);
      } else {
        // Default save implementation
        const response = await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentSettings)
        });
        if (!response.ok) throw new Error('Failed to save settings');
        
        const result = await response.json();
        if (result.success) {
          setSaveStatus('success');
          toast({
            title: "Settings Saved",
            description: "Your settings have been saved successfully.",
          });
        } else {
          throw new Error(result.error || 'Failed to save settings');
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const updateSetting = (path: string, value: any) => {
    const keys = path.split('.');
    const newSettings = { ...currentSettings };
    let current = newSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setCurrentSettings(newSettings);
  };

  const tabs = [
    { id: 'restaurant', name: 'Restaurant Info', icon: MapPin },
    { id: 'operating', name: 'Operating Hours', icon: Clock },
    { id: 'payment', name: 'Payment Settings', icon: DollarSign },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'integrations', name: 'Integrations', icon: Globe },
    { id: 'backup', name: 'Backup & Maintenance', icon: Database }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-sm text-gray-600">Manage restaurant configuration and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          {saveStatus === 'success' && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Saved
            </Badge>
          )}
          {saveStatus === 'error' && (
            <Badge className="bg-red-100 text-red-800">
              <AlertCircle className="w-3 h-3 mr-1" />
              Error
            </Badge>
          )}
          <Button onClick={handleSave} disabled={isLoading} className="bg-gradient-to-r from-orange-500 to-red-500">
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Settings Content */}
      <div className="space-y-6">
        {activeTab === 'restaurant' && (
          <RestaurantInfoTab 
            settings={currentSettings} 
            onUpdate={updateSetting} 
          />
        )}
        {activeTab === 'operating' && (
          <OperatingHoursTab 
            settings={currentSettings} 
            onUpdate={updateSetting} 
          />
        )}
        {activeTab === 'payment' && (
          <PaymentSettingsTab 
            settings={currentSettings} 
            onUpdate={updateSetting} 
          />
        )}
        {activeTab === 'notifications' && (
          <NotificationsTab 
            settings={currentSettings} 
            onUpdate={updateSetting} 
          />
        )}
        {activeTab === 'security' && (
          <SecurityTab 
            settings={currentSettings} 
            onUpdate={updateSetting}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        )}
        {activeTab === 'appearance' && (
          <AppearanceTab 
            settings={currentSettings} 
            onUpdate={updateSetting} 
          />
        )}
        {activeTab === 'integrations' && (
          <IntegrationsTab 
            settings={currentSettings} 
            onUpdate={updateSetting} 
          />
        )}
        {activeTab === 'backup' && (
          <BackupTab 
            settings={currentSettings} 
            onUpdate={updateSetting} 
          />
        )}
      </div>
    </div>
  );
}

// Restaurant Information Tab
function RestaurantInfoTab({ settings, onUpdate }: { settings: any, onUpdate: (path: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Restaurant Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
              <input
                type="text"
                value={settings?.restaurant?.name || ''}
                onChange={(e) => onUpdate('restaurant.name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={settings?.restaurant?.description || ''}
                onChange={(e) => onUpdate('restaurant.description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              value={settings?.restaurant?.contact?.address || ''}
              onChange={(e) => onUpdate('restaurant.contact.address', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={settings?.restaurant?.contact?.phone || ''}
                onChange={(e) => onUpdate('restaurant.contact.phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={settings?.restaurant?.contact?.email || ''}
                onChange={(e) => onUpdate('restaurant.contact.email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Social Media Links</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="url"
                placeholder="Facebook URL"
                value={settings?.restaurant?.social?.facebook || ''}
                onChange={(e) => onUpdate('restaurant.social.facebook', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="url"
                placeholder="Instagram URL"
                value={settings?.restaurant?.social?.instagram || ''}
                onChange={(e) => onUpdate('restaurant.social.instagram', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="url"
                placeholder="Twitter URL"
                value={settings?.restaurant?.social?.twitter || ''}
                onChange={(e) => onUpdate('restaurant.social.twitter', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Operating Hours Tab
function OperatingHoursTab({ settings, onUpdate }: { settings: any, onUpdate: (path: string, value: any) => void }) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  const updateDayHours = (day: string, field: string, value: any) => {
    const currentHours = settings?.operating?.hours?.[day] || { open: '09:00', close: '22:00', closed: false };
    onUpdate(`operating.hours.${day}`, { ...currentHours, [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Operating Hours</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {days.map((day) => {
            const dayHours = settings?.operating?.hours?.[day] || { open: '09:00', close: '22:00', closed: false };
            return (
              <div key={day} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="w-24">
                  <span className="font-medium capitalize">{day}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!dayHours.closed}
                    onChange={(e) => updateDayHours(day, 'closed', !e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">Open</span>
                </div>
                {!dayHours.closed && (
                  <>
                    <input
                      type="time"
                      value={dayHours.open}
                      onChange={(e) => updateDayHours(day, 'open', e.target.value)}
                      className="px-2 py-1 border rounded"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={dayHours.close}
                      onChange={(e) => updateDayHours(day, 'close', e.target.value)}
                      className="px-2 py-1 border rounded"
                    />
                  </>
                )}
                {dayHours.closed && (
                  <span className="text-red-500 text-sm">Closed</span>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

// Payment Settings Tab
function PaymentSettingsTab({ settings, onUpdate }: { settings: any, onUpdate: (path: string, value: any) => void }) {
  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: DollarSign },
    { id: 'card', name: 'Card', icon: CreditCard },
    { id: 'phonepe', name: 'PhonePe', icon: CreditCard },
    { id: 'gpay', name: 'Google Pay', icon: CreditCard },
    { id: 'upi', name: 'UPI', icon: CreditCard }
  ];

  const togglePaymentMethod = (methodId: string) => {
    const currentMethods = settings?.payment?.methods || [];
    const newMethods = currentMethods.includes(methodId)
      ? currentMethods.filter((id: string) => id !== methodId)
      : [...currentMethods, methodId];
    onUpdate('payment.methods', newMethods);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Payment Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Accepted Payment Methods</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isEnabled = settings?.payment?.methods?.includes(method.id);
                return (
                  <div
                    key={method.id}
                    onClick={() => togglePaymentMethod(method.id)}
                    className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                      isEnabled ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => {}}
                      className="rounded"
                    />
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{method.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings?.payment?.taxRate || 0}
                onChange={(e) => onUpdate('payment.taxRate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Charge (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings?.payment?.serviceCharge || 0}
                onChange={(e) => onUpdate('payment.serviceCharge', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order (₹)</label>
              <input
                type="number"
                min="0"
                value={settings?.payment?.minimumOrder || 0}
                onChange={(e) => onUpdate('payment.minimumOrder', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Notifications Tab
function NotificationsTab({ settings, onUpdate }: { settings: any, onUpdate: (path: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notification Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <h3 className="font-medium">Email Notifications</h3>
              </div>
              <input
                type="checkbox"
                checked={settings?.notifications?.email?.enabled}
                onChange={(e) => onUpdate('notifications.email.enabled', e.target.checked)}
                className="rounded"
              />
            </div>
            {settings?.notifications?.email?.enabled && (
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Email address"
                  value={settings?.notifications?.email?.address || ''}
                  onChange={(e) => onUpdate('notifications.email.address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings?.notifications?.email?.newOrders}
                      onChange={(e) => onUpdate('notifications.email.newOrders', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">New orders</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings?.notifications?.email?.lowStock}
                      onChange={(e) => onUpdate('notifications.email.lowStock', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Low stock alerts</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings?.notifications?.email?.dailyReports}
                      onChange={(e) => onUpdate('notifications.email.dailyReports', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Daily reports</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* SMS Notifications */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <h3 className="font-medium">SMS Notifications</h3>
              </div>
              <input
                type="checkbox"
                checked={settings?.notifications?.sms?.enabled}
                onChange={(e) => onUpdate('notifications.sms.enabled', e.target.checked)}
                className="rounded"
              />
            </div>
            {settings?.notifications?.sms?.enabled && (
              <div className="space-y-3">
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={settings?.notifications?.sms?.number || ''}
                  onChange={(e) => onUpdate('notifications.sms.number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings?.notifications?.sms?.newOrders}
                      onChange={(e) => onUpdate('notifications.sms.newOrders', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">New orders</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings?.notifications?.sms?.orderUpdates}
                      onChange={(e) => onUpdate('notifications.sms.orderUpdates', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Order updates</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Security Tab
function SecurityTab({ 
  settings, 
  onUpdate, 
  showPassword, 
  setShowPassword 
}: { 
  settings: any, 
  onUpdate: (path: string, value: any) => void,
  showPassword: boolean,
  setShowPassword: (show: boolean) => void
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Security Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={settings?.security?.adminPassword || ''}
                onChange={(e) => onUpdate('security.adminPassword', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                min="5"
                max="480"
                value={settings?.security?.sessionTimeout || 30}
                onChange={(e) => onUpdate('security.sessionTimeout', parseInt(e.target.value) || 30)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings?.security?.loginAttempts || 3}
                onChange={(e) => onUpdate('security.loginAttempts', parseInt(e.target.value) || 3)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings?.security?.twoFactorAuth}
                onChange={(e) => onUpdate('security.twoFactorAuth', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Enable Two-Factor Authentication</span>
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Appearance Tab
function AppearanceTab({ settings, onUpdate }: { settings: any, onUpdate: (path: string, value: any) => void }) {
  const themes = [
    { id: 'light', name: 'Light', description: 'Clean and bright interface' },
    { id: 'dark', name: 'Dark', description: 'Easy on the eyes' },
    { id: 'auto', name: 'Auto', description: 'Follows system preference' }
  ];

  const colors = [
    { id: '#f97316', name: 'Orange', class: 'bg-orange-500' },
    { id: '#dc2626', name: 'Red', class: 'bg-red-500' },
    { id: '#2563eb', name: 'Blue', class: 'bg-blue-500' },
    { id: '#059669', name: 'Green', class: 'bg-green-500' },
    { id: '#7c3aed', name: 'Purple', class: 'bg-purple-500' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Appearance Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  onClick={() => onUpdate('appearance.theme', theme.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    settings?.appearance?.theme === theme.id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-medium">{theme.name}</div>
                  <div className="text-sm text-gray-500">{theme.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Primary Color</label>
            <div className="flex space-x-3">
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => onUpdate('appearance.primaryColor', color.id)}
                  className={`w-8 h-8 rounded-full ${color.class} border-2 transition-all ${
                    settings?.appearance?.primaryColor === color.id
                      ? 'border-gray-800 scale-110'
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
              <input
                type="url"
                value={settings?.appearance?.logo || ''}
                onChange={(e) => onUpdate('appearance.logo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Favicon URL</label>
              <input
                type="url"
                value={settings?.appearance?.favicon || ''}
                onChange={(e) => onUpdate('appearance.favicon', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="https://example.com/favicon.ico"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Integrations Tab
function IntegrationsTab({ settings, onUpdate }: { settings: any, onUpdate: (path: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>Third-Party Integrations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Analytics */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <h3 className="font-medium">Google Analytics</h3>
              </div>
              <input
                type="checkbox"
                checked={settings?.integrations?.googleAnalytics?.enabled}
                onChange={(e) => onUpdate('integrations.googleAnalytics.enabled', e.target.checked)}
                className="rounded"
              />
            </div>
            {settings?.integrations?.googleAnalytics?.enabled && (
              <input
                type="text"
                placeholder="Tracking ID (G-XXXXXXXXXX)"
                value={settings?.integrations?.googleAnalytics?.trackingId || ''}
                onChange={(e) => onUpdate('integrations.googleAnalytics.trackingId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            )}
          </div>

          {/* Facebook Pixel */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <h3 className="font-medium">Facebook Pixel</h3>
              </div>
              <input
                type="checkbox"
                checked={settings?.integrations?.facebookPixel?.enabled}
                onChange={(e) => onUpdate('integrations.facebookPixel.enabled', e.target.checked)}
                className="rounded"
              />
            </div>
            {settings?.integrations?.facebookPixel?.enabled && (
              <input
                type="text"
                placeholder="Pixel ID"
                value={settings?.integrations?.facebookPixel?.pixelId || ''}
                onChange={(e) => onUpdate('integrations.facebookPixel.pixelId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            )}
          </div>

          {/* Cloudinary */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5" />
                <h3 className="font-medium">Cloudinary (Image Storage)</h3>
              </div>
              <input
                type="checkbox"
                checked={settings?.integrations?.cloudinary?.enabled}
                onChange={(e) => onUpdate('integrations.cloudinary.enabled', e.target.checked)}
                className="rounded"
              />
            </div>
            {settings?.integrations?.cloudinary?.enabled && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Cloud Name"
                  value={settings?.integrations?.cloudinary?.cloudName || ''}
                  onChange={(e) => onUpdate('integrations.cloudinary.cloudName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="text"
                  placeholder="API Key"
                  value={settings?.integrations?.cloudinary?.apiKey || ''}
                  onChange={(e) => onUpdate('integrations.cloudinary.apiKey', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="password"
                  placeholder="API Secret"
                  value={settings?.integrations?.cloudinary?.apiSecret || ''}
                  onChange={(e) => onUpdate('integrations.cloudinary.apiSecret', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Backup Tab
function BackupTab({ settings, onUpdate }: { settings: any, onUpdate: (path: string, value: any) => void }) {
  const handleManualBackup = async () => {
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          onUpdate('backup.lastBackup', new Date().toISOString());
          toast({
            title: "Backup Created",
            description: "Database backup has been created successfully.",
          });
        }
      }
    } catch (error) {
      console.error('Backup error:', error);
      toast({
        title: "Backup Failed",
        description: "Failed to create backup. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Backup & Maintenance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                checked={settings?.backup?.autoBackup}
                onChange={(e) => onUpdate('backup.autoBackup', e.target.checked)}
                className="rounded"
              />
              <span className="font-medium">Enable Automatic Backups</span>
            </label>
            
            {settings?.backup?.autoBackup && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                  <select
                    value={settings?.backup?.backupFrequency || 'daily'}
                    onChange={(e) => onUpdate('backup.backupFrequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Retention (days)</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={settings?.backup?.retentionDays || 30}
                    onChange={(e) => onUpdate('backup.retentionDays', parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium">Manual Backup</h3>
                <p className="text-sm text-gray-500">Create a backup of your database now</p>
              </div>
              <Button onClick={handleManualBackup} variant="outline">
                <Database className="w-4 h-4 mr-2" />
                Create Backup
              </Button>
            </div>
            
            {settings?.backup?.lastBackup && (
              <div className="text-sm text-gray-600">
                Last backup: {new Date(settings.backup.lastBackup).toLocaleString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 