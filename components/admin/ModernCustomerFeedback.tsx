'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

// Real feedback data interface
interface FeedbackItem {
  id: string;
  customerName: string;
  customerEmail?: string;
  rating: number;
  orderId: string;
  orderItems: string[];
  feedback: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  category: string;
  status: 'pending' | 'resolved' | 'flagged';
  createdAt: string;
  response?: string;
  responseDate?: string;
}

interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  positiveFeedback: number;
  pendingResponses: number;
}

export default function ModernCustomerFeedback() {
  const { toast } = useToast();
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<FeedbackStats>({
    totalFeedback: 0,
    averageRating: 0,
    positiveFeedback: 0,
    pendingResponses: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Response dialog
  const [responseDialog, setResponseDialog] = useState<{
    isOpen: boolean;
    feedback: FeedbackItem | null;
    response: string;
  }>({
    isOpen: false,
    feedback: null,
    response: ''
  });

  // Fetch real feedback data from orders
  const fetchFeedback = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch feedback data');
      }

      const data = await response.json();
      const orders = data.orders || data || [];
      
      // Filter orders with ratings and feedback
      const ordersWithFeedback = orders
        .filter((order: any) => order.rating && order.rating > 0)
        .map((order: any) => ({
          id: order._id || order.orderId || `order-${Date.now()}-${Math.random()}`,
          customerName: order.customerName || 'Anonymous',
          customerEmail: order.customerEmail,
          rating: order.rating,
          orderId: order.orderId || order._id,
          orderItems: order.items?.map((item: any) => item.name || item.itemName) || [],
          feedback: order.feedback || 'No feedback provided',
          sentiment: getSentiment(order.rating, order.feedback),
          category: getFeedbackCategory(order.feedback),
          status: order.feedbackResponse ? 'resolved' : 'pending',
          createdAt: order.createdAt || order.timestamp || new Date().toISOString(),
          response: order.feedbackResponse,
          responseDate: order.feedbackResponseDate
        }))
        .sort((a: FeedbackItem, b: FeedbackItem) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setFeedbackData(ordersWithFeedback);
      calculateStats(ordersWithFeedback);
      
      if (isRefresh) {
        toast({
          title: "Feedback Updated",
          description: "Latest feedback data has been refreshed successfully.",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to load feedback: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Calculate feedback statistics
  const calculateStats = (feedback: FeedbackItem[]) => {
    const totalFeedback = feedback.length;
    const averageRating = totalFeedback > 0 
      ? feedback.reduce((sum, item) => sum + item.rating, 0) / totalFeedback 
      : 0;
    const positiveFeedback = feedback.filter(item => item.sentiment === 'positive').length;
    const pendingResponses = feedback.filter(item => item.status === 'pending').length;

    setStats({
      totalFeedback,
      averageRating: Math.round(averageRating * 10) / 10,
      positiveFeedback,
      pendingResponses
    });
  };

  // Determine sentiment based on rating and feedback text
  const getSentiment = (rating: number, feedback: string): 'positive' | 'neutral' | 'negative' => {
    if (rating >= 4) return 'positive';
    if (rating <= 2) return 'negative';
    return 'neutral';
  };

  // Categorize feedback based on content
  const getFeedbackCategory = (feedback: string): string => {
    const text = feedback.toLowerCase();
    if (text.includes('food') || text.includes('taste') || text.includes('quality')) return 'food_quality';
    if (text.includes('delivery') || text.includes('time') || text.includes('speed')) return 'delivery';
    if (text.includes('service') || text.includes('staff') || text.includes('friendly')) return 'service';
    if (text.includes('portion') || text.includes('size') || text.includes('quantity')) return 'portion_size';
    if (text.includes('price') || text.includes('cost') || text.includes('value')) return 'pricing';
    if (text.includes('clean') || text.includes('hygiene') || text.includes('restaurant')) return 'ambiance';
    return 'general';
  };

  // Filter feedback based on search and filters
  useEffect(() => {
    let filtered = feedbackData;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.feedback.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.orderItems.some(itemName => itemName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    // Rating filter
    if (selectedRating !== 'all') {
      const rating = parseInt(selectedRating);
      filtered = filtered.filter(item => item.rating === rating);
    }

    setFilteredFeedback(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [feedbackData, searchQuery, selectedCategory, selectedStatus, selectedRating]);

  // Load feedback on component mount
  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFeedback(true);
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [fetchFeedback]);

  // Handle response submission
  const handleResponseSubmit = async () => {
    if (!responseDialog.feedback || !responseDialog.response.trim()) return;

    try {
      // In a real implementation, you'd send this to an API endpoint
      // For now, we'll update the local state
      const updatedFeedback = feedbackData.map(item =>
        item.id === responseDialog.feedback!.id
          ? {
              ...item,
              status: 'resolved' as const,
              response: responseDialog.response,
              responseDate: new Date().toISOString()
            }
          : item
      );

      setFeedbackData(updatedFeedback);
      calculateStats(updatedFeedback);
      
      setResponseDialog({ isOpen: false, feedback: null, response: '' });
      
      toast({
        title: "Response Sent",
        description: "Your response has been sent successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send response. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage);
  const paginatedFeedback = filteredFeedback.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'flagged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading feedback...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Feedback</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => fetchFeedback()} variant="outline">
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
          <h2 className="text-2xl font-bold text-gray-900">Customer Feedback</h2>
          <p className="text-gray-600">Manage and respond to customer feedback and ratings</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => fetchFeedback(true)} 
            variant="outline" 
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{stats.totalFeedback}</div>
            <p className="text-xs text-blue-700 mt-1">Customer reviews</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-900">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{stats.averageRating}/5</div>
            <p className="text-xs text-yellow-700 mt-1">Overall satisfaction</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Positive Feedback</CardTitle>
            <ThumbsUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.positiveFeedback}</div>
            <p className="text-xs text-green-700 mt-1">Happy customers</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Pending Responses</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{stats.pendingResponses}</div>
            <p className="text-xs text-orange-700 mt-1">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search feedback..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="food_quality">Food Quality</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="portion_size">Portion Size</SelectItem>
                <SelectItem value="pricing">Pricing</SelectItem>
                <SelectItem value="ambiance">Ambiance</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedRating} onValueChange={setSelectedRating}>
              <SelectTrigger>
                <SelectValue placeholder="Rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-600 flex items-center justify-center">
              {filteredFeedback.length} of {feedbackData.length} feedback
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedFeedback.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Feedback Found</h3>
              <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedFeedback.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{item.customerName}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>Order: {item.orderId}</span>
                          <span>•</span>
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className={`ml-2 font-medium ${getRatingColor(item.rating)}`}>
                          {item.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-gray-700 mb-2">{item.feedback}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className={getSentimentColor(item.sentiment)}>
                        {item.sentiment.charAt(0).toUpperCase() + item.sentiment.slice(1)}
                      </Badge>
                      <Badge variant="outline">{item.category.replace('_', ' ')}</Badge>
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {item.orderItems.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Ordered items:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.orderItems.map((itemName, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {itemName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.response ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Response</span>
                        <span className="text-xs text-green-600">
                          {item.responseDate && formatDate(item.responseDate)}
                        </span>
                      </div>
                      <p className="text-sm text-green-700">{item.response}</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">No response yet</span>
                      <Button
                        size="sm"
                        onClick={() => setResponseDialog({
                          isOpen: true,
                          feedback: item,
                          response: ''
                        })}
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        Respond
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredFeedback.length)} of {filteredFeedback.length} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      {responseDialog.isOpen && responseDialog.feedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Respond to Feedback
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Customer: {responseDialog.feedback.customerName}</p>
              <p className="text-sm text-gray-600 mb-2">Rating: {responseDialog.feedback.rating}/5</p>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                &ldquo;{responseDialog.feedback.feedback}&rdquo;
              </p>
            </div>
            <Textarea
              placeholder="Type your response..."
              value={responseDialog.response}
              onChange={(e) => setResponseDialog(prev => ({ ...prev, response: e.target.value }))}
              className="mb-4"
              rows={4}
            />
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setResponseDialog({ isOpen: false, feedback: null, response: '' })}
              >
                Cancel
              </Button>
              <Button onClick={handleResponseSubmit}>
                Send Response
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
