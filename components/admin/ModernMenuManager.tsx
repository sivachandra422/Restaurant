'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Grid3X3, 
  List, 
  Edit, 
  Trash2, 
  Star,
  Clock,
  Utensils,
  CheckCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { sriKanyaMenu } from '@/data/sriKanyaMenu';

// Real MenuItem interface matching your data structure
interface MenuItem {
  id: string;
  name: string;
  nameHi?: string;
  nameTe?: string;
  description: string;
  descriptionHi?: string;
  descriptionTe?: string;
  price: number;
  category: string;
  isVeg: boolean;
  isSignature?: boolean;
  isSpecial?: boolean;
  image: string;
  maxQuantity?: number;
  minQuantity?: number;
  preparationTime?: number;
  popularity?: number;
  trending?: boolean;
  isDisabled?: boolean;
}

// API Response interface
interface MenuApiResponse {
  [category: string]: MenuItem[];
}

const categories = [
  'biryanis', 'starters', 'main_course', 'rice_noodles', 
  'breads', 'desserts', 'beverages', 'combos'
];

const categoryDisplayNames: Record<string, string> = {
  'biryanis': 'Biryani',
  'starters': 'Starters',
  'main_course': 'Main Course',
  'rice_noodles': 'Rice & Noodles',
  'breads': 'Breads',
  'desserts': 'Desserts',
  'beverages': 'Beverages',
  'combos': 'Combos'
};

