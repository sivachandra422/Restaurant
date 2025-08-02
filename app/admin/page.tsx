'use client';

import React, { useState, useEffect } from 'react';
import { 
  ChefHat, 
  BarChart3, 
  Settings, 
  Users, 
  Star, 
  TrendingUp, 
  DollarSign,
  Plus,
  Edit,
  Eye,
  EyeOff,
  LogOut,
  Lock,
  X,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { useMenu } from '@/contexts/MenuContext';
import { menuCategories } from '@/data/sriKanyaMenu';

interface AdminState {
  isAuthenticated: boolean;
  currentSection: 'dashboard' | 'menu' | 'analytics' | 'feedback' | 'settings';
}

interface EditModalState {
  isOpen: boolean;
  item: any | null;
}

export default function AdminPage() {
  const { analytics } = useAnalytics();
  const { getAllItems, updateMenuItem, toggleItemVisibility } = useMenu();
  const [adminState, setAdminState] = useState<AdminState>({
    isAuthenticated: false,
    currentSection: 'dashboard'
  });
  const [password, setPassword] = useState('');
  const [editModal, setEditModal] = useState<EditModalState>({
    isOpen: false,
    item: null
  });

  // Simple authentication (you can change this password)
  const ADMIN_PASSWORD = 'srikanya2024';

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAdminState({ ...adminState, isAuthenticated: true });
    } else {
      alert('Incorrect password!');
    }
  };

  const handleLogout = () => {
    setAdminState({ isAuthenticated: false, currentSection: 'dashboard' });
    setPassword('');
  };

  const openEditModal = (item: any) => {
    setEditModal({
      isOpen: true,
      item: { ...item }
    });
  };

  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      item: null
    });
  };

  const handleSaveEdit = () => {
    if (editModal.item) {
      // Update the item using the shared context
      updateMenuItem(editModal.item.id, editModal.item);
      closeEditModal();
    }
  };

  const updateEditItem = (field: string, value: any) => {
    if (editModal.item) {
      setEditModal({
        ...editModal,
        item: {
          ...editModal.item,
          [field]: value
        }
      });
    }
  };

  if (!adminState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h1>
            <p className="text-gray-600">Enter password to access admin dashboard</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button 
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              Login to Admin
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <ChefHat className="w-8 h-8 text-orange-500" />
              <h1 className="text-xl font-bold text-gray-900">Sri Kanya Restaurant Admin</h1>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'menu', label: 'Menu Management', icon: ChefHat },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'feedback', label: 'Customer Feedback', icon: Star },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setAdminState({ ...adminState, currentSection: id as any })}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                  adminState.currentSection === id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {adminState.currentSection === 'dashboard' && <DashboardSection analytics={analytics} />}
        {adminState.currentSection === 'menu' && <MenuManagementSection menuItems={getAllItems()} onToggleVisibility={toggleItemVisibility} onEditItem={openEditModal} />}
        {adminState.currentSection === 'analytics' && <AnalyticsSection analytics={analytics} />}
        {adminState.currentSection === 'feedback' && <FeedbackSection analytics={analytics} />}
        {adminState.currentSection === 'settings' && <SettingsSection />}
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && editModal.item && (
        <EditItemModal
          item={editModal.item}
          onClose={closeEditModal}
          onSave={handleSaveEdit}
          onUpdate={updateEditItem}
        />
      )}
    </div>
  );
}

