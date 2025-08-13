'use client';

import React, { useState, useEffect } from 'react';
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

// Mock settings data (replace with real API calls)
const mockSettings = {
  restaurant: {
    name: 'Sri Kanya Family Restaurant',
    description: 'Authentic Indian cuisine with a modern twist',
    address: '123 Main Street, City Center, 500001',
    phone: '+91 98765 43210',
    email: 'info@srikanya.com',
    website: 'https://srikanya.com',
    cuisine: 'Indian',
    openingHours: {
      monday: { open: '10:00', close: '22:00', closed: false },
      tuesday: { open: '10:00', close: '22:00', closed: false },
      wednesday: { open: '10:00', close: '22:00', closed: false },
      thursday: { open: '10:00', close: '22:00', closed: false },
      friday: { open: '10:00', close: '23:00', closed: false },
      saturday: { open: '10:00', close: '23:00', closed: false },
      sunday: { open: '11:00', close: '21:00', closed: false }
    },
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
};

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string | null;
  permissions: string[];
}

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
    lastLogin: '2024-01-15T09:15:00Z',
    permissions: ['orders', 'menu', 'analytics']
  },
  {
    id: 3,
    name: 'Staff User',
    email: 'staff@srikanya.com',
    role: 'staff',
    status: 'inactive',
    lastLogin: '2024-01-14T16:45:00Z',
    permissions: ['orders']
  }
];

const userRoles = [
  { value: 'admin', label: 'Administrator', description: 'Full access to all features', permissions: ['all'] },
  { value: 'manager', label: 'Manager', description: 'Access to orders, menu, and analytics', permissions: ['orders', 'menu', 'analytics'] },
  { value: 'staff', label: 'Staff', description: 'Basic order management access', permissions: ['orders'] }
];

