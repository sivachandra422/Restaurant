import { MenuItem } from '@/data/sriKanyaMenu';

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  intent?: string;
  confidence?: number;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  action?: 'menu' | 'order' | 'hours' | 'location' | 'contact';
}

export class AIChatbot {
  private menuItems: MenuItem[] = [];
  private restaurantInfo: any;

  constructor(menuData: { [key: string]: Omit<MenuItem, 'image'>[] }, restaurantInfo: any) {
    this.menuItems = Object.values(menuData).flat().map(item => ({ ...item, image: '' }));
    this.restaurantInfo = restaurantInfo;
  }

  // Process user message and generate response
  processMessage(message: string): ChatResponse {
    const intent = this.detectIntent(message.toLowerCase());
    
    switch (intent) {
      case 'menu_inquiry':
        return this.handleMenuInquiry(message);
      case 'hours_inquiry':
        return this.handleHoursInquiry();
      case 'location_inquiry':
        return this.handleLocationInquiry();
      case 'contact_inquiry':
        return this.handleContactInquiry();
      case 'order_status':
        return this.handleOrderStatus();
      case 'pricing_inquiry':
        return this.handlePricingInquiry(message);
      case 'dietary_inquiry':
        return this.handleDietaryInquiry(message);
      case 'greeting':
        return this.handleGreeting();
      case 'goodbye':
        return this.handleGoodbye();
      default:
        return this.handleUnknownIntent();
    }
  }

  // Detect user intent from message
  private detectIntent(message: string): string {
    const keywords = {
      menu_inquiry: ['menu', 'food', 'dish', 'item', 'what do you have', 'what can i order'],
      hours_inquiry: ['hours', 'time', 'open', 'close', 'when', 'schedule'],
      location_inquiry: ['where', 'location', 'address', 'place', 'find'],
      contact_inquiry: ['contact', 'phone', 'call', 'number', 'reach'],
      order_status: ['order', 'status', 'track', 'where is my order'],
      pricing_inquiry: ['price', 'cost', 'how much', 'expensive', 'cheap'],
      dietary_inquiry: ['vegetarian', 'vegan', 'spicy', 'mild', 'diet', 'allergy'],
      greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
      goodbye: ['bye', 'goodbye', 'thank you', 'thanks', 'see you']
    };

    for (const [intent, words] of Object.entries(keywords)) {
      if (words.some(word => message.includes(word))) {
        return intent;
      }
    }

    return 'unknown';
  }

  // Handle menu-related inquiries
  private handleMenuInquiry(message: string): ChatResponse {
    const categories = this.getMenuCategories();
    const popularItems = this.getPopularItems(3);
    
    let response = `We have a delicious menu with ${categories.length} categories:\n\n`;
    response += categories.map(cat => `• ${cat}`).join('\n');
    response += `\n\nOur popular items include:\n`;
    response += popularItems.map(item => `• ${item.name} - ₹${item.price}`).join('\n');
    
    return {
      message: response,
      suggestions: ['Show full menu', 'Vegetarian options', 'Spicy dishes', 'Desserts'],
      action: 'menu'
    };
  }

  // Handle hours inquiry
  private handleHoursInquiry(): ChatResponse {
    const hours = this.restaurantInfo?.hours || 'Daily: 11:00 AM - 11:00 PM';
    
    return {
      message: `We're open ${hours}. You can visit us anytime during these hours for dine-in or takeaway orders.`,
      suggestions: ['Make a reservation', 'Order online', 'Contact us']
    };
  }

  // Handle location inquiry
  private handleLocationInquiry(): ChatResponse {
    const address = this.restaurantInfo?.address || '123 Culinary Street, Food District, City 560001';
    
    return {
      message: `We're located at ${address}. We're easily accessible and have parking available.`,
      suggestions: ['Get directions', 'Make a reservation', 'Order online'],
      action: 'location'
    };
  }

