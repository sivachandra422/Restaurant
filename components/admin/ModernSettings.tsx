'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Globe, 
  Palette,
  Database,
  Wifi,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Real settings data interface
interface RestaurantSettings {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  cuisine: string;
  openingHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  deliveryRadius: number;
  minOrderAmount: number;
  freeDeliveryThreshold: number;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  orderAlerts: boolean;
  feedbackAlerts: boolean;
  systemAlerts: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  loginAttempts: number;
  ipWhitelist: string[];
}

interface AppearanceSettings {
  theme: string;
  primaryColor: string;
  accentColor: string;
  logo: string;
  favicon: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string | null;
  permissions: string[];
}

interface SettingsData {
  restaurant: RestaurantSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  appearance: AppearanceSettings;
}

export default function ModernSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('restaurant');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Settings data
  const [settings, setSettings] = useState<SettingsData>({
    restaurant: {
      name: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      cuisine: '',
      openingHours: {},
      deliveryRadius: 10,
      minOrderAmount: 200,
      freeDeliveryThreshold: 500
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      orderAlerts: true,
      feedbackAlerts: true,
      systemAlerts: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAttempts: 5,
      ipWhitelist: []
    },
    appearance: {
      theme: 'light',
      primaryColor: '#f97316',
      accentColor: '#dc2626',
      logo: '/logo.png',
      favicon: '/favicon.ico'
    }
  });

  // User management
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'staff',
    permissions: [] as string[]
  });

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Fetch real settings data
  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/admin/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      
      // Merge with defaults to ensure all required fields exist
      setSettings(prev => ({
        ...prev,
        ...data,
        restaurant: {
          ...prev.restaurant,
          ...data.restaurant
        },
        notifications: {
          ...prev.notifications,
          ...data.notifications
        },
        security: {
          ...prev.security,
          ...data.security
        },
        appearance: {
          ...prev.appearance,
          ...data.appearance
        }
      }));

      // Load mock users for now (in real implementation, this would come from a users API)
      loadMockUsers();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to load settings: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load mock users (replace with real API call)
  const loadMockUsers = () => {
    const mockUsers: User[] = [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@srikanya.com',
        role: 'admin',
        status: 'active',
        lastLogin: '2024-01-15T10:30:00Z',
        permissions: ['all']
      },
      {
        id: 2,
        name: 'Manager User',
        email: 'manager@srikanya.com',
        role: 'manager',
        status: 'active',
        lastLogin: '2024-01-14T15:20:00Z',
        permissions: ['orders', 'menu', 'analytics']
      },
      {
        id: 3,
        name: 'Staff User',
        email: 'staff@srikanya.com',
        role: 'staff',
        status: 'active',
        lastLogin: '2024-01-13T12:10:00Z',
        permissions: ['orders', 'menu']
      }
    ];
    setUsers(mockUsers);
  };

  // Save settings
  const saveSettings = async (section: keyof SettingsData) => {
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [section]: settings[section] })
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      toast({
        title: "Settings Saved",
        description: `${section.charAt(0).toUpperCase() + section.slice(1)} settings have been saved successfully.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      toast({
        title: "Error",
        description: `Failed to save settings: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Update setting value
  const updateSetting = (section: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  // Update nested setting value
  const updateNestedSetting = (section: keyof SettingsData, path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: any = newSettings[section];
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  // User management functions
  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;

    const user: User = {
      id: Date.now(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'active',
      lastLogin: null,
      permissions: getPermissionsForRole(newUser.role)
    };

    setUsers(prev => [...prev, user]);
    setNewUser({ name: '', email: '', role: 'staff', permissions: [] });
    setShowAddUserDialog(false);

    toast({
      title: "User Added",
      description: "New user has been added successfully.",
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    });
    setShowAddUserDialog(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    setUsers(prev => prev.map(user =>
      user.id === editingUser.id
        ? {
            ...user,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            permissions: getPermissionsForRole(newUser.role)
          }
        : user
    ));

    setEditingUser(null);
    setNewUser({ name: '', email: '', role: 'staff', permissions: [] });
    setShowAddUserDialog(false);

    toast({
      title: "User Updated",
      description: "User has been updated successfully.",
    });
  };

  const handleDeleteUser = (userId: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast({
        title: "User Deleted",
        description: "User has been deleted successfully.",
      });
    }
  };

  const getPermissionsForRole = (role: string): string[] => {
    switch (role) {
      case 'admin': return ['all'];
      case 'manager': return ['orders', 'menu', 'analytics', 'feedback'];
      case 'staff': return ['orders', 'menu'];
      default: return [];
    }
  };

  const userRoles = [
    { value: 'admin', label: 'Administrator', description: 'Full access to all features' },
    { value: 'manager', label: 'Manager', description: 'Access to orders, menu, analytics, and feedback' },
    { value: 'staff', label: 'Staff', description: 'Access to orders and menu management' }
  ];

  // Load settings on component mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Settings</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => fetchSettings()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600">Configure your restaurant settings and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => fetchSettings()} 
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'restaurant', name: 'Restaurant', icon: Globe },
            { id: 'users', name: 'Users', icon: User },
            { id: 'notifications', name: 'Notifications', icon: Bell },
            { id: 'security', name: 'Security', icon: Shield },
            { id: 'appearance', name: 'Appearance', icon: Palette }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'restaurant' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-blue-500" />
                <span>Restaurant Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="restaurant-name">Restaurant Name</Label>
                  <Input
                    id="restaurant-name"
                    value={settings.restaurant.name}
                    onChange={(e) => updateSetting('restaurant', 'name', e.target.value)}
                    placeholder="Enter restaurant name"
                  />
                </div>
                <div>
                  <Label htmlFor="restaurant-cuisine">Cuisine Type</Label>
                  <Input
                    id="restaurant-cuisine"
                    value={settings.restaurant.cuisine}
                    onChange={(e) => updateSetting('restaurant', 'cuisine', e.target.value)}
                    placeholder="e.g., Indian, Chinese, Italian"
                  />
                </div>
                <div>
                  <Label htmlFor="restaurant-phone">Phone Number</Label>
                  <Input
                    id="restaurant-phone"
                    value={settings.restaurant.phone}
                    onChange={(e) => updateSetting('restaurant', 'phone', e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <Label htmlFor="restaurant-email">Email Address</Label>
                  <Input
                    id="restaurant-email"
                    type="email"
                    value={settings.restaurant.email}
                    onChange={(e) => updateSetting('restaurant', 'email', e.target.value)}
                    placeholder="info@restaurant.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="restaurant-description">Description</Label>
                  <Textarea
                    id="restaurant-description"
                    value={settings.restaurant.description}
                    onChange={(e) => updateSetting('restaurant', 'description', e.target.value)}
                    placeholder="Describe your restaurant..."
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="restaurant-address">Address</Label>
                  <Textarea
                    id="restaurant-address"
                    value={settings.restaurant.address}
                    onChange={(e) => updateSetting('restaurant', 'address', e.target.value)}
                    placeholder="Enter complete address"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="restaurant-website">Website</Label>
                  <Input
                    id="restaurant-website"
                    value={settings.restaurant.website}
                    onChange={(e) => updateSetting('restaurant', 'website', e.target.value)}
                    placeholder="https://restaurant.com"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-4">Delivery Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="delivery-radius">Delivery Radius (km)</Label>
                    <Input
                      id="delivery-radius"
                      type="number"
                      value={settings.restaurant.deliveryRadius}
                      onChange={(e) => updateSetting('restaurant', 'deliveryRadius', parseInt(e.target.value))}
                      min="1"
                      max="50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="min-order">Minimum Order Amount (₹)</Label>
                    <Input
                      id="min-order"
                      type="number"
                      value={settings.restaurant.minOrderAmount}
                      onChange={(e) => updateSetting('restaurant', 'minOrderAmount', parseInt(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="free-delivery">Free Delivery Threshold (₹)</Label>
                    <Input
                      id="free-delivery"
                      type="number"
                      value={settings.restaurant.freeDeliveryThreshold}
                      onChange={(e) => updateSetting('restaurant', 'freeDeliveryThreshold', parseInt(e.target.value))}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-4">Opening Hours</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(settings.restaurant.openingHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center space-x-3">
                      <div className="w-20 text-sm font-medium text-gray-700 capitalize">
                        {day}
                      </div>
                      <Switch
                        checked={!hours.closed}
                        onCheckedChange={(checked) => 
                          updateNestedSetting('restaurant', `${day}.closed`, !checked)
                        }
                      />
                      {!hours.closed && (
                        <>
                          <Input
                            type="time"
                            value={hours.open}
                            onChange={(e) => updateNestedSetting('restaurant', `${day}.open`, e.target.value)}
                            className="w-24"
                          />
                          <span className="text-gray-500">to</span>
                          <Input
                            type="time"
                            value={hours.close}
                            onChange={(e) => updateNestedSetting('restaurant', `${day}.close`, e.target.value)}
                            className="w-24"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={() => saveSettings('restaurant')} 
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Restaurant Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-500" />
                  <span>User Management</span>
                </div>
                <Button onClick={() => setShowAddUserDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{user.name}</h4>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{user.role}</Badge>
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                            {user.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-green-500" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Email Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={settings.notifications.smsNotifications}
                      onCheckedChange={(checked) => updateSetting('notifications', 'smsNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-gray-500">Receive push notifications</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={settings.notifications.pushNotifications}
                      onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Alert Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="order-alerts">Order Alerts</Label>
                      <p className="text-sm text-gray-500">Get notified about new orders</p>
                    </div>
                    <Switch
                      id="order-alerts"
                      checked={settings.notifications.orderAlerts}
                      onCheckedChange={(checked) => updateSetting('notifications', 'orderAlerts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="feedback-alerts">Feedback Alerts</Label>
                      <p className="text-sm text-gray-500">Get notified about customer feedback</p>
                    </div>
                    <Switch
                      id="feedback-alerts"
                      checked={settings.notifications.feedbackAlerts}
                      onCheckedChange={(checked) => updateSetting('notifications', 'feedbackAlerts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="system-alerts">System Alerts</Label>
                      <p className="text-sm text-gray-500">Get notified about system updates</p>
                    </div>
                    <Switch
                      id="system-alerts"
                      checked={settings.notifications.systemAlerts}
                      onCheckedChange={(checked) => updateSetting('notifications', 'systemAlerts', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button 
                  onClick={() => saveSettings('notifications')} 
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-500" />
                <span>Security Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Authentication</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-500">Require 2FA for admin access</p>
                    </div>
                    <Switch
                      id="two-factor"
                      checked={settings.security.twoFactorAuth}
                      onCheckedChange={(checked) => updateSetting('security', 'twoFactorAuth', checked)}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                      <Input
                        id="session-timeout"
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                        min="5"
                        max="480"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                      <Input
                        id="password-expiry"
                        type="number"
                        value={settings.security.passwordExpiry}
                        onChange={(e) => updateSetting('security', 'passwordExpiry', parseInt(e.target.value))}
                        min="30"
                        max="365"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Access Control</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="login-attempts">Max Login Attempts</Label>
                    <Input
                      id="login-attempts"
                      type="number"
                      value={settings.security.loginAttempts}
                      onChange={(e) => updateSetting('security', 'loginAttempts', parseInt(e.target.value))}
                      min="3"
                      max="10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ip-whitelist">IP Whitelist (optional)</Label>
                    <Textarea
                      id="ip-whitelist"
                      value={settings.security.ipWhitelist.join('\n')}
                      onChange={(e) => updateSetting('security', 'ipWhitelist', e.target.value.split('\n').filter(ip => ip.trim()))}
                      placeholder="Enter IP addresses, one per line"
                      rows={3}
                    />
                    <p className="text-sm text-gray-500 mt-1">Leave empty to allow all IPs</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button 
                  onClick={() => saveSettings('security')} 
                  disabled={isSaving}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Security Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5 text-purple-500" />
                <span>Appearance Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Theme & Colors</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={settings.appearance.theme} onValueChange={(value) => updateSetting('appearance', 'theme', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="primary-color"
                        type="color"
                        value={settings.appearance.primaryColor}
                        onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={settings.appearance.primaryColor}
                        onChange={(e) => updateSetting('appearance', 'primaryColor', e.target.value)}
                        placeholder="#f97316"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="accent-color">Accent Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="accent-color"
                        type="color"
                        value={settings.appearance.accentColor}
                        onChange={(e) => updateSetting('appearance', 'accentColor', e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={settings.appearance.accentColor}
                        onChange={(e) => updateSetting('appearance', 'accentColor', e.target.value)}
                        placeholder="#dc2626"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Branding</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="logo">Logo URL</Label>
                    <Input
                      id="logo"
                      value={settings.appearance.logo}
                      onChange={(e) => updateSetting('appearance', 'logo', e.target.value)}
                      placeholder="/logo.png"
                    />
                  </div>
                  <div>
                    <Label htmlFor="favicon">Favicon URL</Label>
                    <Input
                      id="favicon"
                      value={settings.appearance.favicon}
                      onChange={(e) => updateSetting('appearance', 'favicon', e.target.value)}
                      placeholder="/favicon.ico"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button 
                  onClick={() => saveSettings('appearance')} 
                  disabled={isSaving}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Appearance Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit User Dialog */}
      {showAddUserDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="user-name">Name</Label>
                <Input
                  id="user-name"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter user name"
                />
              </div>
              <div>
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter user email"
                />
              </div>
              <div>
                <Label htmlFor="user-role">Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {userRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddUserDialog(false);
                  setEditingUser(null);
                  setNewUser({ name: '', email: '', role: 'staff', permissions: [] });
                }}
              >
                Cancel
              </Button>
              <Button onClick={editingUser ? handleUpdateUser : handleAddUser}>
                {editingUser ? 'Update User' : 'Add User'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
