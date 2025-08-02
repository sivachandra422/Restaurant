import { NextRequest, NextResponse } from 'next/server';
import { getFoodImage, getLocalFallbackImage, testImageAccessibility } from '@/lib/imageMappings';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    // Get the primary Cloudinary URL
    const cloudinaryUrl = getFoodImage(itemId);
    
    // Test if Cloudinary image is accessible
    const isCloudinaryAccessible = await testImageAccessibility(cloudinaryUrl);
    
    if (isCloudinaryAccessible) {
      return NextResponse.json({ 
        imageUrl: cloudinaryUrl,
        source: 'cloudinary',
        accessible: true 
      });
    } else {
      // Fallback to local image
      const localUrl = getLocalFallbackImage(itemId);
      return NextResponse.json({ 
        imageUrl: localUrl,
        source: 'local',
        accessible: true,
        fallback: true 
      });
    }
  } catch (error) {
    console.error('Food image API error:', error);
    return NextResponse.json({ error: 'Failed to get image URL' }, { status: 500 });
  }
} 