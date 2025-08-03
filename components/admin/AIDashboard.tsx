'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Brain, 
  Lightbulb, 
  Target, 
  Users, 
  Clock,
  BarChart3,
  Sparkles,
  Zap,
  Activity
} from 'lucide-react';

interface AIDashboardProps {
  analytics: any;
  orders: any[];
}

interface AIAnalytics {
  predictedRevenue: number;
  predictedOrders: number;
  recommendedItems: string[];
  peakHourPredictions: { hour: number; probability: number }[];
  customerSegments: { segment: string; count: number; avgSpend: number }[];
  seasonalTrends: { month: string; trend: 'up' | 'down' | 'stable' }[];
  inventoryRecommendations: { item: string; suggestedQuantity: number }[];
}

export default function AIDashboard({ analytics, orders }: AIDashboardProps) {
  const [aiAnalytics, setAiAnalytics] = useState<AIAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAIAnalytics();
  }, []);

  const fetchAIAnalytics = async () => {
    try {
      const response = await fetch('/api/ai/analytics');
      if (response.ok) {
        const data = await response.json();
        setAiAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching AI analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold">AI Analytics</h2>
          <Badge variant="secondary">Loading...</Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold">AI-Powered Insights</h2>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Enhanced
          </Badge>
        </div>
        <Button onClick={fetchAIAnalytics} variant="outline" size="sm">
          <Zap className="w-4 h-4 mr-2" />
          Refresh AI
        </Button>
      </div>

      {/* AI Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">AI Revenue Prediction</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              ₹{aiAnalytics?.predictedRevenue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-purple-700">Next 7 days prediction</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">AI Order Prediction</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {aiAnalytics?.predictedOrders || '0'}
            </div>
            <p className="text-xs text-blue-700">Next 7 days prediction</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Customer Segments</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {aiAnalytics?.customerSegments?.length || '0'}
            </div>
            <p className="text-xs text-green-700">Identified segments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">AI Recommendations</CardTitle>
            <Lightbulb className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {aiAnalytics?.recommendedItems?.length || '0'}
            </div>
            <p className="text-xs text-orange-700">Smart suggestions</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Peak Hours Prediction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>AI Peak Hours Prediction</span>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <Brain className="w-3 h-3 mr-1" />
                AI Powered
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiAnalytics?.peakHourPredictions?.slice(0, 6).map((hour: any) => (
                <div key={hour.hour} className="flex items-center justify-between">
                  <span className="text-sm">{hour.hour}:00</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${hour.probability * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {(hour.probability * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Customer Segments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>AI Customer Segments</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Users className="w-3 h-3 mr-1" />
                Smart Analysis
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiAnalytics?.customerSegments?.map((segment: any) => (
                <div key={segment.segment} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      segment.segment === 'High Value' ? 'bg-green-500' :
                      segment.segment === 'Medium Value' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-sm font-medium">{segment.segment}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{segment.count} customers</div>
                    <div className="text-xs text-gray-500">₹{segment.avgSpend} avg spend</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>AI Menu Recommendations</span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              <Lightbulb className="w-3 h-3 mr-1" />
              Smart Suggestions
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiAnalytics?.recommendedItems?.map((item: string, index: number) => (
              <div key={item} className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                  {index + 1}
                </Badge>
                <div>
                  <p className="font-medium text-sm">{item}</p>
                  <p className="text-xs text-gray-500">AI Recommended</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Inventory Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>AI Inventory Recommendations</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Activity className="w-3 h-3 mr-1" />
              Smart Stocking
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {aiAnalytics?.inventoryRecommendations?.slice(0, 5).map((item: any) => (
              <div key={item.item} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{item.item}</p>
                  <p className="text-xs text-gray-500">Suggested quantity</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {item.suggestedQuantity} units
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 