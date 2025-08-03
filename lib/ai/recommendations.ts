import { MenuItem } from '@/data/sriKanyaMenu';

export interface Recommendation {
  itemId: string;
  itemName: string;
  confidence: number;
  reason: string;
  category: string;
}

export interface CustomerProfile {
  preferences: {
    vegetarian: number;
    spicy: number;
    priceRange: number;
    categories: { [key: string]: number };
  };
  orderHistory: string[];
  totalSpent: number;
  visitFrequency: number;
}

export class AIRecommendationEngine {
  private orders: any[] = [];
  private menuItems: MenuItem[] = [];

  constructor(orders: any[], menuData: { [key: string]: Omit<MenuItem, 'image'>[] }) {
    this.orders = orders;
    // Flatten the menu data structure
    this.menuItems = Object.values(menuData).flat().map(item => ({
      ...item,
      image: '' // Add empty image as it's not in the data structure
    }));
  }

  // Build customer profile based on order history
  buildCustomerProfile(customerPhone: string): CustomerProfile {
    const customerOrders = this.orders.filter(order => 
      order.customerPhone === customerPhone
    );

    if (customerOrders.length === 0) {
      return this.getDefaultProfile();
    }

    const preferences = {
      vegetarian: 0,
      spicy: 0,
      priceRange: 0,
      categories: {} as { [key: string]: number }
    };

    let totalSpent = 0;
    const orderHistory: string[] = [];

    customerOrders.forEach(order => {
      totalSpent += order.totalAmount;
      
      order.items.forEach((item: any) => {
        const menuItem = this.menuItems.find(mi => mi.id === item.id);
        if (menuItem) {
          // Track category preferences
          preferences.categories[menuItem.category] = 
            (preferences.categories[menuItem.category] || 0) + item.quantity;
          
          // Track vegetarian preference
          if (menuItem.isVeg) {
            preferences.vegetarian += item.quantity;
          }
          
          // Track spicy preference (assuming items with 'spicy' in name or tags)
          if (menuItem.name.toLowerCase().includes('spicy')) {
            preferences.spicy += item.quantity;
          }
          
          orderHistory.push(menuItem.name);
        }
      });
    });

    // Calculate averages
    const totalItems = customerOrders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0), 0
    );

    if (totalItems > 0) {
      preferences.vegetarian = preferences.vegetarian / totalItems;
      preferences.spicy = preferences.spicy / totalItems;
      preferences.priceRange = totalSpent / customerOrders.length;
    }

    return {
      preferences,
      orderHistory,
      totalSpent,
      visitFrequency: customerOrders.length
    };
  }

  // Get personalized recommendations for a customer
  getPersonalizedRecommendations(customerPhone: string, limit: number = 5): Recommendation[] {
    const profile = this.buildCustomerProfile(customerPhone);
    const recommendations: Recommendation[] = [];

    // If new customer, return popular items
    if (profile.visitFrequency === 0) {
      return this.getPopularRecommendations(limit);
    }

    // Score each menu item based on customer profile
    this.menuItems.forEach(item => {
      let score = 0;
      let reasons: string[] = [];

      // Category preference scoring
      const categoryPreference = profile.preferences.categories[item.category] || 0;
      if (categoryPreference > 0) {
        score += categoryPreference * 0.3;
        reasons.push(`Likes ${item.category} items`);
      }

      // Vegetarian preference scoring
      if (profile.preferences.vegetarian > 0.5 && item.isVeg) {
        score += 0.2;
        reasons.push('Prefers vegetarian options');
      } else if (profile.preferences.vegetarian < 0.3 && !item.isVeg) {
        score += 0.2;
        reasons.push('Prefers non-vegetarian options');
      }

      // Spicy preference scoring
      const isSpicy = item.name.toLowerCase().includes('spicy');
      if (profile.preferences.spicy > 0.3 && isSpicy) {
        score += 0.15;
        reasons.push('Enjoys spicy food');
      } else if (profile.preferences.spicy < 0.2 && !isSpicy) {
        score += 0.15;
        reasons.push('Prefers mild options');
      }

      // Price range scoring
      if (item.price <= profile.preferences.priceRange * 1.2 && 
          item.price >= profile.preferences.priceRange * 0.8) {
        score += 0.1;
        reasons.push('Matches your spending pattern');
      }

      // Novelty bonus (items not ordered before)
      if (!profile.orderHistory.includes(item.name)) {
        score += 0.1;
        reasons.push('New item for you to try');
      }

      // Signature item bonus
      if (item.isSignature) {
        score += 0.05;
        reasons.push('Our signature dish');
      }

      if (score > 0) {
        recommendations.push({
          itemId: item.id,
          itemName: item.name,
          confidence: Math.min(score, 1),
          reason: reasons[0] || 'Recommended for you',
          category: item.category
        });
      }
    });

    // Sort by confidence and return top recommendations
    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  // Get popular recommendations (for new customers)
  getPopularRecommendations(limit: number = 5): Recommendation[] {
    const itemCounts: { [key: string]: number } = {};
    
    this.orders.forEach(order => {
      order.items.forEach((item: any) => {
        itemCounts[item.id] = (itemCounts[item.id] || 0) + item.quantity;
      });
    });

    const popularItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    return popularItems.map(([itemId, count]) => {
      const menuItem = this.menuItems.find(item => item.id === itemId);
      return {
        itemId,
        itemName: menuItem?.name || 'Unknown Item',
        confidence: Math.min(count / Math.max(...Object.values(itemCounts)), 1),
        reason: 'Popular choice among customers',
        category: menuItem?.category || 'Unknown'
      };
    });
  }

  // Get complementary items (items that go well together)
  getComplementaryItems(itemId: string, limit: number = 3): Recommendation[] {
    const targetItem = this.menuItems.find(item => item.id === itemId);
    if (!targetItem) return [];

    const complementaryItems: Recommendation[] = [];

    this.menuItems.forEach(item => {
      if (item.id === itemId) return;

      let score = 0;
      let reason = '';

      // Same category items
      if (item.category === targetItem.category) {
        score += 0.3;
        reason = `More ${item.category} options`;
      }

      // Complementary categories (e.g., biryani + raita)
      if (this.areComplementaryCategories(targetItem.category, item.category)) {
        score += 0.4;
        reason = 'Perfect combination';
      }

      // Price compatibility
      if (Math.abs(item.price - targetItem.price) < 100) {
        score += 0.2;
        reason = 'Similar price range';
      }

      if (score > 0) {
        complementaryItems.push({
          itemId: item.id,
          itemName: item.name,
          confidence: score,
          reason,
          category: item.category
        });
      }
    });

    return complementaryItems
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  // Check if two categories are complementary
  private areComplementaryCategories(cat1: string, cat2: string): boolean {
    const complementaryPairs = [
      ['biryani', 'raita'],
      ['biryani', 'salad'],
      ['curry', 'rice'],
      ['curry', 'bread'],
      ['starter', 'main'],
      ['main', 'dessert']
    ];

    return complementaryPairs.some(pair => 
      (pair[0] === cat1 && pair[1] === cat2) ||
      (pair[0] === cat2 && pair[1] === cat1)
    );
  }

  // Get default profile for new customers
  private getDefaultProfile(): CustomerProfile {
    return {
      preferences: {
        vegetarian: 0.5,
        spicy: 0.5,
        priceRange: 500,
        categories: {}
      },
      orderHistory: [],
      totalSpent: 0,
      visitFrequency: 0
    };
  }
} 