  // Handle contact inquiry
  private handleContactInquiry(): ChatResponse {
    const phone = this.restaurantInfo?.phone || '+91-9876543210';
    const email = this.restaurantInfo?.email || 'orders@srikanya.com';
    
    return {
      message: `You can reach us at:\n📞 Phone: ${phone}\n📧 Email: ${email}\n\nWe're here to help with any questions!`,
      suggestions: ['Call now', 'Send email', 'Make reservation'],
      action: 'contact'
    };
  }

  // Handle order status inquiry
  private handleOrderStatus(): ChatResponse {
    return {
      message: `To check your order status, please provide your order ID or phone number. You can also call us directly for immediate assistance.`,
      suggestions: ['Call us', 'Provide order ID', 'Check online']
    };
  }

  // Handle pricing inquiry
  private handlePricingInquiry(message: string): ChatResponse {
    const priceRange = this.getPriceRange();
    
    return {
      message: `Our menu offers great value with prices ranging from ₹${priceRange.min} to ₹${priceRange.max}. Most main dishes are between ₹200-₹500. We also have special combo offers and family meals for better value.`,
      suggestions: ['View menu', 'Combo offers', 'Family meals']
    };
  }

  // Handle dietary inquiry
  private handleDietaryInquiry(message: string): ChatResponse {
    const vegItems = this.menuItems.filter(item => item.isVeg);
        const spicyItems = this.menuItems.filter(item =>
      item.name.toLowerCase().includes('spicy')
    );
    
    let response = '';
    
    if (message.includes('vegetarian') || message.includes('vegan')) {
      response = `We have ${vegItems.length} delicious vegetarian options including:\n`;
      response += vegItems.slice(0, 5).map(item => `• ${item.name}`).join('\n');
    } else if (message.includes('spicy')) {
      response = `We have ${spicyItems.length} spicy dishes including:\n`;
      response += spicyItems.slice(0, 5).map(item => `• ${item.name}`).join('\n');
    } else {
      response = `We offer a wide variety of options:\n• ${vegItems.length} vegetarian dishes\n• ${spicyItems.length} spicy options\n• Many mild and flavorful choices`;
    }
    
    return {
      message: response,
      suggestions: ['Vegetarian menu', 'Spicy dishes', 'Mild options']
    };
  }

  // Handle greeting
  private handleGreeting(): ChatResponse {
    const greetings = [
      "Hello! Welcome to Sri Kanya Family Restaurant! How can I help you today?",
      "Hi there! Thanks for choosing Sri Kanya. What would you like to know?",
      "Welcome! I'm here to help you with our menu, hours, or any questions you have."
    ];
    
    return {
      message: greetings[Math.floor(Math.random() * greetings.length)],
      suggestions: ['View menu', 'Check hours', 'Contact us', 'Make reservation']
    };
  }

  // Handle goodbye
  private handleGoodbye(): ChatResponse {
    const goodbyes = [
      "Thank you for chatting with us! We hope to serve you soon!",
      "Goodbye! Don't forget to visit us for delicious food!",
      "Thanks for your time! We look forward to your visit!"
    ];
    
    return {
      message: goodbyes[Math.floor(Math.random() * goodbyes.length)]
    };
  }

  // Handle unknown intent
  private handleUnknownIntent(): ChatResponse {
    return {
      message: "I'm not sure I understood. You can ask me about our menu, hours, location, or contact information. How can I help you?",
      suggestions: ['View menu', 'Check hours', 'Contact us', 'Make reservation']
    };
  }

  // Get menu categories
  private getMenuCategories(): string[] {
    const categories = new Set(this.menuItems.map(item => item.category));
    return Array.from(categories);
  }

  // Get popular items
  private getPopularItems(limit: number): MenuItem[] {
    // This would typically be based on actual order data
    // For now, returning items with 'signature' tag or first few items
    const popular = this.menuItems.filter(item => item.isSignature);
    if (popular.length >= limit) {
      return popular.slice(0, limit);
    }
    return this.menuItems.slice(0, limit);
  }

  // Get price range
  private getPriceRange(): { min: number; max: number } {
    const prices = this.menuItems.map(item => item.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }
} 