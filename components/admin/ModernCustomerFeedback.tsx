'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Filter,
  Search,
  Download,
  RefreshCw,
  Reply,
  Flag,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Calendar,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Mock feedback data (replace with real API calls)
const mockFeedback = [
  {
    id: 1,
    customerName: 'Rahul Sharma',
    customerEmail: 'rahul.sharma@email.com',
    rating: 5,
    orderId: 'ORD-2024-001',
    orderItems: ['Chicken Dum Biryani', 'Paneer Butter Masala'],
    feedback: 'Excellent food quality! The biryani was perfectly cooked with aromatic spices. Service was quick and staff was very friendly. Will definitely order again!',
    sentiment: 'positive',
    category: 'food_quality',
    status: 'resolved',
    createdAt: '2024-01-15T10:30:00Z',
    response: 'Thank you for your wonderful feedback! We\'re glad you enjoyed our biryani and service. Looking forward to serving you again!',
    responseDate: '2024-01-15T11:00:00Z'
  },
  {
    id: 2,
    customerName: 'Priya Patel',
    customerEmail: 'priya.patel@email.com',
    rating: 4,
    orderId: 'ORD-2024-002',
    orderItems: ['Mughlai Biryani', 'Chicken 555'],
    feedback: 'Great taste and good portion size. The biryani was delicious, though delivery took a bit longer than expected. Overall satisfied with the food quality.',
    sentiment: 'positive',
    category: 'delivery',
    status: 'pending',
    createdAt: '2024-01-15T12:15:00Z',
    response: null,
    responseDate: null
  },
  {
    id: 3,
    customerName: 'Amit Kumar',
    customerEmail: 'amit.kumar@email.com',
    rating: 3,
    orderId: 'ORD-2024-003',
    orderItems: ['Veg Fried Rice', 'Veg Manchurian'],
    feedback: 'Food was okay, but the portion size was smaller than expected for the price. Also, the delivery person was not very polite.',
    sentiment: 'neutral',
    category: 'portion_size',
    status: 'pending',
    createdAt: '2024-01-15T13:45:00Z',
    response: null,
    responseDate: null
  },
  {
    id: 4,
    customerName: 'Sneha Reddy',
    customerEmail: 'sneha.reddy@email.com',
    rating: 5,
    orderId: 'ORD-2024-004',
    orderItems: ['Chicken Biryani', 'Fish Fry'],
    feedback: 'Amazing experience! The biryani was perfectly spiced and the fish fry was crispy and delicious. Delivery was on time and packaging was excellent.',
    sentiment: 'positive',
    category: 'food_quality',
    status: 'resolved',
    createdAt: '2024-01-15T14:20:00Z',
    response: 'Thank you Sneha! We\'re thrilled you loved our biryani and fish fry. Your satisfaction is our priority!',
    responseDate: '2024-01-15T14:45:00Z'
  },
  {
    id: 5,
    customerName: 'Vikram Singh',
    customerEmail: 'vikram.singh@email.com',
    rating: 2,
    orderId: 'ORD-2024-005',
    orderItems: ['Chicken Curry', 'Naan'],
    feedback: 'Very disappointed with the food quality. The chicken was overcooked and the curry lacked flavor. Not worth the money spent.',
    sentiment: 'negative',
    category: 'food_quality',
    status: 'escalated',
    createdAt: '2024-01-15T15:10:00Z',
    response: 'We sincerely apologize for your experience. We\'ve escalated this to our kitchen team and would like to offer you a complimentary meal to make it right.',
    responseDate: '2024-01-15T16:00:00Z'
  }
];

const feedbackCategories = [
  'all',
  'food_quality',
  'delivery',
  'portion_size',
  'service',
  'packaging',
  'pricing'
];

const categoryDisplayNames: Record<string, string> = {
  'all': 'All Categories',
  'food_quality': 'Food Quality',
  'delivery': 'Delivery',
  'portion_size': 'Portion Size',
  'service': 'Service',
  'packaging': 'Packaging',
  'pricing': 'Pricing'
};

const sentimentColors: Record<string, string> = {
  'positive': 'bg-green-100 text-green-800',
  'neutral': 'bg-yellow-100 text-yellow-800',
  'negative': 'bg-red-100 text-red-800'
};

const statusColors: Record<string, string> = {
  'pending': 'bg-orange-100 text-orange-800',
  'resolved': 'bg-green-100 text-green-800',
  'escalated': 'bg-red-100 text-red-800'
};