export default function ModernMenuManager() {
  const { toast } = useToast();
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Load all menu items on component mount
  useEffect(() => {
    loadMenuItems();
  }, []);

  // Filter items when search or category changes
  useEffect(() => {
    filterItems();
  }, [searchQuery, selectedCategory, allMenuItems]);

  const loadMenuItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/menu');
      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      // Handle different response formats
      let allItems: MenuItem[] = [];
      
      if (Array.isArray(data)) {
        // If API returns array format
        allItems = data.flatMap(category => 
          category.items ? category.items.map((item: any) => ({
            ...item,
            category: category.name || category.slug || 'unknown'
          })) : []
        );
      } else if (typeof data === 'object' && data !== null) {
        // If API returns object format (like sriKanyaMenu)
        allItems = Object.entries(data).flatMap(([category, items]) => 
          Array.isArray(items) ? items.map((item: any) => ({
            ...item,
            category: category
          })) : []
        );
      }
      
      // Ensure all items have required fields
      allItems = allItems.map(item => ({
        id: item.id || `item_${Date.now()}_${Math.random()}`,
        name: item.name || 'Unnamed Item',
        description: item.description || 'No description available',
        price: item.price || 0,
        category: item.category || 'unknown',
        isVeg: item.isVeg || false,
        isSignature: item.isSignature || false,
        isSpecial: item.isSpecial || false,
        image: item.image || '',
        maxQuantity: item.maxQuantity || 10,
        minQuantity: item.minQuantity || 1,
        preparationTime: item.preparationTime || 15,
        popularity: item.popularity || 5,
        trending: item.trending || false,
        isDisabled: item.isDisabled || false,
        nameHi: item.nameHi,
        nameTe: item.nameTe,
        descriptionHi: item.descriptionHi,
        descriptionTe: item.descriptionTe
      }));
      
      setAllMenuItems(allItems);
      console.log(`Loaded ${allItems.length} menu items:`, allItems);
      
    } catch (err) {
      console.error('Error loading menu items:', err);
      
      // Fallback to static data if API fails
      console.log('Falling back to static menu data');
      try {
        const staticItems: MenuItem[] = Object.entries(sriKanyaMenu).flatMap(([category, items]) => 
          items.map((item: any) => ({
            ...item,
            category: category,
            id: item.id || `static_${category}_${Math.random()}`
          }))
        );
        
        setAllMenuItems(staticItems);
        console.log(`Loaded ${staticItems.length} static menu items as fallback`);
        
        toast({
          title: "Info",
          description: `Loaded ${staticItems.length} menu items from static data (API unavailable)`,
        });
        
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
        setError('Failed to load menu items. Please try again.');
        toast({
          title: "Error",
          description: "Failed to load menu items. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = allMenuItems;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        (item.nameHi && item.nameHi.toLowerCase().includes(query)) ||
        (item.nameTe && item.nameTe.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleAddItem = async (newItem: Omit<MenuItem, 'id'>) => {
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });

      if (!response.ok) {
        throw new Error('Failed to create menu item');
      }

      const result = await response.json();
      
      if (result.success) {
                 // Add to local state
         const itemWithId: MenuItem = {
           ...newItem,
           id: result.item?.id || Date.now().toString()
         };
        
        setAllMenuItems(prev => [...prev, itemWithId]);
        setShowAddDialog(false);
        
        toast({
          title: "Success",
          description: "Menu item created successfully!",
        });
      } else {
        throw new Error(result.message || 'Failed to create menu item');
      }
      
    } catch (err) {
      console.error('Error creating menu item:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to create menu item',
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditItem = async (updatedItem: MenuItem) => {
    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/menu/${updatedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      });

      if (!response.ok) {
        throw new Error('Failed to update menu item');
      }

      const result = await response.json();
      
      if (result.success) {
                 // Update local state
         setAllMenuItems(prev => prev.map(item => 
           item.id === updatedItem.id ? updatedItem : item
         ));
        setEditingItem(null);
        
        toast({
          title: "Success",
          description: "Menu item updated successfully!",
        });
      } else {
        throw new Error(result.message || 'Failed to update menu item');
      }
      
    } catch (err) {
      console.error('Error updating menu item:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to update menu item',
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/menu/${itemId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete menu item');
      }

      const result = await response.json();
      
      if (result.success) {
        // Remove from local state
        setAllMenuItems(prev => prev.filter(item => item.id !== itemId));
        setDeleteConfirm(null);
        
        toast({
          title: "Success",
          description: "Menu item deleted successfully!",
        });
      } else {
        throw new Error(result.message || 'Failed to delete menu item');
      }
      
    } catch (err) {
      console.error('Error deleting menu item:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to delete menu item',
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleItemStatus = async (itemId: string, field: keyof MenuItem) => {
    try {
      const item = allMenuItems.find(item => item.id === itemId);
      if (!item) return;

      const updatedItem = { ...item, [field]: !item[field] };
      
      // Optimistically update UI
      setAllMenuItems(prev => prev.map(item => 
        item.id === itemId ? updatedItem : item
      ));

      // Send update to server
      const response = await fetch(`/api/menu/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem)
      });

      if (!response.ok) {
        // Revert on failure
        setAllMenuItems(prev => prev.map(item => 
          item.id === itemId ? item : item
        ));
        throw new Error('Failed to update item status');
      }

    } catch (err) {
      console.error('Error updating item status:', err);
      toast({
        title: "Error",
        description: "Failed to update item status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'biryanis': 'bg-purple-100 text-purple-800',
      'starters': 'bg-blue-100 text-blue-800',
      'main_course': 'bg-green-100 text-green-800',
      'rice_noodles': 'bg-orange-100 text-orange-800',
      'breads': 'bg-yellow-100 text-yellow-800',
      'desserts': 'bg-pink-100 text-pink-800',
      'beverages': 'bg-cyan-100 text-cyan-800',
      'combos': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">Loading Menu Items...</h3>
          <p className="text-slate-600">Please wait while we fetch your menu data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">Error Loading Menu</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={loadMenuItems} className="bg-orange-500 hover:bg-orange-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Menu Management</h1>
          <p className="text-slate-600 mt-1">
            Manage your {allMenuItems.length} menu items across {categories.length} categories
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="hidden md:flex"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4 mr-2" /> : <Grid3X3 className="w-4 h-4 mr-2" />}
            {viewMode === 'grid' ? 'List View' : 'Grid View'}
          </Button>
          
          <Button
            variant="outline"
            onClick={loadMenuItems}
            disabled={isLoading}
            className="hidden md:flex"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Menu Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Menu Item</DialogTitle>
              </DialogHeader>
              <AddEditMenuItemForm 
                onSubmit={handleAddItem}
                onCancel={() => setShowAddDialog(false)}
                isSaving={isSaving}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Items</p>
                <p className="text-2xl font-bold text-blue-900">{allMenuItems.length}</p>
              </div>
              <Utensils className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">Available Items</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {allMenuItems.filter(item => !item.isDisabled).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Signature Items</p>
                <p className="text-2xl font-bold text-orange-900">
                  {allMenuItems.filter(item => item.isSignature).length}
                </p>
              </div>
              <Star className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Categories</p>
                <p className="text-2xl font-bold text-purple-900">{categories.length}</p>
              </div>
              <Filter className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search menu items by name, description, or language..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {categoryDisplayNames[category] || category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredItems.length)} of {filteredItems.length} items
          {searchQuery || selectedCategory !== 'all' && ` (filtered)`}
        </p>
        
        {filteredItems.length > 0 && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Menu Items Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-3">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Utensils className="w-16 h-16 text-slate-400" />
                    )}
                  </div>
                  
                  <div className="absolute top-2 left-2 space-y-1">
                    {item.isVeg && (
                      <Badge className="bg-green-100 text-green-800 text-xs">🥬 Veg</Badge>
                    )}
                    {item.isSignature && (
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">⭐ Signature</Badge>
                    )}
                    {item.isSpecial && (
                      <Badge className="bg-purple-100 text-purple-800 text-xs">🎯 Special</Badge>
                    )}
                    {item.trending && (
                      <Badge className="bg-red-100 text-red-800 text-xs">🔥 Trending</Badge>
                    )}
                  </div>

                  {/* Availability Toggle */}
                  <div className="absolute top-2 right-2">
                    <Switch
                      checked={!item.isDisabled}
                      onCheckedChange={() => toggleItemStatus(item.id, 'isDisabled')}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg mb-1">{item.name}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>
                  {item.nameHi && (
                    <p className="text-xs text-slate-500 mt-1">🇮🇳 {item.nameHi}</p>
                  )}
                  {item.nameTe && (
                    <p className="text-xs text-slate-500">🇮🇳 {item.nameTe}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={getCategoryColor(item.category)}>
                    {categoryDisplayNames[item.category] || item.category}
                  </Badge>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">₹{item.price}</p>
                    {item.preparationTime && (
                      <div className="flex items-center space-x-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{item.preparationTime}min</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    {item.popularity && (
                      <>
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{item.popularity}/10</span>
                      </>
                    )}
                    {item.maxQuantity && (
                      <span className="text-slate-500">Max: {item.maxQuantity}</span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 pt-3 border-t border-slate-100">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setEditingItem(item)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setDeleteConfirm(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No menu items found</h3>
            <p className="text-slate-500 mb-4">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start by adding your first menu item'
              }
            </p>
            {(searchQuery || selectedCategory !== 'all') ? (
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}>
                Clear All Filters
              </Button>
            ) : (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Item
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Menu Item</DialogTitle>
            </DialogHeader>
                         <AddEditMenuItemForm 
               item={editingItem}
               onSubmit={(updatedItem) => handleEditItem(updatedItem as MenuItem)}
               onCancel={() => setEditingItem(null)}
               isSaving={isSaving}
             />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Menu Item</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-slate-600">
                Are you sure you want to delete this menu item? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteItem(deleteConfirm)}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Enhanced Add/Edit Form Component
function AddEditMenuItemForm({ 
  item, 
  onSubmit, 
  onCancel,
  isSaving
}: { 
  item?: MenuItem; 
  onSubmit: (item: Omit<MenuItem, 'id'>) => void; 
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    nameHi: item?.nameHi || '',
    nameTe: item?.nameTe || '',
    description: item?.description || '',
    descriptionHi: item?.descriptionHi || '',
    descriptionTe: item?.descriptionTe || '',
    price: item?.price || 0,
    category: item?.category || 'starters',
    isVeg: item?.isVeg || false,
    isSignature: item?.isSignature || false,
    isSpecial: item?.isSpecial || false,
    image: item?.image || '',
    maxQuantity: item?.maxQuantity || 10,
    minQuantity: item?.minQuantity || 1,
    preparationTime: item?.preparationTime || 15,
    popularity: item?.popularity || 5,
    trending: item?.trending || false,
    isDisabled: item?.isDisabled || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Item Name (English)</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Chicken 555"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
            placeholder="220"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nameHi">Item Name (Hindi)</Label>
          <Input
            id="nameHi"
            value={formData.nameHi}
            onChange={(e) => setFormData(prev => ({ ...prev, nameHi: e.target.value }))}
            placeholder="e.g., चिकन 555"
          />
        </div>
        
        <div>
          <Label htmlFor="nameTe">Item Name (Telugu)</Label>
          <Input
            id="nameTe"
            value={formData.nameTe}
            onChange={(e) => setFormData(prev => ({ ...prev, nameTe: e.target.value }))}
            placeholder="e.g., చికెన్ 555"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description (English)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe the dish..."
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="descriptionHi">Description (Hindi)</Label>
          <Textarea
            id="descriptionHi"
            value={formData.descriptionHi}
            onChange={(e) => setFormData(prev => ({ ...prev, descriptionHi: e.target.value }))}
            placeholder="Hindi description..."
            rows={2}
          />
        </div>
        
        <div>
          <Label htmlFor="descriptionTe">Description (Telugu)</Label>
          <Textarea
            id="descriptionTe"
            value={formData.descriptionTe}
            onChange={(e) => setFormData(prev => ({ ...prev, descriptionTe: e.target.value }))}
            placeholder="Telugu description..."
            rows={2}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {categoryDisplayNames[category] || category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="preparationTime">Preparation Time (minutes)</Label>
          <Input
            id="preparationTime"
            type="number"
            value={formData.preparationTime}
            onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: Number(e.target.value) }))}
            placeholder="15"
            required
          />
        </div>

        <div>
          <Label htmlFor="popularity">Popularity Score (1-10)</Label>
          <Input
            id="popularity"
            type="number"
            min="1"
            max="10"
            value={formData.popularity}
            onChange={(e) => setFormData(prev => ({ ...prev, popularity: Number(e.target.value) }))}
            placeholder="5"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="maxQuantity">Maximum Quantity</Label>
          <Input
            id="maxQuantity"
            type="number"
            value={formData.maxQuantity}
            onChange={(e) => setFormData(prev => ({ ...prev, maxQuantity: Number(e.target.value) }))}
            placeholder="10"
          />
        </div>
        
        <div>
          <Label htmlFor="minQuantity">Minimum Quantity</Label>
          <Input
            id="minQuantity"
            type="number"
            value={formData.minQuantity}
            onChange={(e) => setFormData(prev => ({ ...prev, minQuantity: Number(e.target.value) }))}
            placeholder="1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="isVeg"
            checked={formData.isVeg}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVeg: checked }))}
          />
          <Label htmlFor="isVeg">Vegetarian</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="isSignature"
            checked={formData.isSignature}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isSignature: checked }))}
          />
          <Label htmlFor="isSignature">Signature</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="isSpecial"
            checked={formData.isSpecial}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isSpecial: checked }))}
          />
          <Label htmlFor="isSpecial">Special</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="trending"
            checked={formData.trending}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, trending: checked }))}
          />
          <Label htmlFor="trending">Trending</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {item ? 'Update Item' : 'Add Item'}
        </Button>
      </div>
    </form>
  );
}
