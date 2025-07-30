// High-quality food image mappings for Sri Kanya Family Restaurants
// All images are now local to the project for reliability and speed.
// Place corresponding images in the `public/menu-images/` directory.

export const foodImageMappings: { [key: string]: string } = {
  // Biryanis - Premium biryani images
  'chicken_dum_biryani_half': '/menu-images/chicken_dum_biryani_half.jpg',
  'chicken_dum_biryani_full': '/menu-images/chicken_dum_biryani_half.jpg',
  'chicken_biryani': '/menu-images/chicken_biryani.jpg',
  'mughlai_biryani': '/menu-images/mughlai_biryani.jpg',
  'lolipop_biryani': '/menu-images/lolipop_biryani.jpg',
  'joint_biryani': '/menu-images/joint_biryani.jpg',
  'prawns_biryani': '/menu-images/prawns_biryani.jpg',
  'sp_chicken_biryani': '/menu-images/sp_chicken_biryani.jpg',
  'mix_biryani': '/menu-images/mix_biryani.jpg',
  'mutton_biryani': '/menu-images/mutton_biryani.jpg',
  'kaju_biryani': '/menu-images/kaju_biryani.jpg',
  'paneer_biryani': '/menu-images/kaju_biryani.jpg',
  'mushroom_biryani': '/menu-images/kaju_biryani.jpg',
  'mixed_veg_biryani': '/menu-images/mixed_veg_biryani.jpg',

  // Veg Curries - Rich vegetarian curries
  'kaju_tomato': '/menu-images/kaju_tomato.jpg',
  'kaju_paneer': '/menu-images/kaju_tomato.jpg',
  'mushroom_curry': '/menu-images/mushroom_curry.jpg',
  'paneer_butter_masala': '/menu-images/paneer_butter_masala.jpg',
  'methi_chaman': '/menu-images/methi_chaman.jpg',
  'plain_palak': '/menu-images/methi_chaman.jpg',
  'palak_paneer': '/menu-images/methi_chaman.jpg',
  'kaju_masala': '/menu-images/kaju_masala.jpg',
  'chilly_paneer_mushroom': '/menu-images/chilly_paneer_mushroom.jpg',
  'manchurian_paneer_mushroom': '/menu-images/machurian_paneer.jpg',
  'veg_manchurian': '/menu-images/veg_manchurian.jpg',
  'kaju_fry': '/menu-images/kaju_fry.jpg',
  '65_paneer_mushroom': '/menu-images/65_paneer_mushroom.jpg',

  // Non-Veg Curries - Tender meat curries
  'chilly_chicken': '/menu-images/chilly_chicken.jpg',
  'manchurian_chicken': '/menu-images/manchurian_chicken.jpg',
  'dragon_chicken': '/menu-images/dragon_chicken.jpg',
  'kaju_chicken_balls': '/menu-images/kaju_chicken_balls.jpg',
  'chicken_555': '/menu-images/chicken_555.jpg',
  'chicken_65': '/menu-images/chicken_555.jpg',
  'chicken_fry': '/menu-images/chicken_fry.jpg',
  'lolipop_chicken': '/menu-images/lolipop_chicken.jpg',
  'whigs_fry': '/menu-images/wings_fry.jpg',
  'fish_fry': '/menu-images/fish_fry.jpg',
  'loose_prawns_chilli': '/menu-images/loose_prawns_chilli.jpg',
  'chicken_bone': '/menu-images/chicken_curry.jpg',
  'chicken_boneless': '/menu-images/boneless_curry.jpg',
  'kaju_chicken': '/menu-images/kaju_chicken.jpg',
  'hyderabadi_chicken': '/menu-images/chicken_curry.jpg',
  'kadai_chicken': '/menu-images/kadai_chicken.jpg',
  'chicken_pawan_kalyan': '/menu-images/boneless_curry.jpg',
  'methi_chicken': '/menu-images/methi_chicken.jpg',
  'palak_chicken': '/menu-images/palak_chicken.jpg',
  'chicken_mughlai': '/menu-images/chicken_mughlai.jpg',
  'mutton_curry': '/menu-images/mutton_curry.jpg',
  'mutton_fry': '/menu-images/mutton_fry.jpg',
  'prawn_curry': '/menu-images/prawn_curry.jpg',
  'egg_keema': '/menu-images/egg_keema.jpg',
  'egg_bhurji': '/menu-images/egg_bhurji.jpg',

  // Fried Rice & Noodles - Indo-Chinese favorites
  'veg_fried_rice': '/menu-images/veg_fried_rice.jpg',
  'paneer_fried_rice': '/menu-images/paneer_fried_rice.jpg',
  'mushroom_fried_rice': '/menu-images/mushroom_fried_rice.jpg',
  'mix_fried_rice_veg': '/menu-images/mix_fried_rice_veg.jpg',
  'sp_veg_fried_rice': '/menu-images/sp_veg_fried_rice.jpg',
  'chicken_fried_rice': '/menu-images/chicken_fried_rice.jpg',
  'egg_fried_rice': '/menu-images/egg_fried_rice.jpg',
  'mix_fried_rice_nonveg': '/menu-images/mix_fried_rice_nonveg.jpg',
  'sp_nonveg_fried_rice': '/menu-images/sp_nonveg_fried_rice.jpg',
  'mutton_fried_rice': '/menu-images/mutton_fried_rice.jpg',
  'prawns_fried_rice': '/menu-images/prawns_fried_rice.jpg',
  'schezwan_fried_rice': '/menu-images/schezwan_fried_rice.jpg',
  'veg_noodles': '/menu-images/veg_noodles.jpg',
  'egg_noodles': '/menu-images/egg_noodles.jpg',
  'chicken_noodles': '/menu-images/chicken_noodles.jpg',
  'chicken_schezwan_noodles': '/menu-images/chicken_schezwan_noodles.jpg',

  // Breads & Roti - Traditional Indian breads
  'pulka': '/menu-images/pulka.jpg',
};

// Function to get the appropriate image for a menu item
export function getFoodImage(itemId: string): string {
  // Use a placeholder if a specific image mapping doesn't exist.
  return foodImageMappings[itemId] || '/images/food-placeholder.jpg';
}

// Function to get fallback image based on category
export function getFallbackImage(category: string): string {
  const categoryImages: { [key: string]: string } = {
    biryanis: '/menu-images/biryanis-fallback.jpg',
    vegCurries: '/menu-images/veg-curries-fallback.jpg',
    nonVegCurries: '/menu-images/non-veg-curries-fallback.jpg',
    friedRiceNoodles: '/menu-images/fried-rice-noodles-fallback.jpg',
    breadsRoti: '/menu-images/breads-roti-fallback.jpg',
  };
  
  return categoryImages[category] || '/images/food-placeholder.jpg';
} 