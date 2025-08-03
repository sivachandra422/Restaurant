'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Clock, 
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Calendar,
  HardDrive
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BackupSectionProps {
  getAuthHeaders: () => HeadersInit;
}

interface Backup {
  backupId: string;
  timestamp: string;
  collections: string[];
  ordersCount: number;
  menuCount: number;
  files: string[];
}

export default function BackupSection({ getAuthHeaders }: BackupSectionProps) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [restorePreview, setRestorePreview] = useState<any>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  const fetchBackups = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/backup', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setBackups(data.backups || []);
      } else {
        console.error('Failed to fetch backups');
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders]);

  const createBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const result = await response.json();
        showNotification(`Backup created successfully: ${result.backupId}`, 'success');
        fetchBackups(); // Refresh the list
      } else {
        const error = await response.json();
        showNotification(`Failed to create backup: ${error.error}`, 'error');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      showNotification('Failed to create backup', 'error');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const deleteBackup = async (backupId: string) => {
    if (!confirm(`Are you sure you want to delete backup ${backupId}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/backup?backupId=${backupId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        showNotification('Backup deleted successfully', 'success');
        fetchBackups(); // Refresh the list
      } else {
        const error = await response.json();
        showNotification(`Failed to delete backup: ${error.error}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
      showNotification('Failed to delete backup', 'error');
    }
  };

  const getRestorePreview = async (backupId: string) => {
    try {
      const response = await fetch(`/api/admin/backup/restore?backupId=${backupId}`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setRestorePreview(data);
        setSelectedBackup(backupId);
        setShowRestoreConfirm(true);
      } else {
        const error = await response.json();
        showNotification(`Failed to get restore preview: ${error.error}`, 'error');
      }
    } catch (error) {
      console.error('Error getting restore preview:', error);
      showNotification('Failed to get restore preview', 'error');
    }
  };

  const restoreBackup = async () => {
    if (!selectedBackup) return;

    setIsRestoring(true);
    try {
      const response = await fetch('/api/admin/backup/restore', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          backupId: selectedBackup,
          collections: ['orders', 'menu']
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        showNotification('Backup restored successfully', 'success');
        setShowRestoreConfirm(false);
        setSelectedBackup(null);
        setRestorePreview(null);
      } else {
        const error = await response.json();
        showNotification(`Failed to restore backup: ${error.error}`, 'error');
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      showNotification('Failed to restore backup', 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white text-sm ${
      type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Backup & Restore</h2>
          <p className="text-sm text-gray-600">Manage database backups and restore data</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={fetchBackups} disabled={isLoading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={createBackup} disabled={isCreatingBackup} className="bg-green-600 hover:bg-green-700">
            <Database className="w-4 h-4 mr-2" />
            {isCreatingBackup ? 'Creating...' : 'Create Backup'}
          </Button>
        </div>
      </div>

      {/* Backup Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{backups.length}</p>
                <p className="text-sm text-gray-600">Total Backups</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {backups.reduce((sum, backup) => sum + backup.ordersCount, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Orders Backed Up</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <HardDrive className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {backups.reduce((sum, backup) => sum + backup.menuCount, 0)}
                </p>
                <p className="text-sm text-gray-600">Total Menu Items Backed Up</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Available Backups</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading backups...</p>
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No backups available</p>
              <p className="text-sm text-gray-500">Create your first backup to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {backups.map((backup) => (
                <div key={backup.backupId} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium">{backup.backupId}</h3>
                        <Badge variant="outline" className="text-xs">
                          {backup.collections.length} collections
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(backup.timestamp)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <span>{backup.ordersCount} orders</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <HardDrive className="w-4 h-4" />
                          <span>{backup.menuCount} menu items</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => getRestorePreview(backup.backupId)}
                        size="sm"
                        variant="outline"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Restore
                      </Button>
                      <Button
                        onClick={() => deleteBackup(backup.backupId)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restore Confirmation Modal */}
      {showRestoreConfirm && restorePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <h3 className="text-lg font-semibold">Confirm Restore</h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <p className="text-sm text-gray-600">
                This will replace your current data with the backup from{' '}
                <strong>{formatDate(restorePreview.backupInfo.timestamp)}</strong>
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Orders:</span>
                  <span className="font-medium">{restorePreview.currentState.orders}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Backup Orders:</span>
                  <span className="font-medium">{restorePreview.backupInfo.ordersCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Current Menu Items:</span>
                  <span className="font-medium">{restorePreview.currentState.menu}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Backup Menu Items:</span>
                  <span className="font-medium">{restorePreview.backupInfo.menuCount}</span>
                </div>
              </div>
              
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-700">
                    This action cannot be undone. All current data will be replaced.
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowRestoreConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={restoreBackup}
                disabled={isRestoring}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isRestoring ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Restoring...
                  </>
                ) : (
                  'Confirm Restore'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 