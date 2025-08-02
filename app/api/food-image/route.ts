import { NextRequest, NextResponse } from 'next/server';

// Food image mappings with fallbacks
const foodImages: { [key: string]: string } = {
  // Biryanis
  'chicken_biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4a8?w=400&h=300&fit=crop&crop=center',
  'mutton_biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4a8?w=400&h=300&fit=crop&crop=center',
  'veg_biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4a8?w=400&h=300&fit=crop&crop=center',
  'chicken_dum_biryani_half': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4a8?w=400&h=300&fit=crop&crop=center',
  'chicken_dum_biryani_full': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4a8?w=400&h=300&fit=crop&crop=center',
  'mix_biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4a8?w=400&h=300&fit=crop&crop=center',
  'lolipop_biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4a8?w=400&h=300&fit=crop&crop=center',
  
  // Curries
  'chicken_curry': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center',
  'mutton_curry': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center',
  'paneer_butter_masala': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center',
  'dal_fry': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center',
  'mix_veg_curry': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center',
  
  // Breads
  'naan': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&crop=center',
  'roti': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&crop=center',
  'pulka': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&crop=center',
  'butter_naan': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&crop=center',
  
  // Rice
  'plain_rice': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop&crop=center',
  'jeera_rice': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop&crop=center',
  'pulao': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop&crop=center',
  
  // Starters
  'chicken_65': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center',
  'paneer_tikka': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center',
  'veg_spring_rolls': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center',
  
  // Desserts
  'gulab_jamun': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&crop=center',
  'rasgulla': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&crop=center',
  'kheer': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&crop=center',
  
  // Beverages
  'lassi': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&crop=center',
  'masala_chai': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&crop=center',
  'coffee': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop&crop=center',
};

// Default fallback image
const defaultImage = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const item = searchParams.get('item');
    
    if (!item) {
      return NextResponse.redirect(defaultImage);
    }
    
    // Get the image URL for the item
    const imageUrl = foodImages[item] || defaultImage;
    
    // Redirect to the actual image URL
    return NextResponse.redirect(imageUrl);
    
  } catch (error) {
    console.error('Error serving food image:', error);
    return NextResponse.redirect(defaultImage);
  }
} 