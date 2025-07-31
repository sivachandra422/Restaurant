export type Language = 'en' | 'hi' | 'te';

export interface Translations {
  en: Record<string, string>;
  hi: Record<string, string>;
  te: Record<string, string>;
}

export const translations: Translations = {
  en: {
    // Navigation
    'menu': 'Menu',
    'cart': 'Cart',
    'checkout': 'Checkout',
    'search': 'Search menu items...',
    'filter': 'Filter',
    'sort': 'Sort by',
    
    // Categories
    'all_items': 'All Items',
    'vegetarian': 'Vegetarian',
    'non_vegetarian': 'Non-Vegetarian',
    'signature': 'Signature',
    'special': 'Special',
    'veg': 'Veg',
    
    // Sort options
    'name_az': 'Name A-Z',
    'price_low': 'Price: Low to High',
    'price_high': 'Price: High to Low',
    'popularity': 'Popularity',
    
    // Cart
    'add_to_cart': 'Add to Cart',
    'remove': 'Remove',
    'total': 'Total',
    'proceed_to_checkout': 'Proceed to Checkout',
    'empty_cart': 'Your cart is empty',
    
    // Checkout
    'customer_name': 'Customer Name',
    'phone_number': 'Phone Number',
    'special_instructions': 'Special Instructions',
    'place_order': 'Place Order',
    'order_summary': 'Order Summary',
    
    // Status
    'offline_mode': 'Offline Mode',
    'install_app': 'Install Sri Kanya App',
    'get_best_experience': 'Get the best experience with our app',
    'install': 'Install',
    
    // Empty states
    'no_items_found': 'No items found',
    'coming_soon': 'Coming Soon',
    'try_different_search': 'Try a different search term.',
    'preparing_special': "We're preparing something special for this category.",
    
    // Language names
    'english': 'English',
    'hindi': 'हिंदी',
    'telugu': 'తెలుగు',
  },
  
  hi: {
    // Navigation
    'menu': 'मेनू',
    'cart': 'कार्ट',
    'checkout': 'चेकआउट',
    'search': 'मेनू आइटम खोजें...',
    'filter': 'फ़िल्टर',
    'sort': 'क्रमबद्ध करें',
    
    // Categories
    'all_items': 'सभी आइटम',
    'vegetarian': 'शाकाहारी',
    'non_vegetarian': 'मांसाहारी',
    'signature': 'विशेष',
    'special': 'विशेष',
    'veg': 'शाकाहारी',
    
    // Sort options
    'name_az': 'नाम A-Z',
    'price_low': 'कीमत: कम से ज्यादा',
    'price_high': 'कीमत: ज्यादा से कम',
    'popularity': 'लोकप्रियता',
    
    // Cart
    'add_to_cart': 'कार्ट में जोड़ें',
    'remove': 'हटाएं',
    'total': 'कुल',
    'proceed_to_checkout': 'चेकआउट पर जाएं',
    'empty_cart': 'आपकी कार्ट खाली है',
    
    // Checkout
    'customer_name': 'ग्राहक का नाम',
    'phone_number': 'फोन नंबर',
    'special_instructions': 'विशेष निर्देश',
    'place_order': 'ऑर्डर दें',
    'order_summary': 'ऑर्डर सारांश',
    
    // Status
    'offline_mode': 'ऑफलाइन मोड',
    'install_app': 'श्री कन्या ऐप इंस्टॉल करें',
    'get_best_experience': 'हमारे ऐप के साथ सर्वोत्तम अनुभव प्राप्त करें',
    'install': 'इंस्टॉल',
    
    // Empty states
    'no_items_found': 'कोई आइटम नहीं मिला',
    'coming_soon': 'जल्द आ रहा है',
    'try_different_search': 'अलग खोज शब्द आज़माएं।',
    'preparing_special': 'हम इस श्रेणी के लिए कुछ विशेष तैयार कर रहे हैं।',
    
    // Language names
    'english': 'English',
    'hindi': 'हिंदी',
    'telugu': 'తెలుగు',
  },
  
  te: {
    // Navigation
    'menu': 'మెనూ',
    'cart': 'కార్ట్',
    'checkout': 'చెక్అవుట్',
    'search': 'మెనూ అంశాలు శోధించండి...',
    'filter': 'ఫిల్టర్',
    'sort': 'క్రమబద్ధం చేయండి',
    
    // Categories
    'all_items': 'అన్ని అంశాలు',
    'vegetarian': 'శాకాహారి',
    'non_vegetarian': 'మాంసాహారి',
    'signature': 'విశేష',
    'special': 'విశేష',
    'veg': 'శాకాహారి',
    
    // Sort options
    'name_az': 'పేరు A-Z',
    'price_low': 'ధర: తక్కువ నుండి ఎక్కువ',
    'price_high': 'ధర: ఎక్కువ నుండి తక్కువ',
    'popularity': 'జనాదరణ',
    
    // Cart
    'add_to_cart': 'కార్ట్‌కి జోడించండి',
    'remove': 'తొలగించండి',
    'total': 'మొత్తం',
    'proceed_to_checkout': 'చెక్అవుట్‌కి వెళ్లండి',
    'empty_cart': 'మీ కార్ట్ ఖాళీగా ఉంది',
    
    // Checkout
    'customer_name': 'కస్టమర్ పేరు',
    'phone_number': 'ఫోన్ నంబర్',
    'special_instructions': 'విశేష సూచనలు',
    'place_order': 'ఆర్డర్ ఇవ్వండి',
    'order_summary': 'ఆర్డర్ సారాంశం',
    
    // Status
    'offline_mode': 'ఆఫ్‌లైన్ మోడ్',
    'install_app': 'శ్రీ కన్య అప్లికేషన్ ఇన్‌స్టాల్ చేయండి',
    'get_best_experience': 'మా అప్లికేషన్‌తో ఉత్తమ అనుభవాన్ని పొందండి',
    'install': 'ఇన్‌స్టాల్',
    
    // Empty states
    'no_items_found': 'ఏ అంశాలు కనుగొనబడలేదు',
    'coming_soon': 'త్వరలో వస్తుంది',
    'try_different_search': 'వేరే శోధన పదాన్ని ప్రయత్నించండి.',
    'preparing_special': 'మేము ఈ వర్గం కోసం ఏదో ప్రత్యేకమైనది తయారు చేస్తున్నాము.',
    
    // Language names
    'english': 'English',
    'hindi': 'हिंदी',
    'telugu': 'తెలుగు',
  },
};

export function getTranslation(key: string, language: Language): string {
  return translations[language][key] || translations.en[key] || key;
}

export function t(key: string, language: Language): string {
  return getTranslation(key, language);
}

// Language detection
export function detectLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  
  const savedLanguage = localStorage.getItem('sriKanyaLanguage') as Language;
  if (savedLanguage && ['en', 'hi', 'te'].includes(savedLanguage)) {
    return savedLanguage;
  }
  
  const browserLanguage = navigator.language.toLowerCase();
  if (browserLanguage.startsWith('hi')) return 'hi';
  if (browserLanguage.startsWith('te')) return 'te';
  
  return 'en';
}

// Language names for display
export const languageNames = {
  en: 'English',
  hi: 'हिंदी',
  te: 'తెలుగు',
}; 