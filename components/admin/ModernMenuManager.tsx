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
  X,
  Save,
  Image as ImageIcon
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

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isVegetarian: boolean;
  isSpicy: boolean;
  isPopular: boolean;
  isAvailable: boolean;
  preparationTime: number;
  rating: number;
  orderCount: number;
}

const categories = ['Starters', 'Main Course', 'Biryani', 'Rice & Noodles', 'Breads', 'Desserts'];

// Enhanced mock data with more items
const mockMenuItems: MenuItem[] = [
  {
    _id: '1',
    name: 'Chicken 555',
    description: 'Spicy and crispy chicken pieces with aromatic spices',
    price: 220,
    category: 'Starters',
    image: '/menu-images/chicken_555.jpg',
    isVegetarian: false,
    isSpicy: true,
    isPopular: true,
    isAvailable: true,
    preparationTime: 15,
    rating: 4.8,
    orderCount: 156
  },
  {
    _id: '2',
    name: 'Paneer Butter Masala',
    description: 'Creamy and rich cottage cheese in tomato gravy',
    price: 180,
    category: 'Main Course',
    image: '/menu-images/paneer_butter_masala.jpg',
    isVegetarian: true,
    isSpicy: false,
    isPopular: true,
    isAvailable: true,
    preparationTime: 20,
    rating: 4.6,
    orderCount: 98
  },
  {
    _id: '3',
    name: 'Mughlai Biryani',
    description: 'Aromatic basmati rice with tender chicken and spices',
    price: 280,
    category: 'Biryani',
    image: '/menu-images/mughlai_biryani.jpg',
    isVegetarian: false,
    isSpicy: true,
    isPopular: true,
    isAvailable: true,
    preparationTime: 25,
    rating: 4.9,
    orderCount: 203
  },
  {
    _id: '4',
    name: 'Veg Fried Rice',
    description: 'Stir-fried rice with fresh vegetables and soy sauce',
    price: 160,
    category: 'Rice & Noodles',
    image: '/menu-images/veg_fried_rice.jpg',
    isVegetarian: true,
    isSpicy: false,
    isPopular: false,
    isAvailable: true,
    preparationTime: 12,
    rating: 4.3,
    orderCount: 67
  },
  {
    _id: '5',
    name: 'Chicken 65',
    description: 'Spicy deep-fried chicken with curry leaves',
    price: 200,
    category: 'Starters',
    image: '/menu-images/chicken_65.jpg',
    isVegetarian: false,
    isSpicy: true,
    isPopular: true,
    isAvailable: true,
    preparationTime: 18,
    rating: 4.7,
    orderCount: 134
  },
  {
    _id: '6',
    name: 'Butter Chicken',
    description: 'Tender chicken in rich tomato and butter gravy',
    price: 250,
    category: 'Main Course',
    image: '/menu-images/butter_chicken.jpg',
    isVegetarian: false,
    isSpicy: false,
    isPopular: true,
    isAvailable: true,
    preparationTime: 22,
    rating: 4.8,
    orderCount: 189
  }
];

