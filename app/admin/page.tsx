'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  Bell,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Lock,
  X,
  FileText,
  Download,
  Filter,
  Activity,
  PieChart,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Printer,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdmin } from '@/contexts/AdminContext';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { useMenu } from '@/contexts/MenuContext';
import { useRealTimeOrders } from '@/contexts/RealTimeOrderContext';
import { menuCategories } from '@/data/sriKanyaMenu';
import AdvancedDashboard from '@/components/admin/AdvancedDashboard';
import AIDashboard from '@/components/admin/AIDashboard';
import ReportsSection from '@/components/admin/ReportsSection';
import SettingsSection from '@/components/admin/SettingsSection';
import BackupSection from '@/components/admin/BackupSection';
import RealTimeTest from '@/components/admin/RealTimeTest';
import RealTimeOrderManager from '@/components/admin/RealTimeOrderManager';

interface EditModalState {
  isOpen: boolean;
  item: any | null;
}

interface OrderDetailsModalState {
  isOpen: boolean;
  order: any | null;
}

export default function AdminPage() {
  const router = useRouter();
  const { state: adminState, logout, setSection, checkAuth, getAuthHeaders } = useAdmin();
  const { analytics } = useAnalytics();
  const { getAllItems, updateMenuItem, toggleItemVisibility, createMenuItem, deleteMenuItem } = useMenu();
  const { isConnected: ordersConnected } = useRealTimeOrders();
  
  console.log('AdminPage render - State:', {
    isAuthenticated: adminState.isAuthenticated,
    user: adminState.user,
    isLoading: adminState.isLoading,
    currentSection: adminState.currentSection
  });
  
  const [editModal, setEditModal] = useState<EditModalState>({
    isOpen: false,
    item: null
  });
  const [orderDetailsModal, setOrderDetailsModal] = useState<OrderDetailsModalState>({
    isOpen: false,
    order: null
  });

  // Real-time orders state
  const [realOrders, setRealOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Analytics and settings state
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [reportsData, setReportsData] = useState<any>(null);

  // Check authentication on mount
  useEffect(() => {
    console.log('Admin page - Authentication state:', adminState.isAuthenticated);
    console.log('Admin page - User:', adminState.user);
    console.log('Admin page - Loading state:', adminState.isLoading);
    
    // Only check authentication after context has finished loading
    if (!adminState.isLoading) {
      // Add a small delay to ensure state is properly updated
      const timer = setTimeout(() => {
        if (!adminState.isAuthenticated) {
          console.log('Admin page - Not authenticated, redirecting to login');
          router.push('/admin/login');
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [adminState.isAuthenticated, adminState.isLoading, adminState.user, router]);

  // Fetch real orders from database
  const fetchRealOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const response = await fetch('/api/orders', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const orders = await response.json();
        setRealOrders(orders);
        setLastRefresh(new Date());
        console.log('Fetched real orders from database:', orders);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  }, [getAuthHeaders]);



  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/analytics', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  }, [getAuthHeaders]);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  }, [getAuthHeaders]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/notifications', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [getAuthHeaders]);

  // Fetch orders on mount and set up polling
  useEffect(() => {
    if (adminState.isAuthenticated) {
      fetchRealOrders();
      fetchAnalytics();
      fetchSettings();
      fetchNotifications();
      
      // Poll for new orders every 30 seconds if auto-refresh is enabled
      if (adminState.preferences.autoRefresh) {
        const interval = setInterval(() => {
          fetchRealOrders();
          fetchNotifications();
        }, 30000);
        return () => clearInterval(interval);
      }
    }
  }, [adminState.isAuthenticated, adminState.preferences.autoRefresh, fetchRealOrders, fetchAnalytics, fetchSettings, fetchNotifications]);



  const handleLogout = () => {
    logout();
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

  const handleSaveEdit = async () => {
    if (editModal.item) {
      try {
        await updateMenuItem(editModal.item.id, editModal.item);
        closeEditModal();
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm bg-green-500';
        notification.textContent = 'Menu item updated successfully!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 3000);
      } catch (error) {
        console.error('Error updating menu item:', error);
        
        // Show error notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm bg-red-500';
        notification.textContent = 'Failed to update menu item';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 3000);
      }
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

  const handleCreateNewItem = () => {
    setEditModal({
      isOpen: true,
      item: {
        id: '',
        name: '',
        description: '',
        price: 0,
        category: 'starters',
        isVeg: false,
        isSignature: false,
        isSpecial: false,
        isDisabled: false,
        image: '/menu-images/default.jpg',
        maxQuantity: 10,
        minQuantity: 1,
        preparationTime: 15
      }
    });
  };

  const handleSaveNewItem = async () => {
    if (editModal.item && !editModal.item.id) {
      try {
        await createMenuItem(editModal.item);
        closeEditModal();
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm bg-green-500';
        notification.textContent = 'Menu item created successfully!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 3000);
      } catch (error) {
        console.error('Error creating menu item:', error);
        
        // Show error notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm bg-red-500';
        notification.textContent = 'Failed to create menu item';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 3000);
      }
    }
  };

  // If context is still loading, show loading
  if (adminState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!adminState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  console.log('Rendering section:', adminState.currentSection);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <ChefHat className="w-8 h-8 text-orange-500" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sri Kanya Family Restaurant Admin</h1>
                <p className="text-sm text-gray-500">Welcome back, {adminState.user?.username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={fetchRealOrders} 
                variant="outline" 
                size="sm"
                disabled={ordersLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${ordersLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'orders', label: 'Orders', icon: Users },
              { id: 'menu', label: 'Menu Management', icon: ChefHat },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'feedback', label: 'Customer Feedback', icon: Star },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSection(id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
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
        {adminState.currentSection === 'dashboard' && (
          <RealTimeOrderManager />
        )}
        {adminState.currentSection === 'orders' && (
          <OrdersSection 
            orders={realOrders}
            loading={ordersLoading}
            onOrderClick={(order) => setOrderDetailsModal({ isOpen: true, order })}
            onRefresh={fetchRealOrders}
          />
        )}
        {adminState.currentSection === 'menu' && (
          <MenuManagementSection 
            menuItems={getAllItems()} 
            onToggleVisibility={toggleItemVisibility} 
            onEditItem={openEditModal}
            onCreateItem={handleCreateNewItem}
            onDeleteItem={deleteMenuItem}
          />
        )}
        {adminState.currentSection === 'analytics' && (
          <div>
            <RealTimeTest />
                        <ReportsSection />
          </div>
        )}
        {adminState.currentSection === 'backup' && (
          <BackupSection 
            getAuthHeaders={getAuthHeaders}
          />
        )}
        {adminState.currentSection === 'feedback' && (
          <FeedbackSection analytics={analytics} />
        )}
        {adminState.currentSection === 'settings' && (
          <SettingsSection 
            settings={settings}
            onSaveSettings={async (newSettings) => {
              const response = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(newSettings)
              });
              if (response.ok) {
                setSettings(newSettings);
              }
            }}
          />
        )}
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && editModal.item && (
        <EditItemModal
          item={editModal.item}
          onClose={closeEditModal}
          onSave={editModal.item.id ? handleSaveEdit : handleSaveNewItem}
          onUpdate={updateEditItem}
        />
      )}

      {/* Order Details Modal */}
      {orderDetailsModal.isOpen && orderDetailsModal.order && (
        <OrderDetailsModal 
          order={orderDetailsModal.order} 
          onClose={() => setOrderDetailsModal({ isOpen: false, order: null })} 
        />
      )}
    </div>
  );
}

// Dashboard Section
function DashboardSection({ 
  realOrders, 
  ordersLoading, 
  lastRefresh,
  onOrderClick 
}: { 
  realOrders: any[], 
  ordersLoading: boolean,
  lastRefresh: Date,
  onOrderClick: (order: any) => void 
}) {
  // Calculate analytics from real orders
  const totalOrders = realOrders.length;
  const totalRevenue = realOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Get recent orders (last 5)
  const recentOrders = realOrders.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <div className="text-sm text-gray-500">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{averageOrderValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Per order average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.5/5</div>
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
          {ordersLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading orders...</p>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order: any) => (
                <div 
                  key={order._id || order.orderId} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => onOrderClick(order)}
                >
                  <div>
                    <p className="font-medium">Order #{order.orderId?.slice(-6) || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Table {order.tableNumber} • ₹{order.totalAmount || order.orderSummary?.grandTotal}</p>
                    <p className="text-xs text-gray-500">{new Date(order.timestamp || order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{order.items?.length || 0} items</Badge>
                    <Eye className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Orders Section
function OrdersSection({ 
  orders, 
  loading, 
  onOrderClick, 
  onRefresh 
}: { 
  orders: any[], 
  loading: boolean,
  onOrderClick: (order: any) => void,
  onRefresh: () => void
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingOrder(orderId);
    try {
      console.log('Updating order status:', { orderId, status });
      
      // Get admin token from cookies
      const adminToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('admin-token='))
        ?.split('=')[1] || '';
      
      console.log('Admin token found:', !!adminToken);
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status })
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Order updated successfully:', result);
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm bg-green-500';
        notification.textContent = `Order status updated to ${status}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 3000);

        // Refresh orders list
        onRefresh();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to update order:', errorData);
        throw new Error(errorData.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm bg-red-500';
      notification.textContent = `Failed to update order status: ${error instanceof Error ? error.message : 'Unknown error'}`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      confirmed: { color: 'bg-green-100 text-green-800', label: 'Confirmed' },
      preparing: { color: 'bg-blue-100 text-blue-800', label: 'Preparing' },
      ready: { color: 'bg-purple-100 text-purple-800', label: 'Ready' },
      delivered: { color: 'bg-gray-100 text-gray-800', label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getStatusActions = (order: any) => {
    const currentStatus = order.status || 'pending';
    
    switch (currentStatus) {
      case 'pending':
        return (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                updateOrderStatus(order._id, 'confirmed');
              }}
              disabled={updatingOrder === order._id}
              className="bg-green-500 hover:bg-green-600"
            >
              {updatingOrder === order._id ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              ) : (
                'Confirm'
              )}
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation();
                updateOrderStatus(order._id, 'cancelled');
              }}
              disabled={updatingOrder === order._id}
            >
              Cancel
            </Button>
          </div>
        );
      case 'confirmed':
        return (
          <Button 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              updateOrderStatus(order._id, 'preparing');
            }}
            disabled={updatingOrder === order._id}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {updatingOrder === order._id ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            ) : (
              'Start Preparing'
            )}
          </Button>
        );
      case 'preparing':
        return (
          <Button 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              updateOrderStatus(order._id, 'ready');
            }}
            disabled={updatingOrder === order._id}
            className="bg-purple-500 hover:bg-purple-600"
          >
            {updatingOrder === order._id ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            ) : (
              'Mark Ready'
            )}
          </Button>
        );
      case 'ready':
        return (
          <Button 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              updateOrderStatus(order._id, 'delivered');
            }}
            disabled={updatingOrder === order._id}
            className="bg-gray-500 hover:bg-gray-600"
          >
            {updatingOrder === order._id ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            ) : (
              'Mark Delivered'
            )}
          </Button>
        );
      default:
        return null;
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">All Orders</h2>
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button onClick={onRefresh} disabled={loading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="divide-y">
              {orders
                .filter((order: any) => statusFilter === 'all' || order.status === statusFilter)
                .map((order: any) => (
                <div 
                  key={order._id || order.orderId}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => onOrderClick(order)}>
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium">Order #{order.orderId?.slice(-6) || 'N/A'}</p>
                          <p className="text-sm text-gray-600">Table {order.tableNumber}</p>
                          <p className="text-xs text-gray-500">{new Date(order.timestamp || order.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(order.status || 'pending')}
                          <Badge variant="outline">{order.items?.length || 0} items</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">₹{order.totalAmount || order.orderSummary?.grandTotal}</p>
                        <p className="text-xs text-gray-500">
                          {order.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.paymentMethod === 'phonepe' ? 'PhonePe' : order.paymentMethod === 'cash' ? 'Cash' : 'Unknown'}
                        </p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {getStatusActions(order)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Menu Management Section
function MenuManagementSection({ 
  menuItems, 
  onToggleVisibility, 
  onEditItem, 
  onCreateItem, 
  onDeleteItem 
}: { 
  menuItems: any[], 
  onToggleVisibility: (id: string) => void,
  onEditItem: (item: any) => void,
  onCreateItem: () => void,
  onDeleteItem: (id: string) => Promise<void>
}) {
  const handleDeleteItem = async (id: string, itemName: string) => {
    if (confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      try {
        await onDeleteItem(id);
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm bg-green-500';
        notification.textContent = 'Menu item deleted successfully!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 3000);
      } catch (error) {
        console.error('Error deleting menu item:', error);
        // Show error notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm bg-red-500';
        notification.textContent = 'Failed to delete menu item';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 3000);
      }
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
        <Button 
          onClick={onCreateItem}
          className="bg-gradient-to-r from-orange-500 to-red-500"
        >
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
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDeleteItem(item.id, item.name)}
                  >
                    <Trash2 className="w-3 h-3" />
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
      
      {/* AI Dashboard */}
      <AIDashboard analytics={analytics} orders={[]} />
      
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
  const [feedbackData, setFeedbackData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch individual feedback data
  const fetchFeedback = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        const orders = data.orders || data || [];
        
        // Filter orders with ratings and feedback
        const ordersWithFeedback = orders
          .filter((order: any) => order.rating && order.rating > 0)
          .map((order: any) => ({
            orderId: order.orderId || order._id,
            tableNumber: order.tableNumber,
            rating: order.rating,
            feedback: order.feedback,
            items: order.items,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt || order.timestamp,
            customerName: order.customerName || 'Anonymous'
          }))
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setFeedbackData(ordersWithFeedback);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  // Listen for order updates to refresh feedback
  useEffect(() => {
    const handleOrderUpdate = (event: CustomEvent) => {
      console.log('Feedback section received order update:', event.detail);
      // Add a small delay to ensure the order is saved to database
      setTimeout(() => {
        fetchFeedback();
      }, 1000);
    };

    const handleNewOrder = (event: CustomEvent) => {
      console.log('Feedback section received new order:', event.detail);
      // Add a small delay to ensure the order is saved to database
      setTimeout(() => {
        fetchFeedback();
      }, 1000);
    };

    const handleFeedbackSubmitted = (event: CustomEvent) => {
      console.log('Feedback section received feedback submission:', event.detail);
      // Refresh feedback immediately when new feedback is submitted
      fetchFeedback();
    };

    window.addEventListener('order-updated', handleOrderUpdate as EventListener);
    window.addEventListener('new-order', handleNewOrder as EventListener);
    window.addEventListener('feedback-submitted', handleFeedbackSubmitted as EventListener);

    return () => {
      window.removeEventListener('order-updated', handleOrderUpdate as EventListener);
      window.removeEventListener('new-order', handleNewOrder as EventListener);
      window.removeEventListener('feedback-submitted', handleFeedbackSubmitted as EventListener);
    };
  }, [fetchFeedback]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Customer Feedback</h2>
        <Button 
          onClick={fetchFeedback} 
          variant="outline" 
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      {/* Customer Satisfaction Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Satisfaction Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500 mb-2">
              {analytics.customerSatisfaction ? analytics.customerSatisfaction.toFixed(1) : '0.0'}/5
            </div>
            <div className="flex justify-center space-x-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`w-6 h-6 ${
                    analytics.customerSatisfaction && star <= analytics.customerSatisfaction 
                      ? 'text-yellow-400 fill-current' 
                      : 'text-gray-300'
                  }`} 
                />
              ))}
            </div>
            <p className="text-gray-600">
              Average customer rating ({analytics.totalRatings || 0} ratings)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Individual Feedback */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading feedback...</p>
            </div>
          ) : feedbackData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No customer feedback yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbackData.map((feedback, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">Order #{feedback.orderId?.slice(-6) || 'N/A'}</span>
                        <Badge variant="outline">Table {feedback.tableNumber}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {feedback.customerName} • {new Date(feedback.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-4 h-4 ${
                              star <= feedback.rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <p className="text-sm font-medium">{feedback.rating}/5</p>
                    </div>
                  </div>
                  
                  {feedback.feedback && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                        &ldquo;{feedback.feedback}&rdquo;
                      </p>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-600">
                    <p>Order Total: ₹{feedback.totalAmount}</p>
                    <p>Items: {feedback.items?.length || 0} items</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
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
          <h2 className="text-xl font-bold text-gray-900">{item.id ? 'Edit Menu Item' : 'Add New Menu Item'}</h2>
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
              {item.id ? 'Save Changes' : 'Create Item'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Order Details Modal
function OrderDetailsModal({ order, onClose }: { order: any, onClose: () => void }) {
  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (!order) return null;

  // Handle different order data structures
  const orderId = order.orderId || order._id;
  const tableNumber = order.tableNumber;
  const timestamp = order.timestamp || order.createdAt;
  const totalAmount = order.totalAmount || order.orderSummary?.grandTotal;
  const items = order.items || [];
  const currentStatus = order.status || 'pending';
  const paymentStatus = order.paymentStatus || 'pending';

  const updateOrderStatus = async (status: string) => {
    setUpdatingStatus(true);
    try {
      console.log('Updating order status:', { orderId, status });
      
      // Get admin token from cookies
      const adminToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('admin-token='))
        ?.split('=')[1] || '';
      
      console.log('Admin token found:', !!adminToken);
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status })
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Order updated successfully:', result);
        
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm bg-green-500';
        notification.textContent = `Order status updated to ${status}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 3000);

        // Close modal and refresh
        onClose();
        window.location.reload(); // Simple refresh for now
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to update order:', errorData);
        throw new Error(errorData.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm bg-red-500';
      notification.textContent = `Failed to update order status: ${error instanceof Error ? error.message : 'Unknown error'}`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const updatePaymentStatus = async (paymentStatus: string) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/orders/${order._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${document.cookie
            .split('; ')
            .find(row => row.startsWith('admin-token='))
            ?.split('=')[1] || ''}`
        },
        body: JSON.stringify({ paymentStatus })
      });

      if (response.ok) {
        // Show success notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm bg-green-500';
        notification.textContent = `Payment status updated to ${paymentStatus}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 3000);

        // Close modal and refresh
        onClose();
        window.location.reload(); // Simple refresh for now
      } else {
        throw new Error('Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      
      // Show error notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm bg-red-500';
      notification.textContent = 'Failed to update payment status';
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      confirmed: { color: 'bg-green-100 text-green-800', label: 'Confirmed' },
      preparing: { color: 'bg-blue-100 text-blue-800', label: 'Preparing' },
      ready: { color: 'bg-purple-100 text-purple-800', label: 'Ready' },
      delivered: { color: 'bg-gray-100 text-gray-800', label: 'Delivered' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Payment' },
      paid: { color: 'bg-green-100 text-green-800', label: 'Paid' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Payment Failed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Order Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Header */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-medium">#{orderId?.slice(-6) || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Table</p>
              <p className="font-medium">{tableNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date & Time</p>
              <p className="font-medium">{new Date(timestamp).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="font-medium text-lg">₹{totalAmount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Order Status</p>
              <div className="flex items-center space-x-2">
                {getStatusBadge(currentStatus)}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <div className="flex items-center space-x-2">
                {getPaymentStatusBadge(paymentStatus)}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-medium">
                {order.paymentMethod === 'phonepe' ? 'PhonePe' : order.paymentMethod === 'cash' ? 'Cash' : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        {/* Order Status Management */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Order Status Management</h3>
          <div className="flex flex-wrap gap-2">
            {currentStatus === 'pending' && (
              <>
                <Button 
                  onClick={() => updateOrderStatus('confirmed')}
                  disabled={updatingStatus}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {updatingStatus ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    'Confirm Order'
                  )}
                </Button>
                <Button 
                  onClick={() => updateOrderStatus('cancelled')}
                  disabled={updatingStatus}
                  variant="destructive"
                >
                  Cancel Order
                </Button>
              </>
            )}
            {currentStatus === 'confirmed' && (
              <Button 
                onClick={() => updateOrderStatus('preparing')}
                disabled={updatingStatus}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {updatingStatus ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Start Preparing'
                )}
              </Button>
            )}
            {currentStatus === 'preparing' && (
              <Button 
                onClick={() => updateOrderStatus('ready')}
                disabled={updatingStatus}
                className="bg-purple-500 hover:bg-purple-600"
              >
                {updatingStatus ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Mark Ready'
                )}
              </Button>
            )}
            {currentStatus === 'ready' && (
              <Button 
                onClick={() => updateOrderStatus('delivered')}
                disabled={updatingStatus}
                className="bg-gray-500 hover:bg-gray-600"
              >
                {updatingStatus ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  'Mark Delivered'
                )}
              </Button>
            )}
            {(currentStatus === 'delivered' || currentStatus === 'cancelled') && (
              <p className="text-sm text-gray-600">
                Order is {currentStatus === 'delivered' ? 'completed' : 'cancelled'}
              </p>
            )}
          </div>
        </div>

        {/* Payment Status Management */}
        <div className="bg-green-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Payment Status Management</h3>
          <div className="flex flex-wrap gap-2">
            {paymentStatus === 'pending' && (
              <>
                <Button 
                  onClick={() => updatePaymentStatus('paid')}
                  disabled={updatingStatus}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {updatingStatus ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    'Mark as Paid'
                  )}
                </Button>
                <Button 
                  onClick={() => updatePaymentStatus('failed')}
                  disabled={updatingStatus}
                  variant="destructive"
                >
                  Mark as Failed
                </Button>
              </>
            )}
            {paymentStatus === 'paid' && (
              <p className="text-sm text-green-600">
                ✅ Payment completed successfully
              </p>
            )}
            {paymentStatus === 'failed' && (
              <>
                <Button 
                  onClick={() => updatePaymentStatus('pending')}
                  disabled={updatingStatus}
                  className="bg-yellow-500 hover:bg-yellow-600"
                >
                  Reset to Pending
                </Button>
                <Button 
                  onClick={() => updatePaymentStatus('paid')}
                  disabled={updatingStatus}
                  className="bg-green-500 hover:bg-green-600"
                >
                  Mark as Paid
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Order Items</h3>
          {items.map((item: any, index: number) => {
            // Calculate subtotal based on available data
            const itemPrice = item.price || item.unitPrice || 0;
            const itemSubtotal = item.subtotal || (itemPrice * item.quantity);
            
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity} × ₹{itemPrice} = ₹{itemSubtotal}
                  </p>
                  {item.isVeg && <Badge className="bg-green-100 text-green-800 text-xs mt-1">Veg</Badge>}
                  {item.isSignature && <Badge className="bg-orange-100 text-orange-800 text-xs mt-1 ml-1">Signature</Badge>}
                  {item.category && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs mt-1 ml-1">{item.category}</Badge>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{itemSubtotal}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Items:</span>
            <span>{items.length}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="font-semibold">Total Amount:</span>
            <span className="font-bold text-lg">₹{totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 