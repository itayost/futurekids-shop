import { NextResponse } from 'next/server';
import { fetchPickupPoints } from '@/lib/pickup-points';

// Use Next.js route segment config for caching (1 hour)
export const revalidate = 3600;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city')?.toLowerCase();

    const allPoints = await fetchPickupPoints();

    // If city filter provided, filter points
    if (city) {
      const filteredPoints = allPoints.filter(
        (point) => point.city.toLowerCase().includes(city)
      );
      return NextResponse.json(filteredPoints);
    }

    // Return unique cities for autocomplete
    const cities = [...new Set(allPoints.map((p) => p.city))].sort();

    return NextResponse.json({ cities, points: allPoints });
  } catch (error) {
    console.error('Error fetching pickup points:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pickup points' },
      { status: 500 }
    );
  }
}
