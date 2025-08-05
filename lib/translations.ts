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
    'biryanis': 'Biryanis',
    'veg_curries': 'Vegetarian Curries',
    'non_veg_curries': 'Non-Vegetarian Curries',
    'fried_rice_noodles': 'Fried Rice & Noodles',
    'breads_roti': 'Breads & Roti',
    'vegetarian': 'Vegetarian',
    'non_vegetarian': 'Non-Vegetarian',
    'signature': 'Signature',
    'special': 'Special',
    'veg': 'Veg',
    
    // Sort options
    'name': 'Name',
    'name_az': 'Name A-Z',
    'price_low': 'Price: Low to High',
    'price_high': 'Price: High to Low',
    'popularity': 'Popularity',
    
    // Cart
    'add_to_cart': 'Add to Cart',
    'quick_add': 'Quick Add',
    'remove': 'Remove',
    'total': 'Total',
    'proceed_to_checkout': 'Proceed to Checkout',
    'empty_cart': 'Your cart is empty',
    'items_in_cart': 'items in cart',
    
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
    'syncing': 'Syncing...',
    'updating_menu': 'Updating menu in real-time...',
    
    // Empty states
    'no_items_found': 'No items found',
    'coming_soon': 'Coming Soon',
    'try_different_search': 'Try a different search term.',
    'preparing_special': "We're preparing something special for this category.",
    'loading_menu': 'Loading your menu...',
    'fetching_latest': 'Fetching the latest dishes and specials',
    
    // Results
    'showing_items': 'Showing {count} of {total} items',
    'sort_by': 'Sort by: {option}',
    
    // Language names
    'english': 'English',
    'hindi': 'हिंदी',
    'telugu': 'తెలుగు',
    
    // Menu specific
    'our_menu': 'Our Menu',
    'authentic_indian': 'Authentic Indian Cuisine',
    'discover_dishes': 'Discover our authentic Indian dishes, crafted with traditional recipes and fresh ingredients.',
    'every_dish_story': 'Every dish tells a story of heritage and flavor.',
    'table': 'Table',
    'orders': 'Orders',
    'order_history': 'Order History',
    
    // Badges
    'premium': 'Premium',
    'trending': 'Trending',
    'new': 'New',
    'popular': 'Popular',
    
    // Actions
    'favorite': 'Favorite',
    'unfavorite': 'Unfavorite',
    'view_details': 'View Details',
    'close': 'Close',
    'cancel': 'Cancel',
    'save': 'Save',
    'edit': 'Edit',
    'delete': 'Delete',
    
    // Time
    'preparation_time': 'Prep Time',
    'minutes': 'min',
    'ready_in': 'Ready in {time} min',
    
    // Currency
    'currency': '₹',
    'price': 'Price',
    
    // Search
    'search_placeholder': 'Search for dishes, ingredients, or categories...',
    'search_results': 'Found {count} items',
    'clear_search': 'Clear search',
    
    // Quick filters
    'all': 'All',
    'biryanis_short': 'Biryanis',
    'veg_short': 'Veg',
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
    'biryanis': 'बिरयानी',
    'veg_curries': 'शाकाहारी करी',
    'non_veg_curries': 'मांसाहारी करी',
    'fried_rice_noodles': 'फ्राइड राइस और नूडल्स',
    'breads_roti': 'रोटी और ब्रेड',
    'vegetarian': 'शाकाहारी',
    'non_vegetarian': 'मांसाहारी',
    'signature': 'विशेष',
    'special': 'विशेष',
    'veg': 'शाकाहारी',
    
    // Sort options
    'name': 'नाम',
    'name_az': 'नाम A-Z',
    'price_low': 'कीमत: कम से ज्यादा',
    'price_high': 'कीमत: ज्यादा से कम',
    'popularity': 'लोकप्रियता',
    
    // Cart
    'add_to_cart': 'कार्ट में जोड़ें',
    'quick_add': 'त्वरित जोड़ें',
    'remove': 'हटाएं',
    'total': 'कुल',
    'proceed_to_checkout': 'चेकआउट पर जाएं',
    'empty_cart': 'आपकी कार्ट खाली है',
    'items_in_cart': 'कार्ट में आइटम',
    
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
    'syncing': 'सिंक हो रहा है...',
    'updating_menu': 'मेनू रीयल-टाइम में अपडेट हो रहा है...',
    
    // Empty states
    'no_items_found': 'कोई आइटम नहीं मिला',
    'coming_soon': 'जल्द आ रहा है',
    'try_different_search': 'अलग खोज शब्द आज़माएं।',
    'preparing_special': 'हम इस श्रेणी के लिए कुछ विशेष तैयार कर रहे हैं।',
    'loading_menu': 'आपका मेनू लोड हो रहा है...',
    'fetching_latest': 'नवीनतम व्यंजन और विशेषताएं प्राप्त कर रहे हैं',
    
    // Results
    'showing_items': '{total} में से {count} आइटम दिखा रहे हैं',
    'sort_by': 'क्रमबद्ध करें: {option}',
    
    // Language names
    'english': 'English',
    'hindi': 'हिंदी',
    'telugu': 'తెలుగు',
    
    // Menu specific
    'our_menu': 'हमारा मेनू',
    'authentic_indian': 'प्रामाणिक भारतीय व्यंजन',
    'discover_dishes': 'हमारे प्रामाणिक भारतीय व्यंजनों की खोज करें, पारंपरिक नुस्खों और ताजे सामग्री के साथ तैयार।',
    'every_dish_story': 'हर व्यंजन विरासत और स्वाद की कहानी कहता है।',
    'table': 'टेबल',
    'orders': 'ऑर्डर',
    'order_history': 'ऑर्डर इतिहास',
    
    // Badges
    'premium': 'प्रीमियम',
    'trending': 'ट्रेंडिंग',
    'new': 'नया',
    'popular': 'लोकप्रिय',
    
    // Actions
    'favorite': 'पसंदीदा',
    'unfavorite': 'पसंदीदा नहीं',
    'view_details': 'विवरण देखें',
    'close': 'बंद करें',
    'cancel': 'रद्द करें',
    'save': 'सहेजें',
    'edit': 'संपादित करें',
    'delete': 'हटाएं',
    
    // Time
    'preparation_time': 'तैयारी का समय',
    'minutes': 'मिनट',
    'ready_in': '{time} मिनट में तैयार',
    
    // Currency
    'currency': '₹',
    'price': 'कीमत',
    
    // Search
    'search_placeholder': 'व्यंजन, सामग्री या श्रेणियां खोजें...',
    'search_results': '{count} आइटम मिले',
    'clear_search': 'खोज साफ़ करें',
    
    // Quick filters
    'all': 'सभी',
    'biryanis_short': 'बिरयानी',
    'veg_short': 'शाकाहारी',
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
    'biryanis': 'బిర్యానీలు',
    'veg_curries': 'శాకాహార కూరలు',
    'non_veg_curries': 'మాంసాహార కూరలు',
    'fried_rice_noodles': 'వేయించిన బియ్యం మరియు నూడుల్స్',
    'breads_roti': 'రొట్టెలు మరియు బ్రెడ్',
    'vegetarian': 'శాకాహారి',
    'non_vegetarian': 'మాంసాహారి',
    'signature': 'విశేష',
    'special': 'విశేష',
    'veg': 'శాకాహారి',
    
    // Sort options
    'name': 'పేరు',
    'name_az': 'పేరు A-Z',
    'price_low': 'ధర: తక్కువ నుండి ఎక్కువ',
    'price_high': 'ధర: ఎక్కువ నుండి తక్కువ',
    'popularity': 'జనాదరణ',
    
    // Cart
    'add_to_cart': 'కార్ట్‌కి జోడించండి',
    'quick_add': 'త్వరిత జోడింపు',
    'remove': 'తొలగించండి',
    'total': 'మొత్తం',
    'proceed_to_checkout': 'చెక్అవుట్‌కి వెళ్లండి',
    'empty_cart': 'మీ కార్ట్ ఖాళీగా ఉంది',
    'items_in_cart': 'కార్ట్‌లో అంశాలు',
    
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
    'syncing': 'సింక్ చేస్తోంది...',
    'updating_menu': 'మెనూ రియల్-టైమ్‌లో అప్‌డేట్ చేస్తోంది...',
    
    // Empty states
    'no_items_found': 'ఏ అంశాలు కనుగొనబడలేదు',
    'coming_soon': 'త్వరలో వస్తుంది',
    'try_different_search': 'వేరే శోధన పదాన్ని ప్రయత్నించండి.',
    'preparing_special': 'మేము ఈ వర్గం కోసం ఏదో ప్రత్యేకమైనది తయారు చేస్తున్నాము.',
    'loading_menu': 'మీ మెనూ లోడ్ అవుతోంది...',
    'fetching_latest': 'తాజా వంటకాలు మరియు ప్రత్యేకతలను పొందుతోంది',
    
    // Results
    'showing_items': '{total}లో {count} అంశాలు చూపిస్తోంది',
    'sort_by': 'క్రమబద్ధం చేయండి: {option}',
    
    // Language names
    'english': 'English',
    'hindi': 'हिंदी',
    'telugu': 'తెలుగు',
    
    // Menu specific
    'our_menu': 'మా మెనూ',
    'authentic_indian': 'నిజమైన భారతీయ వంటకాలు',
    'discover_dishes': 'మా నిజమైన భారతీయ వంటకాలను కనుగొనండి, సాంప్రదాయ వంటకాలతో మరియు తాజా పదార్థాలతో తయారు చేయబడింది.',
    'every_dish_story': 'ప్రతి వంటకం వారసత్వం మరియు రుచి యొక్క కథను చెబుతుంది.',
    'table': 'టేబుల్',
    'orders': 'ఆర్డర్లు',
    'order_history': 'ఆర్డర్ చరిత్ర',
    
    // Badges
    'premium': 'ప్రీమియం',
    'trending': 'ట్రెండింగ్',
    'new': 'కొత్త',
    'popular': 'జనాదరణ',
    
    // Actions
    'favorite': 'ఇష్టమైన',
    'unfavorite': 'ఇష్టమైనది కాదు',
    'view_details': 'వివరాలను చూడండి',
    'close': 'మూసివేయండి',
    'cancel': 'రద్దు',
    'save': 'సేవ్ చేయండి',
    'edit': 'సవరించండి',
    'delete': 'తొలగించండి',
    
    // Time
    'preparation_time': 'తయారీ సమయం',
    'minutes': 'నిమిషాలు',
    'ready_in': '{time} నిమిషాల్లో సిద్ధం',
    
    // Currency
    'currency': '₹',
    'price': 'ధర',
    
    // Search
    'search_placeholder': 'వంటకాలు, పదార్థాలు లేదా వర్గాలను శోధించండి...',
    'search_results': '{count} అంశాలు దొరికాయి',
    'clear_search': 'శోధనను క్లియర్ చేయండి',
    
    // Quick filters
    'all': 'అన్నీ',
    'biryanis_short': 'బిర్యానీలు',
    'veg_short': 'శాకాహారి',
  },
};

export function getTranslation(key: string, language: Language): string {
  return translations[language][key] || translations.en[key] || key;
}

export function t(key: string, language: Language): string {
  return getTranslation(key, language);
}

// Enhanced translation function with interpolation
export function tWithParams(key: string, language: Language, params: Record<string, string | number>): string {
  let translation = getTranslation(key, language);
  
  // Replace parameters in the translation
  Object.entries(params).forEach(([param, value]) => {
    translation = translation.replace(new RegExp(`{${param}}`, 'g'), String(value));
  });
  
  return translation;
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

// Language flags for display
export const languageFlags = {
  en: '🇺🇸',
  hi: '🇮��',
  te: '🇮🇳',
}; 