export default function ModernCustomerFeedback() {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState(mockFeedback);
  const [filteredFeedback, setFilteredFeedback] = useState(mockFeedback);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Filter feedback based on search, category, and status
  useEffect(() => {
    let filtered = feedback;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.customerName.toLowerCase().includes(query) ||
        item.feedback.toLowerCase().includes(query) ||
        item.orderId.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    setFilteredFeedback(filtered);
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedStatus, feedback]);

  // Pagination
  const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFeedback = filteredFeedback.slice(startIndex, endIndex);

  // Calculate statistics
  const totalFeedback = feedback.length;
  const averageRating = feedback.reduce((sum, item) => sum + item.rating, 0) / totalFeedback;
  const positiveFeedback = feedback.filter(item => item.sentiment === 'positive').length;
  const pendingFeedback = feedback.filter(item => item.status === 'pending').length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-slate-300'}`}
      />
    ));
  };

  const handleResponse = (feedbackItem: any) => {
    setSelectedFeedback(feedbackItem);
    setResponseText(feedbackItem.response || '');
    setShowResponseDialog(true);
  };

  const submitResponse = async () => {
    if (!responseText.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update local state
    const updatedFeedback = feedback.map(item => 
      item.id === selectedFeedback.id 
        ? { 
            ...item, 
            response: responseText, 
            responseDate: new Date().toISOString(),
            status: 'resolved'
          }
        : item
    );

    setFeedback(updatedFeedback);
    setShowResponseDialog(false);
    setSelectedFeedback(null);
    setResponseText('');
    setIsSubmitting(false);

    toast({
      title: "Response Sent",
      description: "Your response has been sent to the customer successfully!",
    });
  };

  const handleStatusChange = async (feedbackId: number, newStatus: string) => {
    const updatedFeedback = feedback.map(item => 
      item.id === feedbackId ? { ...item, status: newStatus } : item
    );

    setFeedback(updatedFeedback);
    toast({
      title: "Status Updated",
      description: `Feedback status changed to ${newStatus}`,
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your feedback report is being prepared for download.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customer Feedback</h1>
          <p className="text-slate-600 mt-1">
            Manage customer reviews, ratings, and feedback responses
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleExport}
            className="hidden md:flex"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="hidden md:flex"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Feedback</p>
                <p className="text-2xl font-bold text-blue-900">{totalFeedback}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Average Rating</p>
                <p className="text-2xl font-bold text-yellow-900">{averageRating.toFixed(1)}/5</p>
                <div className="flex mt-1">
                  {getRatingStars(Math.round(averageRating))}
                </div>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Positive Feedback</p>
                <p className="text-2xl font-bold text-green-900">{positiveFeedback}</p>
                <p className="text-xs text-green-700 mt-1">
                  {((positiveFeedback / totalFeedback) * 100).toFixed(1)}% of total
                </p>
              </div>
              <ThumbsUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Pending Response</p>
                <p className="text-2xl font-bold text-orange-900">{pendingFeedback}</p>
                <p className="text-xs text-orange-700 mt-1">Requires attention</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
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
                  placeholder="Search feedback by customer name, feedback text, or order ID..."
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
                {feedbackCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {categoryDisplayNames[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedStatus('all');
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredFeedback.length)} of {filteredFeedback.length} feedback items
        </p>
        
        {filteredFeedback.length > 0 && (
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

      {/* Feedback List */}
      <div className="space-y-4">
        {currentFeedback.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {item.customerName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{item.customerName}</h3>
                        <p className="text-sm text-slate-600">{item.customerEmail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        {getRatingStars(item.rating)}
                      </div>
                      <Badge className={sentimentColors[item.sentiment]}>
                        {item.sentiment === 'positive' ? <ThumbsUp className="w-3 h-3 mr-1" /> : 
                         item.sentiment === 'negative' ? <ThumbsDown className="w-3 h-3 mr-1" /> : 
                         <AlertCircle className="w-3 h-3 mr-1" />}
                        {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-slate-700 mb-1">
                      Order: {item.orderId}
                    </p>
                    <p className="text-sm text-slate-600">
                      Items: {item.orderItems.join(', ')}
                    </p>
                  </div>

                  {/* Feedback */}
                  <div>
                    <p className="text-slate-800">{item.feedback}</p>
                  </div>

                  {/* Category and Date */}
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <Badge variant="outline" className="capitalize">
                      {categoryDisplayNames[item.category]}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </div>

                  {/* Response */}
                  {item.response && (
                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                      <p className="text-sm font-medium text-blue-800 mb-1">Your Response:</p>
                      <p className="text-sm text-blue-700">{item.response}</p>
                      <p className="text-xs text-blue-600 mt-2">
                        Responded on {formatDate(item.responseDate!)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 lg:ml-4">
                  <Badge className={statusColors[item.status]}>
                    {item.status === 'resolved' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                     item.status === 'escalated' ? <Flag className="w-3 h-3 mr-1" /> :
                     <Clock className="w-3 h-3 mr-1" />}
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Badge>

                  <div className="flex flex-col space-y-2">
                    {!item.response && (
                      <Button
                        size="sm"
                        onClick={() => handleResponse(item)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Reply className="w-3 h-3 mr-1" />
                        Respond
                      </Button>
                    )}

                    <Select value={item.status} onValueChange={(value) => handleStatusChange(item.id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="escalated">Escalated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredFeedback.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No feedback found</h3>
            <p className="text-slate-500 mb-4">
              {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No customer feedback available yet'
              }
            </p>
            {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}>
                Clear All Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Response Dialog */}
      {showResponseDialog && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                Respond to {selectedFeedback.customerName}
              </h2>
              
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-2">Customer Feedback:</p>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-slate-800">{selectedFeedback.feedback}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Response:
                </label>
                <Textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Type your response to the customer..."
                  rows={4}
                  className="w-full"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowResponseDialog(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitResponse}
                  disabled={!responseText.trim() || isSubmitting}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Send Response
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
