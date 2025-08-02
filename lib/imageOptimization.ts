// Image optimization utilities for better performance

export interface ImageOptimizationConfig {
  quality: number;
  format: 'webp' | 'avif' | 'jpeg';
  width: number;
  height: number;
  blur?: number;
}

// Optimize Cloudinary URLs with better parameters
export function optimizeCloudinaryUrl(url: string, config: Partial<ImageOptimizationConfig> = {}): string {
  const defaultConfig: ImageOptimizationConfig = {
    quality: 80,
    format: 'webp',
    width: 400,
    height: 300,
    blur: 0
  };

  const finalConfig = { ...defaultConfig, ...config };

  // If it's already a Cloudinary URL, optimize it
  if (url.includes('res.cloudinary.com')) {
    const baseUrl = url.split('/upload/')[0] + '/upload/';
    const imageId = url.split('/upload/')[1];
    
    const transformations = [
      `f_${finalConfig.format}`,
      `q_${finalConfig.quality}`,
      `w_${finalConfig.width}`,
      `h_${finalConfig.height}`,
      'c_fill',
      'g_auto'
    ];

    if (finalConfig.blur && finalConfig.blur > 0) {
      transformations.push(`e_blur:${finalConfig.blur}`);
    }

    return `${baseUrl}${transformations.join(',')}/${imageId}`;
  }

  return url;
}

// Generate responsive image URLs
export function getResponsiveImageUrls(baseUrl: string): {
  mobile: string;
  tablet: string;
  desktop: string;
} {
  return {
    mobile: optimizeCloudinaryUrl(baseUrl, { width: 300, height: 225 }),
    tablet: optimizeCloudinaryUrl(baseUrl, { width: 400, height: 300 }),
    desktop: optimizeCloudinaryUrl(baseUrl, { width: 500, height: 375 })
  };
}

// Preload critical images
export function preloadImages(imageUrls: string[]): Promise<void[]> {
  return Promise.all(
    imageUrls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject();
        img.src = url;
      });
    })
  );
}

// Generate low-quality placeholder
export function generatePlaceholder(width: number, height: number): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    // Create a simple gradient placeholder
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  
  return canvas.toDataURL('image/jpeg', 0.1);
}

// Check if image is cached
export function isImageCached(url: string): boolean {
  const img = new Image();
  img.src = url;
  return img.complete;
}

// Optimize image loading strategy
export function getOptimalImageStrategy(itemId: string, isVisible: boolean): {
  priority: boolean;
  loading: 'eager' | 'lazy';
  placeholder: string;
} {
  // Critical items that should load immediately
  const criticalItems = [
    'chicken_dum_biryani_half',
    'chicken_biryani',
    'paneer_butter_masala',
    'chicken_curry'
  ];

  const isCritical = criticalItems.includes(itemId);
  const shouldPreload = isCritical || isVisible;

  return {
    priority: isCritical,
    loading: shouldPreload ? 'eager' : 'lazy',
    placeholder: 'blur'
  };
} 