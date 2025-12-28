'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Clock, Check } from 'lucide-react';
import { PickupPoint } from '@/types';

interface PickupPointSelectorProps {
  selectedPoint: PickupPoint | null;
  onSelect: (point: PickupPoint | null) => void;
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
  const [cityPoints, setCityPoints] = useState<PickupPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      setFilteredCities(filtered.slice(0, 10)); // Limit to 10 results
      setShowCityDropdown(true);
    } else {
      setFilteredCities([]);
      setShowCityDropdown(false);
    }
  }, [searchQuery, cities]);

  // Filter points when city is selected
  useEffect(() => {
    if (selectedCity) {
      const points = allPoints.filter((p) => p.city === selectedCity);
      setCityPoints(points);
    } else {
      setCityPoints([]);
    }
  }, [selectedCity, allPoints]);

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

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setSearchQuery(city);
    setShowCityDropdown(false);
    onSelect(null); // Clear selected point when city changes
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
          <div className="absolute z-10 w-full mt-1 bg-white border-2 border-black rounded-xl shadow-lg max-h-60 overflow-y-auto">
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
          </p>
          <div className="max-h-64 overflow-y-auto space-y-2 border-2 border-gray-200 rounded-xl p-2">
            {cityPoints.map((point) => (
              <button
                key={point.code}
                type="button"
                onClick={() => handlePointSelect(point)}
                className="w-full text-right p-4 bg-gray-50 hover:bg-pink-50 rounded-lg transition-colors border-2 border-transparent hover:border-pink-300"
              >
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
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No city selected prompt */}
      {!selectedCity && !selectedPoint && (
        <p className="text-gray-500 text-sm text-center py-4">
          הקלד שם עיר כדי לראות נקודות איסוף זמינות
        </p>
      )}
    </div>
  );
}