export default function ModernMenuManager() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = (newItem: Omit<MenuItem, '_id' | 'rating' | 'orderCount'>) => {
    const item: MenuItem = {
      ...newItem,
      _id: Date.now().toString(),
      rating: 0,
      orderCount: 0
    };
    setMenuItems(prev => [...prev, item]);
    setShowAddDialog(false);
  };

  const handleEditItem = (updatedItem: MenuItem) => {
    setMenuItems(prev => prev.map(item => 
      item._id === updatedItem._id ? updatedItem : item
    ));
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
    setMenuItems(prev => prev.filter(item => item._id !== itemId));
    setDeleteConfirm(null);
  };

  const toggleItemStatus = (itemId: string, field: keyof MenuItem) => {
    setMenuItems(prev => prev.map(item => 
      item._id === itemId ? { ...item, [field]: !item[field] } : item
    ));
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Starters': 'bg-blue-100 text-blue-800',
      'Main Course': 'bg-green-100 text-green-800',
      'Biryani': 'bg-purple-100 text-purple-800',
      'Rice & Noodles': 'bg-orange-100 text-orange-800',
      'Breads': 'bg-yellow-100 text-yellow-800',
      'Desserts': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Menu Management</h1>
          <p className="text-slate-600 mt-1">Create, edit, and organize your restaurant menu items</p>
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
                <p className="text-2xl font-bold text-blue-900">{menuItems.length}</p>
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
                  {menuItems.filter(item => item.isAvailable).length}
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
                <p className="text-sm font-medium text-orange-600">Popular Items</p>
                <p className="text-2xl font-bold text-orange-900">
                  {menuItems.filter(item => item.isPopular).length}
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
              <Utensils className="w-8 h-8 text-purple-600" />
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
                  placeholder="Search menu items..."
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
                  <SelectItem key={category} value={category}>{category}</SelectItem>
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

      {/* Menu Items Grid */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card key={item._id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
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
                      <ImageIcon className="w-16 h-16 text-slate-400" />
                    )}
                  </div>
                  
                  <div className="absolute top-2 left-2 space-y-1">
                    {item.isVegetarian && (
                      <Badge className="bg-green-100 text-green-800 text-xs">🥬 Veg</Badge>
                    )}
                    {item.isSpicy && (
                      <Badge className="bg-red-100 text-red-800 text-xs">🌶️ Spicy</Badge>
                    )}
                    {item.isPopular && (
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">⭐ Popular</Badge>
                    )}
                  </div>

                  {/* Availability Toggle */}
                  <div className="absolute top-2 right-2">
                    <Switch
                      checked={item.isAvailable}
                      onCheckedChange={() => toggleItemStatus(item._id, 'isAvailable')}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg mb-1">{item.name}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={getCategoryColor(item.category)}>
                    {item.category}
                  </Badge>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">₹{item.price}</p>
                    <div className="flex items-center space-x-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{item.preparationTime}min</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{item.rating}</span>
                    <span className="text-slate-500">({item.orderCount} orders)</span>
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
                    onClick={() => setDeleteConfirm(item._id)}
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
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Add/Edit Form Component
function AddEditMenuItemForm({ 
  item, 
  onSubmit, 
  onCancel 
}: { 
  item?: MenuItem; 
  onSubmit: (item: Omit<MenuItem, '_id' | 'rating' | 'orderCount'> | MenuItem) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || 0,
    category: item?.category || 'Starters',
    image: item?.image || '',
    isVegetarian: item?.isVegetarian || false,
    isSpicy: item?.isSpicy || false,
    isPopular: item?.isPopular || false,
    isAvailable: item?.isAvailable ?? true,
    preparationTime: item?.preparationTime || 15
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item) {
      // Edit existing item - preserve _id, rating, and orderCount
      const updatedItem: MenuItem = {
        ...item,
        ...formData
      };
      onSubmit(updatedItem);
    } else {
      // Add new item
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Item Name</Label>
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

      <div>
        <Label htmlFor="description">Description</Label>
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
          <Label htmlFor="category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
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
            id="isVegetarian"
            checked={formData.isVegetarian}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVegetarian: checked }))}
          />
          <Label htmlFor="isVegetarian">Vegetarian</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="isSpicy"
            checked={formData.isSpicy}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isSpicy: checked }))}
          />
          <Label htmlFor="isSpicy">Spicy</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="isPopular"
            checked={formData.isPopular}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPopular: checked }))}
          />
          <Label htmlFor="isPopular">Popular</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="isAvailable"
            checked={formData.isAvailable}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAvailable: checked }))}
          />
          <Label htmlFor="isAvailable">Available</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
          {item ? 'Update Item' : 'Add Item'}
        </Button>
      </div>
    </form>
  );
}