export default function ModernSettings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('restaurant');
  const [settings, setSettings] = useState(mockSettings);
  const [users, setUsers] = useState(mockUsers);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'staff',
    password: ''
  });

  const handleSaveSettings = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    toast({
      title: "Settings Saved",
      description: "Your restaurant settings have been updated successfully!",
    });
  };

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user: User = {
      id: Date.now(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'active',
      lastLogin: null,
      permissions: userRoles.find(r => r.value === newUser.role)?.permissions || []
    };
    
    setUsers([...users, user]);
    setNewUser({ name: '', email: '', role: 'staff', password: '' });
    setShowAddUser(false);
    setIsLoading(false);
    
    toast({
      title: "User Added",
      description: "New user has been created successfully!",
    });
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      password: ''
    });
    setShowAddUser(true);
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(users.filter(u => u.id !== userId));
      setIsLoading(false);
      
      toast({
        title: "User Deleted",
        description: "User has been removed successfully!",
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-1">
            Configure your restaurant settings and manage system preferences
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Reset
          </Button>
          
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
        {[
          { id: 'restaurant', label: 'Restaurant', icon: Settings },
          { id: 'users', label: 'Users', icon: User },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'security', label: 'Security', icon: Shield },
          { id: 'appearance', label: 'Appearance', icon: Palette }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'restaurant' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="restaurantName">Restaurant Name</Label>
                  <Input
                    id="restaurantName"
                    value={settings.restaurant.name}
                    onChange={(e) => setSettings({
                      ...settings,
                      restaurant: { ...settings.restaurant, name: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="cuisine">Cuisine Type</Label>
                  <Input
                    id="cuisine"
                    value={settings.restaurant.cuisine}
                    onChange={(e) => setSettings({
                      ...settings,
                      restaurant: { ...settings.restaurant, cuisine: e.target.value }
                    })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={settings.restaurant.description}
                  onChange={(e) => setSettings({
                    ...settings,
                    restaurant: { ...settings.restaurant, description: e.target.value }
                  })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={settings.restaurant.phone}
                    onChange={(e) => setSettings({
                      ...settings,
                      restaurant: { ...settings.restaurant, phone: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.restaurant.email}
                    onChange={(e) => setSettings({
                      ...settings,
                      restaurant: { ...settings.restaurant, email: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={settings.restaurant.address}
                  onChange={(e) => setSettings({
                    ...settings,
                    restaurant: { ...settings.restaurant, address: e.target.value }
                  })}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={settings.restaurant.website}
                  onChange={(e) => setSettings({
                    ...settings,
                    restaurant: { ...settings.restaurant, website: e.target.value }
                  })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="deliveryRadius">Delivery Radius (km)</Label>
                  <Input
                    id="deliveryRadius"
                    type="number"
                    value={settings.restaurant.deliveryRadius}
                    onChange={(e) => setSettings({
                      ...settings,
                      restaurant: { ...settings.restaurant, deliveryRadius: Number(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="minOrderAmount">Minimum Order Amount (₹)</Label>
                  <Input
                    id="minOrderAmount"
                    type="number"
                    value={settings.restaurant.minOrderAmount}
                    onChange={(e) => setSettings({
                      ...settings,
                      restaurant: { ...settings.restaurant, minOrderAmount: Number(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="freeDeliveryThreshold">Free Delivery Threshold (₹)</Label>
                  <Input
                    id="freeDeliveryThreshold"
                    type="number"
                    value={settings.restaurant.freeDeliveryThreshold}
                    onChange={(e) => setSettings({
                      ...settings,
                      restaurant: { ...settings.restaurant, freeDeliveryThreshold: Number(e.target.value) }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Opening Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(settings.restaurant.openingHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={!hours.closed}
                        onCheckedChange={(checked) => setSettings({
                          ...settings,
                          restaurant: {
                            ...settings.restaurant,
                            openingHours: {
                              ...settings.restaurant.openingHours,
                              [day]: { ...hours, closed: !checked }
                            }
                          }
                        })}
                      />
                      <span className="font-medium capitalize">{day}</span>
                    </div>
                    {!hours.closed && (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) => setSettings({
                            ...settings,
                            restaurant: {
                              ...settings.restaurant,
                              openingHours: {
                                ...settings.restaurant.openingHours,
                                [day]: { ...hours, open: e.target.value }
                              }
                            }
                          })}
                          className="w-24"
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) => setSettings({
                            ...settings,
                            restaurant: {
                              ...settings.restaurant,
                              openingHours: {
                                ...settings.restaurant.openingHours,
                                [day]: { ...hours, close: e.target.value }
                              }
                            }
                          })}
                          className="w-24"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-900">User Management</h2>
            <Button onClick={() => setShowAddUser(true)} className="bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{user.name}</h3>
                        <p className="text-sm text-slate-600">{user.email}</p>
                        <p className="text-xs text-slate-500">Last login: {formatDate(user.lastLogin)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                      <Badge className={getStatusBadgeColor(user.status)}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Badge>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add/Edit User Dialog */}
          {showAddUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="userName">Name</Label>
                      <Input
                        id="userName"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        placeholder="Enter user name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="userEmail">Email</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        placeholder="Enter user email"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="userRole">Role</Label>
                      <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {userRoles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              <div>
                                <div className="font-medium">{role.label}</div>
                                <div className="text-sm text-slate-500">{role.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {!editingUser && (
                      <div>
                        <Label htmlFor="userPassword">Password</Label>
                        <Input
                          id="userPassword"
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          placeholder="Enter password"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddUser(false);
                        setEditingUser(null);
                        setNewUser({ name: '', email: '', role: 'staff', password: '' });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddUser}
                      disabled={isLoading}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {editingUser ? 'Update User' : 'Add User'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <Label className="font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Label>
                  <p className="text-sm text-slate-600">
                    Receive notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </p>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, [key]: checked }
                  })}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <Label className="font-medium">Two-Factor Authentication</Label>
                  <p className="text-sm text-slate-600">Add an extra layer of security to your account</p>
                </div>
                <Switch
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    security: { ...settings.security, twoFactorAuth: checked }
                  })}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTimeout: Number(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    value={settings.security.passwordExpiry}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, passwordExpiry: Number(e.target.value) }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                  <Input
                    id="loginAttempts"
                    type="number"
                    value={settings.security.loginAttempts}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, loginAttempts: Number(e.target.value) }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Colors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select value={settings.appearance.theme} onValueChange={(value) => setSettings({
                  ...settings,
                  appearance: { ...settings.appearance, theme: value }
                })}>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={settings.appearance.primaryColor}
                      onChange={(e) => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, primaryColor: e.target.value }
                      })}
                      className="w-16 h-10"
                    />
                    <Input
                      value={settings.appearance.primaryColor}
                      onChange={(e) => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, primaryColor: e.target.value }
                      })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={settings.appearance.accentColor}
                      onChange={(e) => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, accentColor: e.target.value }
                      })}
                      className="w-16 h-10"
                    />
                    <Input
                      value={settings.appearance.accentColor}
                      onChange={(e) => setSettings({
                        ...settings,
                        appearance: { ...settings.appearance, accentColor: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
