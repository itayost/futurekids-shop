'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, MapPin, Clock, Check, Navigation, Loader2 } from 'lucide-react';
import { PickupPoint } from '@/types';
import { calculateDistance, formatDistance } from '@/lib/geo';

interface PickupPointSelectorProps {
  selectedPoint: PickupPoint | null;
  onSelect: (point: PickupPoint | null) => void;
}

interface PointWithDistance extends PickupPoint {
  distance?: number;
}

export default function PickupPointSelector({
  selectedPoint,
  onSelect,
}: PickupPointSelectorProps) {
  const [cities, setCities] = useState<string[]>([]);
  const [allPoints, setAllPoints] = useState<PickupPoint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Geolocation state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Check if geolocation is supported
  const geolocationSupported = typeof window !== 'undefined' && 'geolocation' in navigator;

  // Fetch all pickup points on mount
  useEffect(() => {
    async function fetchPoints() {
      try {
        const response = await fetch('/api/pickup-points');
        const data = await response.json();
        setCities(data.cities || []);
        setAllPoints(data.points || []);
      } catch (error) {
        console.error('Failed to fetch pickup points:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPoints();
  }, []);

  // Filter cities based on search query
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = cities.filter((city) =>
        city.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCities(filtered.slice(0, 10));
      setShowCityDropdown(true);
    } else {
      setFilteredCities([]);
      setShowCityDropdown(false);
    }
  }, [searchQuery, cities]);

  // Calculate distances and sort points when city is selected
  const cityPoints = useMemo((): PointWithDistance[] => {
    if (!selectedCity) return [];

    let points = allPoints.filter((p) => p.city === selectedCity);

    if (userLocation) {
      points = points.map((point) => ({
        ...point,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          parseFloat(point.latitude),
          parseFloat(point.longitude)
        ),
      }));
      // Sort by distance
      points.sort((a, b) => (a as PointWithDistance).distance! - (b as PointWithDistance).distance!);
    }

    return points;
  }, [selectedCity, allPoints, userLocation]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUseMyLocation = () => {
    if (!geolocationSupported) return;

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLocating(false);

        // Find the nearest city
        if (allPoints.length > 0) {
          let nearestPoint: PickupPoint | null = null;
          let minDistance = Infinity;

          for (const point of allPoints) {
            const dist = calculateDistance(
              latitude,
              longitude,
              parseFloat(point.latitude),
              parseFloat(point.longitude)
            );
            if (dist < minDistance) {
              minDistance = dist;
              nearestPoint = point;
            }
          }

          if (nearestPoint) {
            setSelectedCity(nearestPoint.city);
            setSearchQuery(nearestPoint.city);
          }
        }
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('הגישה למיקום נדחתה. ניתן לחפש עיר ידנית');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('לא ניתן לקבל מיקום. ניתן לחפש עיר ידנית');
            break;
          case error.TIMEOUT:
            setLocationError('הבקשה לקבלת מיקום נכשלה. ניתן לחפש עיר ידנית');
            break;
          default:
            setLocationError('שגיאה בקבלת מיקום. ניתן לחפש עיר ידנית');
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setSearchQuery(city);
    setShowCityDropdown(false);
    onSelect(null);
  };

  const handlePointSelect = (point: PickupPoint) => {
    onSelect(point);
  };

  const formatAddress = (point: PickupPoint) => {
    return `${point.street} ${point.house}, ${point.city}`;
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 text-center">
        <div className="animate-pulse">טוען נקודות איסוף...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* City Search */}
      <div className="relative" ref={dropdownRef}>
        <label className="block text-md font-bold text-gray-900 mb-2">
          חפש עיר
        </label>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="הקלד שם עיר..."
            className="input-brutal w-full rounded-lg p-3 pr-10 text-lg bg-gray-50"
          />
        </div>

        {/* City Dropdown */}
        {showCityDropdown && filteredCities.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border-2 border-[#545454] rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {filteredCities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleCitySelect(city)}
                className="w-full text-right px-4 py-3 hover:bg-pink-50 transition-colors border-b border-gray-100 last:border-0"
              >
                <span className="font-medium">{city}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Use My Location Button */}
      {geolocationSupported && !selectedCity && !selectedPoint && (
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="w-full flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl text-blue-700 font-bold transition-colors disabled:opacity-50"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              מאתר מיקום...
            </>
          ) : (
            <>
              <Navigation className="w-5 h-5" />
              השתמש במיקום שלי
            </>
          )}
        </button>
      )}

      {/* Location Error */}
      {locationError && (
        <p className="text-amber-600 text-sm text-center bg-amber-50 p-2 rounded-lg">
          {locationError}
        </p>
      )}

      {/* Selected Point Display */}
      {selectedPoint && (
        <div className="bg-pink-50 border-2 border-pink-500 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-pink-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">{selectedPoint.name}</p>
              <p className="text-gray-600 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {formatAddress(selectedPoint)}
              </p>
              {selectedPoint.remarks && (
                <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                  <Clock className="w-4 h-4" />
                  {selectedPoint.remarks}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              שנה
            </button>
          </div>
        </div>
      )}

      {/* Points List */}
      {selectedCity && !selectedPoint && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 font-medium">
            {cityPoints.length} נקודות איסוף ב{selectedCity}
            {userLocation && <span className="text-blue-600"> (ממוינות לפי מרחק)</span>}
          </p>
          <div className="max-h-64 overflow-y-auto space-y-2 border-2 border-gray-200 rounded-xl p-2">
            {cityPoints.map((point) => (
              <button
                key={point.code}
                type="button"
                onClick={() => handlePointSelect(point)}
                className="w-full text-right p-4 bg-gray-50 hover:bg-pink-50 rounded-lg transition-colors border-2 border-transparent hover:border-pink-300"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-bold">{point.name}</p>
                    <p className="text-gray-600 text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {formatAddress(point)}
                    </p>
                    {point.remarks && (
                      <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {point.remarks}
                      </p>
                    )}
                  </div>
                  {point.distance !== undefined && (
                    <span className="text-blue-600 font-bold text-sm whitespace-nowrap mr-2">
                      {formatDistance(point.distance)}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No city selected prompt */}
      {!selectedCity && !selectedPoint && (
        <p className="text-gray-500 text-sm text-center py-4">
          הקלד שם עיר או השתמש במיקום שלי כדי לראות נקודות איסוף זמינות
        </p>
      )}
    </div>
  );
}
