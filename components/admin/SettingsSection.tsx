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
  Edit
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// import { Progress } from '@/components/ui/progress';

interface SettingsSectionProps {
  settings?: any;
  onSaveSettings?: (settings: any) => Promise<void>;
}

export default function SettingsSection({ settings, onSaveSettings }: SettingsSectionProps) {
  const [currentSettings, setCurrentSettings] = useState<any>(settings || {});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('restaurant');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (settings) {
      setCurrentSettings(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    setIsLoading(true);
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
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
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
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Operating Hours</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {days.map((day) => (
              <div key={day} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 capitalize">{day}</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={!settings?.operatingHours?.[day]?.closed}
                    onChange={(e) => onUpdate(`operatingHours.${day}.closed`, !e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-600">Open</span>
                </div>
                {!settings?.operatingHours?.[day]?.closed && (
                  <>
                    <input
                      type="time"
                      value={settings?.operatingHours?.[day]?.open || ''}
                      onChange={(e) => onUpdate(`operatingHours.${day}.open`, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      value={settings?.operatingHours?.[day]?.close || ''}
                      onChange={(e) => onUpdate(`operatingHours.${day}.close`, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Payment Settings Tab
function PaymentSettingsTab({ settings, onUpdate }: { settings: any, onUpdate: (path: string, value: any) => void }) {
  const paymentMethods = ['cash', 'phonepe'];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Payment Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Accepted Payment Methods</label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <label key={method} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings?.payment?.acceptedMethods?.includes(method)}
                    onChange={(e) => {
                      const current = settings?.payment?.acceptedMethods || [];
                      const updated = e.target.checked
                        ? [...current, method]
                        : current.filter((m: string) => m !== method);
                      onUpdate('payment.acceptedMethods', updated);
                    }}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm capitalize">{method === 'phonepe' ? 'PhonePe' : method}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Customers pay through cash counter QR code for PhonePe payments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={settings?.payment?.taxRate || ''}
                onChange={(e) => onUpdate('payment.taxRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Charge (%)</label>
              <input
                type="number"
                step="0.1"
                value={settings?.payment?.serviceCharge || ''}
                onChange={(e) => onUpdate('payment.serviceCharge', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order (₹)</label>
              <input
                type="number"
                value={settings?.payment?.minimumOrder || ''}
                onChange={(e) => onUpdate('payment.minimumOrder', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={settings?.payment?.currency || 'INR'}
                onChange={(e) => onUpdate('payment.currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency Symbol</label>
              <input
                type="text"
                value={settings?.payment?.currencySymbol || '₹'}
                onChange={(e) => onUpdate('payment.currencySymbol', e.target.value)}
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
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="email"
                  placeholder="admin@restaurant.com"
                  value={settings?.notifications?.email?.address || ''}
                  onChange={(e) => onUpdate('notifications.email.address', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="checkbox"
                  checked={settings?.notifications?.email?.enabled}
                  onChange={(e) => onUpdate('notifications.email.enabled', e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">SMS Notifications</h4>
                <p className="text-sm text-gray-600">Receive notifications via SMS</p>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={settings?.notifications?.sms?.number || ''}
                  onChange={(e) => onUpdate('notifications.sms.number', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="checkbox"
                  checked={settings?.notifications?.sms?.enabled}
                  onChange={(e) => onUpdate('notifications.sms.enabled', e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">Push Notifications</h4>
                <p className="text-sm text-gray-600">Receive real-time push notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings?.notifications?.push?.enabled}
                onChange={(e) => onUpdate('notifications.push.enabled', e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
            </div>
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
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">Require Login</h4>
                <p className="text-sm text-gray-600">Require authentication for admin access</p>
              </div>
              <input
                type="checkbox"
                checked={settings?.security?.requireLogin}
                onChange={(e) => onUpdate('security.requireLogin', e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (seconds)</label>
                <input
                  type="number"
                  value={settings?.security?.sessionTimeout || ''}
                  onChange={(e) => onUpdate('security.sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                <input
                  type="number"
                  value={settings?.security?.maxLoginAttempts || ''}
                  onChange={(e) => onUpdate('security.maxLoginAttempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Password Policy</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings?.security?.passwordPolicy?.requireUppercase}
                    onChange={(e) => onUpdate('security.passwordPolicy.requireUppercase', e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm">Require uppercase letters</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings?.security?.passwordPolicy?.requireLowercase}
                    onChange={(e) => onUpdate('security.passwordPolicy.requireLowercase', e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm">Require lowercase letters</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings?.security?.passwordPolicy?.requireNumbers}
                    onChange={(e) => onUpdate('security.passwordPolicy.requireNumbers', e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm">Require numbers</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings?.security?.passwordPolicy?.requireSpecialChars}
                    onChange={(e) => onUpdate('security.passwordPolicy.requireSpecialChars', e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm">Require special characters</span>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Appearance Tab
function AppearanceTab({ settings, onUpdate }: { settings: any, onUpdate: (path: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Appearance Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <select
                value={settings?.appearance?.theme || 'light'}
                onChange={(e) => onUpdate('appearance.theme', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
              <input
                type="color"
                value={settings?.appearance?.primaryColor || '#f97316'}
                onChange={(e) => onUpdate('appearance.primaryColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Favicon URL</label>
              <input
                type="url"
                value={settings?.appearance?.favicon || ''}
                onChange={(e) => onUpdate('appearance.favicon', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
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
            <span>Third-party Integrations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Gateway */}
          <div className="space-y-4">
            <h4 className="font-medium">Payment Gateway</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
                <select
                  value={settings?.integrations?.paymentGateway?.provider || 'razorpay'}
                  onChange={(e) => onUpdate('integrations.paymentGateway.provider', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="razorpay">Razorpay</option>
                  <option value="stripe">Stripe</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings?.integrations?.paymentGateway?.enabled}
                  onChange={(e) => onUpdate('integrations.paymentGateway.enabled', e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm">Enabled</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings?.integrations?.paymentGateway?.testMode}
                  onChange={(e) => onUpdate('integrations.paymentGateway.testMode', e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm">Test Mode</span>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="space-y-4">
            <h4 className="font-medium">Analytics</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h5 className="font-medium">Google Analytics</h5>
                  <p className="text-sm text-gray-600">Track website analytics</p>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="GA-XXXXXXXXX-X"
                    value={settings?.integrations?.analytics?.googleAnalytics?.trackingId || ''}
                    onChange={(e) => onUpdate('integrations.analytics.googleAnalytics.trackingId', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="checkbox"
                    checked={settings?.integrations?.analytics?.googleAnalytics?.enabled}
                    onChange={(e) => onUpdate('integrations.analytics.googleAnalytics.enabled', e.target.checked)}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Backup Tab
function BackupTab({ settings, onUpdate }: { settings: any, onUpdate: (path: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Backup & Maintenance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">Auto Backup</h4>
                <p className="text-sm text-gray-600">Automatically backup data</p>
              </div>
              <input
                type="checkbox"
                checked={settings?.backup?.autoBackup}
                onChange={(e) => onUpdate('backup.autoBackup', e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
            </div>

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
                <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period (days)</label>
                <input
                  type="number"
                  value={settings?.backup?.retentionPeriod || ''}
                  onChange={(e) => onUpdate('backup.retentionPeriod', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Scheduled Maintenance</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                  <select
                    value={settings?.maintenance?.scheduledMaintenance?.day || 'sunday'}
                    onChange={(e) => onUpdate('maintenance.scheduledMaintenance.day', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="sunday">Sunday</option>
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={settings?.maintenance?.scheduledMaintenance?.time || ''}
                    onChange={(e) => onUpdate('maintenance.scheduledMaintenance.time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={settings?.maintenance?.scheduledMaintenance?.duration || ''}
                    onChange={(e) => onUpdate('maintenance.scheduledMaintenance.duration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 