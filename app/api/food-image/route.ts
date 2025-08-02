import { NextRequest, NextResponse } from 'next/server';
import { getFoodImage } from '@/lib/imageMappings';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const itemId = searchParams.get('item');

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    const imageUrl = getFoodImage(itemId);
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image not found for item' }, { status: 404 });
    }

    // Redirect to the actual image URL
    return NextResponse.redirect(imageUrl);
  } catch (error) {
    console.error('Error serving food image:', error);
    return NextResponse.json({ error: 'Failed to serve image' }, { status: 500 });
  }
} 