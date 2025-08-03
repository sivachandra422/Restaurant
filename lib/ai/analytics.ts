import { Order } from '@/lib/models/Order';

export interface AIAnalytics {
  predictedRevenue: number;
  predictedOrders: number;
  recommendedItems: string[];
  peakHourPredictions: { hour: number; probability: number }[];
  customerSegments: { segment: string; count: number; avgSpend: number }[];
  seasonalTrends: { month: string; trend: 'up' | 'down' | 'stable' }[];
  inventoryRecommendations: { item: string; suggestedQuantity: number }[];
}

export class AIAnalyticsEngine {
  private orders: any[] = [];

  constructor(orders: any[]) {
    this.orders = orders;
  }

  // Predict revenue for next 7 days
  predictRevenue(): number {
    if (this.orders.length === 0) return 0;
    
    const recentOrders = this.orders.filter(order => {
      const orderDate = new Date(order.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return orderDate > weekAgo;
    });

    const avgDailyRevenue = recentOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / 7;
    const growthRate = 1.05; // 5% weekly growth assumption
    
    return Math.round(avgDailyRevenue * 7 * growthRate);
  }

  // Predict orders for next 7 days
  predictOrders(): number {
    if (this.orders.length === 0) return 0;
    
    const recentOrders = this.orders.filter(order => {
      const orderDate = new Date(order.timestamp);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return orderDate > weekAgo;
    });

    const avgDailyOrders = recentOrders.length / 7;
    const growthRate = 1.03; // 3% weekly growth assumption
    
    return Math.round(avgDailyOrders * 7 * growthRate);
  }

  // Get AI-powered menu recommendations
  getRecommendedItems(): string[] {
    if (this.orders.length === 0) return [];

    // Analyze popular combinations
    const itemCombinations: { [key: string]: number } = {};
    
    this.orders.forEach(order => {
      const itemNames = order.items.map((item: any) => item.name);
      for (let i = 0; i < itemNames.length; i++) {
        for (let j = i + 1; j < itemNames.length; j++) {
          const combination = `${itemNames[i]}+${itemNames[j]}`;
          itemCombinations[combination] = (itemCombinations[combination] || 0) + 1;
        }
      }
    });

    // Get top combinations and extract unique items
    const topCombinations = Object.entries(itemCombinations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const recommendedItems = new Set<string>();
    topCombinations.forEach(([combination]) => {
      const items = combination.split('+');
      items.forEach(item => recommendedItems.add(item));
    });

    return Array.from(recommendedItems).slice(0, 5);
  }

  // Predict peak hours with AI
  predictPeakHours(): { hour: number; probability: number }[] {
    if (this.orders.length === 0) return [];

    const hourCounts = Array.from({ length: 24 }, () => 0);
    
    this.orders.forEach(order => {
      const hour = new Date(order.timestamp).getHours();
      hourCounts[hour]++;
    });

    const totalOrders = hourCounts.reduce((sum, count) => sum + count, 0);
    
    return hourCounts.map((count, hour) => ({
      hour,
      probability: totalOrders > 0 ? count / totalOrders : 0
    })).sort((a, b) => b.probability - a.probability);
  }

  // Analyze customer segments
  analyzeCustomerSegments(): { segment: string; count: number; avgSpend: number }[] {
    if (this.orders.length === 0) return [];

    const customerSpending: { [key: string]: number[] } = {};
    
    this.orders.forEach(order => {
      const customerId = order.customerPhone; // Using phone as customer ID
      if (!customerSpending[customerId]) {
        customerSpending[customerId] = [];
      }
      customerSpending[customerId].push(order.totalAmount || 0);
    });

    const segments = [
      { name: 'High Value', threshold: 1000 },
      { name: 'Medium Value', threshold: 500 },
      { name: 'Regular', threshold: 200 }
    ];

    return segments.map(segment => {
      const customers = Object.values(customerSpending).filter(spending => 
        spending.reduce((sum, amount) => sum + amount, 0) >= segment.threshold
      );
      
      const avgSpend = customers.length > 0 
        ? customers.reduce((sum, spending) => sum + spending.reduce((a, b) => a + b, 0), 0) / customers.length
        : 0;

      return {
        segment: segment.name,
        count: customers.length,
        avgSpend: Math.round(avgSpend)
      };
    });
  }

  // Predict seasonal trends
  predictSeasonalTrends(): { month: string; trend: 'up' | 'down' | 'stable' }[] {
    if (this.orders.length === 0) return [];

    const monthlyRevenue: { [key: string]: number } = {};
    
    this.orders.forEach(order => {
      const month = new Date(order.timestamp).toLocaleDateString('en-US', { month: 'long' });
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (order.totalAmount || 0);
    });

    const months = Object.keys(monthlyRevenue).sort();
    const trends = months.map((month, index) => {
      if (index === 0) return { month, trend: 'stable' as const };
      
      const currentRevenue = monthlyRevenue[month];
      const previousRevenue = monthlyRevenue[months[index - 1]];
      const changePercent = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
      
      return {
        month,
        trend: (changePercent > 5 ? 'up' : changePercent < -5 ? 'down' : 'stable') as 'up' | 'down' | 'stable'
      };
    });

    return trends;
  }

  // Recommend inventory based on AI analysis
  recommendInventory(): { item: string; suggestedQuantity: number }[] {
    if (this.orders.length === 0) return [];

    const itemUsage: { [key: string]: number } = {};
    
    this.orders.forEach(order => {
      order.items.forEach((item: any) => {
        itemUsage[item.name] = (itemUsage[item.name] || 0) + item.quantity;
      });
    });

    // Calculate daily average usage and suggest inventory
    const daysOfData = 7; // Assuming we have 7 days of data
    const safetyStock = 1.2; // 20% safety stock
    
    return Object.entries(itemUsage).map(([item, totalUsage]) => ({
      item,
      suggestedQuantity: Math.ceil((totalUsage / daysOfData) * safetyStock)
    })).sort((a, b) => b.suggestedQuantity - a.suggestedQuantity);
  }

  // Get comprehensive AI analytics
  getAIAnalytics(): AIAnalytics {
    return {
      predictedRevenue: this.predictRevenue(),
      predictedOrders: this.predictOrders(),
      recommendedItems: this.getRecommendedItems(),
      peakHourPredictions: this.predictPeakHours(),
      customerSegments: this.analyzeCustomerSegments(),
      seasonalTrends: this.predictSeasonalTrends(),
      inventoryRecommendations: this.recommendInventory()
    };
  }
} 