// Edit Item Modal Component
function EditItemModal({ item, onClose, onSave, onUpdate }: { 
  item: any, 
  onClose: () => void, 
  onSave: () => void,
  onUpdate: (field: string, value: any) => void 
}) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Edit Menu Item</h2>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
              <input
                type="text"
                value={item.name}
                onChange={(e) => onUpdate('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
              <input
                type="number"
                value={item.price}
                onChange={(e) => onUpdate('price', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={item.description}
              onChange={(e) => onUpdate('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={item.category}
                onChange={(e) => onUpdate('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {menuCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Quantity</label>
              <input
                type="number"
                value={item.maxQuantity || ''}
                onChange={(e) => onUpdate('maxQuantity', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preparation Time (min)</label>
              <input
                type="number"
                value={item.preparationTime || ''}
                onChange={(e) => onUpdate('preparationTime', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isVeg"
                checked={item.isVeg}
                onChange={(e) => onUpdate('isVeg', e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="isVeg" className="text-sm font-medium text-gray-700">Vegetarian</label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isSignature"
                checked={item.isSignature || false}
                onChange={(e) => onUpdate('isSignature', e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="isSignature" className="text-sm font-medium text-gray-700">Signature Item</label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isSpecial"
                checked={item.isSpecial || false}
                onChange={(e) => onUpdate('isSpecial', e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="isSpecial" className="text-sm font-medium text-gray-700">Special Item</label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isDisabled"
                checked={item.isDisabled || false}
                onChange={(e) => onUpdate('isDisabled', e.target.checked)}
                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="isDisabled" className="text-sm font-medium text-gray-700">Disabled (Hide from customers)</label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button onClick={onSave} className="bg-gradient-to-r from-orange-500 to-red-500">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dashboard Section
function DashboardSection({ analytics }: { analytics: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analytics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analytics.averageOrderValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Per order average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.customerSatisfaction.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground">Average rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentOrders.slice(0, 5).map((order: any) => (
              <div key={order.orderId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Order #{order.orderId.slice(-6)}</p>
                  <p className="text-sm text-gray-600">Table {order.tableNumber} • ₹{order.totalAmount}</p>
                  <p className="text-xs text-gray-500">{new Date(order.timestamp).toLocaleString()}</p>
                </div>
                <Badge variant="outline">{order.items.length} items</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Menu Management Section
function MenuManagementSection({ menuItems, onToggleVisibility, onEditItem }: { 
  menuItems: any[], 
  onToggleVisibility: (id: string) => void,
  onEditItem: (item: any) => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
        <Button className="bg-gradient-to-r from-orange-500 to-red-500">
          <Plus className="w-4 h-4 mr-2" />
          Add New Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Card key={item.id} className={`${item.isDisabled ? 'opacity-60 border-red-200 bg-red-50' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{item.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  {item.isVeg && <Badge className="bg-green-100 text-green-800 text-xs">Veg</Badge>}
                  {item.isSignature && <Badge className="bg-yellow-100 text-yellow-800 text-xs">Signature</Badge>}
                  {item.isSpecial && <Badge className="bg-purple-100 text-purple-800 text-xs">Special</Badge>}
                  {item.isDisabled && <Badge className="bg-red-100 text-red-800 text-xs">Disabled</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-lg">₹{item.price}</p>
                  <p className="text-xs text-gray-500">{item.category}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onEditItem(item)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant={item.isDisabled ? "destructive" : "outline"}
                    onClick={() => onToggleVisibility(item.id)}
                  >
                    {item.isDisabled ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Analytics Section
function AnalyticsSection({ analytics }: { analytics: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Business Analytics</h2>
      
      {/* Popular Items */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.popularItems.slice(0, 10).map((item: any, index: number) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary">#{index + 1}</Badge>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.count} orders • ₹{item.revenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Peak Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Peak Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {analytics.peakHours.map((hour: any) => (
              <div key={hour.hour} className="text-center">
                <div className="text-xs text-gray-500 mb-1">{hour.hour}:00</div>
                <div className="bg-blue-100 rounded p-2">
                  <div className="text-sm font-medium">{hour.orders}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Feedback Section
function FeedbackSection({ analytics }: { analytics: any }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Customer Feedback</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Customer Satisfaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500 mb-2">
              {analytics.customerSatisfaction.toFixed(1)}/5
            </div>
            <div className="flex justify-center space-x-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`w-6 h-6 ${
                    star <= analytics.customerSatisfaction 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`} 
                />
              ))}
            </div>
            <p className="text-gray-600">Average customer rating</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Settings Section
function SettingsSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
              <input 
                type="text" 
                defaultValue="Sri Kanya Restaurant"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
              <input 
                type="tel" 
                defaultValue="+91 98765 43210"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea 
                defaultValue="123 Main Street, City, State - 123456"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 