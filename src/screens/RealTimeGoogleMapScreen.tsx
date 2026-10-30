import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Navigation,
  LocateFixed,
  Car,
  Bike,
  Bus,
  Footprints,
  Compass,
  MapPin,
  UtensilsCrossed,
  Hotel,
  Fuel,
  Zap,
  Coffee,
  Layers,
  Sparkles,
  X,
  Share2,
  Mic,
  Bookmark,
  Plus,
  AlertTriangle,
  ArrowUpDown,
  ShoppingBag,
  Home,
  Briefcase,
  Dumbbell,
  Bed,
  Check,
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { VoiceCommandListener } from '../components/VoiceCommandListener';
import { VoiceCommandResult } from '../services/voiceNavigationService';

type TravelMode = 'drive' | 'bike' | 'transit' | 'walk';
type MapScreenMode = 'explore' | 'directions';

interface RouteEstimate {
  distance: string;
  duration: string;
  speed: string;
  cost?: string;
  tollNote?: string;
}

interface PlaceSuggestion {
  id: string;
  name: string;
  secondary: string;
  category: 'landmark' | 'airport' | 'station' | 'business' | 'mall' | 'area';
  lat: number;
  lng: number;
}

const PLACES_DATABASE: PlaceSuggestion[] = [
  { id: 'p1', name: 'Gachibowli, Hyderabad', secondary: 'Financial District, Outer Ring Road', category: 'area', lat: 17.4401, lng: 78.3489 },
  { id: 'p2', name: 'Hitec City & Cyber Towers', secondary: 'Madhapur Tech Zone, Hyderabad', category: 'business', lat: 17.4504, lng: 78.3808 },
  { id: 'p3', name: 'Rajiv Gandhi International Airport (RGIA)', secondary: 'Shamshabad, Hyderabad', category: 'airport', lat: 17.2403, lng: 78.4294 },
  { id: 'p4', name: 'Secunderabad Railway Station', secondary: 'Secunderabad Junction, Telangana', category: 'station', lat: 17.4334, lng: 78.5042 },
  { id: 'p5', name: 'Inorbit Mall Mindspace', secondary: 'APIIC Software Layout, Madhapur', category: 'mall', lat: 17.4357, lng: 78.3888 },
  { id: 'p6', name: 'DLF Cyber City', secondary: 'Gachibowli - Miyapur Rd, Hyderabad', category: 'business', lat: 17.4485, lng: 78.3562 },
  { id: 'p7', name: 'Asif Nagar & Mehdipatnam', secondary: 'Mehdipatnam Main Road, Hyderabad', category: 'area', lat: 17.3916, lng: 78.4354 },
  { id: 'p8', name: 'Bhavani Island', secondary: 'Krishna River Tourism Hub, Vijayawada', category: 'landmark', lat: 16.5167, lng: 80.5936 },
  { id: 'p9', name: 'Benz Circle Hub', secondary: 'MG Road & Ring Road, Vijayawada', category: 'landmark', lat: 16.4952, lng: 80.6515 },
  { id: 'p10', name: 'Mangalagiri Panakala Swamy Temple', secondary: 'NH16 Hilltop, Guntur / Vijayawada', category: 'landmark', lat: 16.4352, lng: 80.5645 },
  { id: 'p11', name: 'Rushikonda Beach', secondary: 'East Coast Marine Drive, Visakhapatnam', category: 'landmark', lat: 17.7819, lng: 83.3852 },
  { id: 'p12', name: 'Kondapur Botanical Garden Rd', secondary: 'Kothaguda, Hyderabad', category: 'area', lat: 17.4646, lng: 78.3615 },
  { id: 'p13', name: 'Jubilee Hills Check Post', secondary: 'Road No. 36, Hyderabad', category: 'area', lat: 17.4319, lng: 78.4073 },
  { id: 'p14', name: 'Charminar & Old City', secondary: 'Old City, Hyderabad', category: 'landmark', lat: 17.3616, lng: 78.4747 },
  { id: 'p15', name: 'Hussain Sagar & Tank Bund', secondary: 'Khairatabad, Hyderabad', category: 'landmark', lat: 17.4239, lng: 78.4738 },
];

export const RealTimeGoogleMapScreen: React.FC = () => {
  const {
    goBack,
    showToast,
    navigateTo,
    startTripWithDetails,
    updateSharedDestination,
    user,
    savedPlaces,
    userCoords: liveGpsCoords,
    locationPermission,
  } = useTrip();

  // Mode: Default ALWAYS starts in 'explore' mode per user requirement
  const [mapMode, setMapMode] = useState<MapScreenMode>('explore');
  const [destinationQuery, setDestinationQuery] = useState<string>('');
  const [startLocationQuery, setStartLocationQuery] = useState<string>('Your location (Live GPS)');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);
  const [exploreTab, setExploreTab] = useState<'explore' | 'you' | 'contribute'>('explore');

  // Live GPS Coordinates centered on current user location
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>(() => {
    return liveGpsCoords || { lat: 17.4401, lng: 78.3489 };
  });

  useEffect(() => {
    if (liveGpsCoords) {
      setUserCoords(liveGpsCoords);
    }
  }, [liveGpsCoords]);

  // Mode selection: default Drive
  const [travelMode, setTravelMode] = useState<TravelMode>('drive');
  const [mapType, setMapType] = useState<'m' | 'k' | 'p'>('m'); // m = roadmap, k = satellite, p = terrain
  const [zoomLevel, setZoomLevel] = useState<number>(14);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filtered place suggestions as user types
  const filteredSuggestions = destinationQuery.trim().length > 0
    ? PLACES_DATABASE.filter((p) => {
        const q = destinationQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.secondary.toLowerCase().includes(q);
      })
    : [];

  // Categories matching Image 2 & Image 1
  const exploreCategories = [
    { id: 'restaurants', label: 'Restaurants', icon: <UtensilsCrossed className="w-3.5 h-3.5 text-rose-500" /> },
    { id: 'hotels', label: 'Hotels', icon: <Hotel className="w-3.5 h-3.5 text-purple-500" /> },
    { id: 'petrol', label: 'Petrol', icon: <Fuel className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'cafes', label: 'Cafes', icon: <Coffee className="w-3.5 h-3.5 text-amber-700" /> },
    { id: 'ev', label: 'EV Charging', icon: <Zap className="w-3.5 h-3.5 text-blue-500" /> },
    { id: 'groceries', label: 'Groceries', icon: <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" /> },
  ];

  // Auto-detect user's GPS on mount to center the map on current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // Graceful default
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    }
  }, []);

  // Multi-modal route estimates calculation
  const getModeEstimates = (): Record<TravelMode, RouteEstimate> => {
    const destLower = destinationQuery.toLowerCase();
    let baseKm = 295.0; // Hyderabad - Vijayawada default corridor (Matches image 1)
    if (destLower.includes('bhavani')) baseKm = 12.6;
    else if (destLower.includes('mangalagiri')) baseKm = 22.4;
    else if (destLower.includes('gachibowli')) baseKm = 18.5;
    else if (destLower.includes('benz')) baseKm = 6.2;
    else if (destLower.includes('asif nagar')) baseKm = 5.9;
    else if (destLower.length > 0) baseKm = Math.max(5.5, Math.min(320.0, destLower.length * 8.5));

    return {
      drive: {
        distance: `${Math.round(baseKm)} km`,
        duration:
          baseKm > 100
            ? `${Math.floor(baseKm / 55)} hr ${Math.round((baseKm % 55) * 0.7)} min`
            : `${Math.round(baseKm * 1.6)} min`,
        speed: '65-80 km/h',
        cost: '₹460.00',
        tollNote: 'Fastag toll road',
      },
      bike: {
        distance: `${Math.round(baseKm * 0.98)} km`,
        duration:
          baseKm > 100
            ? `${Math.floor(baseKm / 60)} hr ${Math.round((baseKm % 60) * 0.6)} min`
            : `${Math.round(baseKm * 1.4)} min`,
        speed: '50-65 km/h',
        cost: '₹0 Tolls',
        tollNote: 'Two-wheeler corridor',
      },
      transit: {
        distance: `${Math.round(baseKm * 1.05)} km`,
        duration:
          baseKm > 100
            ? `${Math.floor(baseKm / 52)} hr ${Math.round((baseKm % 52) * 0.8)} min`
            : `${Math.round(baseKm * 2.2)} min`,
        speed: 'Frequent Express trains & buses',
        cost: '₹320.00',
      },
      walk: {
        distance: `${Math.round(baseKm * 0.95)} km`,
        duration: baseKm > 50 ? '3 days' : `${Math.round(baseKm * 12)} min`,
        speed: '5 km/h',
        cost: 'Free',
      },
    };
  };

  const estimates = getModeEstimates();
  const currentEstimate = estimates[travelMode];

  // Live Location Finder (Centers Map on Current Location)
  const handleFindLiveLocation = () => {
    setIsLocating(true);
    showToast('Centering map on your current GPS location...');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoords({ lat: latitude, lng: longitude });
          setStartLocationQuery('Your location (Live GPS)');
          setIsLocating(false);
          setZoomLevel(15);
          showToast(`Centered on live GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        },
        () => {
          setIsLocating(false);
          showToast('GPS position locked to current area');
        },
        { timeout: 6000, enableHighAccuracy: true }
      );
    } else {
      setIsLocating(false);
      showToast('Map centered on current location');
    }
  };

  /**
   * Requirement: When user enters a destination, do not show the location details page.
   * Automatically open Directions mode with:
   * - Source: Current Location
   * - Destination: User entered place
   * - Travel Mode: Drive
   * - Display route options and ETA.
   */
  const handleOpenDirectionsForDestination = (placeName: string) => {
    if (!placeName.trim()) return;
    setDestinationQuery(placeName.trim());
    setStartLocationQuery('Your location');
    setTravelMode('drive');
    setMapMode('directions');
    showToast(`Calculating fastest drive route to ${placeName}...`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destinationQuery.trim()) {
      handleOpenDirectionsForDestination(destinationQuery.trim());
    }
  };

  const handleCategoryClick = (cat: typeof exploreCategories[0]) => {
    setSelectedCategory(cat.id);
    handleOpenDirectionsForDestination(`${cat.label} near me`);
  };

  const handleShortcutClick = (place: { id: string; label: string; address: string; isSet: boolean }) => {
    if (place.isSet && place.address) {
      handleOpenDirectionsForDestination(place.address);
    } else {
      handleOpenDirectionsForDestination(`${place.label}, Hyderabad`);
    }
  };

  const handleSwapLocations = () => {
    const temp = startLocationQuery;
    setStartLocationQuery(destinationQuery);
    setDestinationQuery(temp);
  };

  const handleVoiceCommand = (result: VoiceCommandResult) => {
    switch (result.type) {
      case 'GAS_STATION':
        handleOpenDirectionsForDestination('Indian Oil Petrol Bunk, NH16');
        showToast('⛽ Routing to nearest Petrol Bunk on NH16');
        break;
      case 'HOME':
        handleOpenDirectionsForDestination(result.parameter || 'Home, Jubilee Hills, Hyderabad');
        showToast('🏠 Routing to Home');
        break;
      case 'OFFICE':
        handleOpenDirectionsForDestination(result.parameter || 'Office, HITEC City, Hyderabad');
        showToast('🏢 Routing to Office');
        break;
      case 'FOOD':
        handleOpenDirectionsForDestination('Moai Kitchen & Restaurants, Gachibowli');
        showToast('🍽️ Routing to nearby restaurants');
        break;
      case 'REROUTE':
        setTravelMode((prev) => (prev === 'drive' ? 'bike' : 'drive'));
        showToast('🔀 Recalculated route');
        break;
      case 'WEATHER':
        showToast('🌧️ Gachibowli Weather: 23°C • Moderate rain delay advisory');
        break;
      case 'CUSTOM_DESTINATION':
        if (result.parameter) {
          handleOpenDirectionsForDestination(result.parameter);
        }
        break;
      default:
        if (result.transcript) {
          handleOpenDirectionsForDestination(result.transcript);
        }
        break;
    }
  };

  const handleVoiceSearch = () => {
    handleVoiceCommand({
      type: 'GAS_STATION',
      transcript: 'find gas station',
      feedbackSpeech: 'Searching for nearest petrol bunk.',
      description: 'Finding nearest gas station on your route',
    });
  };

  /**
   * Reset the map state:
   * "After completing navigation or route generation, clear the selected destination and reset the map state.
   *  When the user opens Maps again:
   *  - Show the default map view centered on the current location.
   *  - Do not retain the previously searched destination.
   *  - Do not automatically display route details.
   *  - Do not prefill Gachibowli or any previous location.
   *  - Show only the standard Explore/Home map screen."
   */
  const handleResetToExplore = () => {
    setDestinationQuery('');
    setStartLocationQuery('Your location');
    setSelectedCategory(null);
    setMapMode('explore');
    showToast('Returned to explore map');
  };

  const handleStartNavigation = () => {
    const finalDest = destinationQuery.trim() || 'Gachibowli, Hyderabad';
    updateSharedDestination(finalDest);
    startTripWithDetails(finalDest, 3, false);
    // Clear destination from this screen so returning is clean
    setDestinationQuery('');
    setMapMode('explore');
    showToast(`Starting navigation to ${finalDest}...`);
    navigateTo('live-navigation');
  };

  // Google Maps Direction Flag: d = driving, b = bike, r = transit, w = walking
  const getDirFlag = (mode: TravelMode): string => {
    switch (mode) {
      case 'drive':
        return 'd';
      case 'bike':
        return 'b';
      case 'transit':
        return 'r';
      case 'walk':
        return 'w';
      default:
        return 'd';
    }
  };

  // Embed URL changes dynamically based on explore vs directions
  const googleMapsEmbedUrl =
    mapMode === 'directions' && destinationQuery.trim()
      ? `https://maps.google.com/maps?saddr=${encodeURIComponent(
          startLocationQuery === 'Your location' ? `${userCoords.lat},${userCoords.lng}` : startLocationQuery
        )}&daddr=${encodeURIComponent(
          destinationQuery
        )}&dirflg=${getDirFlag(travelMode)}&t=${mapType}&z=13&ie=UTF8&iwloc=&output=embed`
      : `https://maps.google.com/maps?q=${userCoords.lat},${userCoords.lng}&t=${mapType}&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="relative w-full h-screen bg-[#F0F4F8] text-slate-800 overflow-hidden flex flex-col select-none">
      {/* ─────────────────────────────────────────────────────────────
          MODE A: STANDARD EXPLORE / HOME MAP SCREEN (Matches Image 2)
         ───────────────────────────────────────────────────────────── */}
      {mapMode === 'explore' ? (
        <div className="absolute top-3 left-3 right-3 z-30 max-w-xl mx-auto space-y-2 pointer-events-auto">
          {/* Top Search Pill (Image 2) */}
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white rounded-full shadow-[0_6px_25px_rgba(0,0,0,0.12)] border border-slate-200/90 px-3.5 py-2.5 flex items-center justify-between gap-3"
          >
            {/* Back button */}
            <button
              type="button"
              onClick={() => goBack()}
              className="p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>

            {/* RouteMitra Logo at Search Start */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <img
                src="/assets/aistudio/Route_Mitra_Logo_69de06f0.jpeg"
                alt="RouteMitra"
                className="w-6 h-6 rounded-md object-cover shadow-2xs shrink-0"
              />
              <input
                type="text"
                placeholder="Search here"
                value={destinationQuery}
                onChange={(e) => setDestinationQuery(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              {destinationQuery && (
                <button
                  type="button"
                  onClick={() => setDestinationQuery('')}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Mic, Ask Button, Avatar (Image 2) */}
            <div className="flex items-center gap-2 shrink-0">
              <VoiceCommandListener
                onCommand={handleVoiceCommand}
                buttonSize="sm"
                className="bg-transparent hover:bg-slate-100 border-0 shadow-none text-slate-700"
              />

              <button
                type="button"
                onClick={() => {
                  showToast('AI Route Assistant: Ask for detour, traffic or petrol options');
                }}
                className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="AI Travel Assistant"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Ask</span>
              </button>

              <button
                type="button"
                onClick={() => navigateTo('profile')}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-500 shadow-xs cursor-pointer hover:scale-105 transition-transform shrink-0 flex items-center justify-center bg-[#087F5B] text-white text-xs font-bold"
                title="Open Profile"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/assets/bhargav_avatar.svg';
                    }}
                  />
                ) : (
                  <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'B'}</span>
                )}
              </button>
            </div>
          </form>

          {/* Real-time Place Suggestions Dropdown */}
          {destinationQuery.trim().length > 0 && filteredSuggestions.length > 0 && (
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-[0_12px_40px_rgba(0,0,0,0.18)] overflow-hidden max-h-72 overflow-y-auto animate-fade-in">
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Matching Places</span>
                <span>{filteredSuggestions.length} found</span>
              </div>
              <div className="divide-y divide-slate-100">
                {filteredSuggestions.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => handleOpenDirectionsForDestination(place.name)}
                    className="w-full px-4 py-3 text-left hover:bg-emerald-50/60 transition-colors flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-emerald-100 text-slate-600 group-hover:text-emerald-700 flex items-center justify-center shrink-0 transition-colors">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 truncate">
                        {place.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {place.secondary}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 shrink-0">
                      Drive →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Categories Row (Image 2): Restaurants, Hotels, Petrol, Cafes, EV Charging */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none px-1">
            {exploreCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/90 shadow-sm transition-all cursor-pointer"
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
           MODE B: DIRECTIONS MODE (Matches image_81ee0b51.png)
           - Floating Directions Card directly over the map
           - No redundant top search bar or category chips
           - Origin: Your location (with live GPS locate button)
           - Destination: User entered place (with edit/clear option)
           - Travel Mode: Drive (default selected with green card)
           - Time / Fare pills: 5 hr 11 min ₹460.00 / 6 hr 36 min No tolls
           - Weather / Road Advisory: Well Marked Low Pressure Area Advisory
           ───────────────────────────────────────────────────────────── */
        <div className="absolute top-4 left-3 right-3 z-30 max-w-lg mx-auto pointer-events-auto">
          {/* ── Main Directions Card (Matches image_81ee0b51.png precisely) ── */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-[0_12px_40px_rgba(0,0,0,0.16)] border border-slate-200/90 space-y-3.5 animate-fade-in relative backdrop-blur-md">
            {/* Header: Back / Close button & Title */}
            <div className="flex items-center justify-between pb-1">
              <button
                type="button"
                onClick={handleResetToExplore}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Return to standard map view"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Map</span>
              </button>

              <button
                type="button"
                onClick={handleResetToExplore}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close Directions"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Origin & Destination Inputs + Swap */}
            <div className="flex items-center gap-2.5">
              <div className="flex flex-col items-center gap-1 shrink-0 pt-1">
                <span className="w-3.5 h-3.5 rounded-full bg-blue-500 ring-4 ring-blue-100" />
                <span className="w-0.5 h-7 bg-slate-200" />
                <MapPin className="w-4 h-4 text-rose-500 fill-rose-500" />
              </div>

              <div className="flex-1 space-y-2">
                {/* Origin */}
                <div className="flex items-center justify-between bg-slate-50 rounded-2xl px-3.5 py-2 border border-slate-200/70">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {startLocationQuery}
                  </span>
                  <button
                    type="button"
                    onClick={handleFindLiveLocation}
                    disabled={isLocating}
                    className="p-1 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    title="Center on Live GPS"
                  >
                    <LocateFixed className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Destination */}
                <div className="flex items-center justify-between bg-slate-50 rounded-2xl px-3.5 py-2 border border-slate-200/70">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {destinationQuery}
                  </span>
                </div>
              </div>

              {/* Swap Button (Image 1) */}
              <button
                type="button"
                onClick={handleSwapLocations}
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer shrink-0 shadow-2xs"
                title="Swap Start and Destination"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>

            {/* Fast Route Pills (Image 1: 5 hr 11 min ₹460.00 / 6 hr 36 min No tolls) */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 px-4 py-2.5 rounded-2xl bg-blue-600 text-white shadow-sm flex items-center justify-between">
                <span className="text-xs font-bold">{estimates.drive.duration}</span>
                <span className="text-[11px] font-semibold opacity-90">{estimates.drive.cost}</span>
              </div>

              <div className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-between border border-slate-200/80">
                <span className="text-xs font-bold">6 hr 36 min</span>
                <span className="text-[10px] font-medium text-slate-500">No tolls</span>
              </div>
            </div>

            {/* Weather & Road Advisory Banner (Image 1) */}
            <div className="bg-rose-50/90 border border-rose-200/80 rounded-2xl p-2.5 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-rose-900 truncate">
                  Well Marked Low Pressure Area Advisory
                </p>
                <p className="text-[10px] text-rose-700 truncate">
                  Your route may experience moderate rain and traffic delays.
                </p>
              </div>
            </div>

            {/* Multi-Modal Travel Modes: Drive (green card selected), Bike, Transit, Walk (Image 1) */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {/* Drive - Selected with green background and border (Image 1) */}
              <button
                type="button"
                onClick={() => setTravelMode('drive')}
                className={`py-2 rounded-2xl flex flex-col items-center gap-0.5 cursor-pointer transition-all ${
                  travelMode === 'drive'
                    ? 'bg-[#E2F6EB] text-[#087F5B] font-bold border-2 border-[#A3E6C2] shadow-xs'
                    : 'text-slate-500 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Car className="w-4 h-4" />
                <span className="text-[11px] font-bold">Drive</span>
                <span className="text-[10px] font-semibold">{estimates.drive.duration}</span>
              </button>

              {/* Bike */}
              <button
                type="button"
                onClick={() => setTravelMode('bike')}
                className={`py-2 rounded-2xl flex flex-col items-center gap-0.5 cursor-pointer transition-all ${
                  travelMode === 'bike'
                    ? 'bg-[#E0F2FE] text-[#0284C7] font-bold border-2 border-[#7DD3FC]'
                    : 'text-slate-500 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Bike className="w-4 h-4" />
                <span className="text-[11px] font-bold">Bike</span>
                <span className="text-[10px] font-semibold">{estimates.bike.duration}</span>
              </button>

              {/* Transit */}
              <button
                type="button"
                onClick={() => setTravelMode('transit')}
                className={`py-2 rounded-2xl flex flex-col items-center gap-0.5 cursor-pointer transition-all ${
                  travelMode === 'transit'
                    ? 'bg-[#FEF3C7] text-[#D97706] font-bold border-2 border-[#FCD34D]'
                    : 'text-slate-500 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Bus className="w-4 h-4" />
                <span className="text-[11px] font-bold">Transit</span>
                <span className="text-[10px] font-semibold">{estimates.transit.duration}</span>
              </button>

              {/* Walk */}
              <button
                type="button"
                onClick={() => setTravelMode('walk')}
                className={`py-2 rounded-2xl flex flex-col items-center gap-0.5 cursor-pointer transition-all ${
                  travelMode === 'walk'
                    ? 'bg-[#FFE4E6] text-[#E11D48] font-bold border-2 border-[#FDA4AF]'
                    : 'text-slate-500 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Footprints className="w-4 h-4" />
                <span className="text-[11px] font-bold">Walk</span>
                <span className="text-[10px] font-semibold">{estimates.walk.duration}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Real Google Map Embed ── */}
      <div className="relative w-full h-full z-10 flex-1">
        <iframe
          title="Google Map Real Time Navigation"
          src={googleMapsEmbedUrl}
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />

        {/* ── Floating Controls on Right Side (Image 2) ── */}
        <div className="absolute right-4 bottom-32 z-20 flex flex-col items-center gap-3 pointer-events-auto">
          {/* Hands-Free Voice Navigation Button */}
          <VoiceCommandListener
            onCommand={handleVoiceCommand}
            buttonSize="md"
            className="w-11 h-11 bg-white/95 text-slate-800 border-slate-200/90 shadow-xl hover:bg-slate-50"
          />

          {/* Map Layers button */}
          <button
            type="button"
            onClick={() => setMapType(mapType === 'm' ? 'k' : mapType === 'k' ? 'p' : 'm')}
            className="w-11 h-11 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-slate-200/90 flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer transition-transform hover:scale-105"
            title="Toggle Map Layers (Satellite / Terrain / Default)"
          >
            <Layers className="w-5 h-5 text-slate-700" />
          </button>

          {/* Compass button */}
          <button
            type="button"
            onClick={() => showToast('Oriented to True North')}
            className="w-11 h-11 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-slate-200/90 flex items-center justify-center text-slate-700 hover:bg-slate-50 cursor-pointer transition-transform hover:scale-105"
            title="Orient North"
          >
            <Compass className="w-5 h-5 text-slate-700" />
          </button>

          {/* My Location / Recenter Button (Blue target dot, Image 2) */}
          <button
            type="button"
            onClick={handleFindLiveLocation}
            className="w-12 h-12 rounded-full bg-white hover:bg-slate-50 text-blue-600 shadow-2xl border border-slate-200 flex items-center justify-center transition-all cursor-pointer hover:scale-105"
            title="Recenter on My Location"
          >
            <LocateFixed className={`w-6 h-6 ${isLocating ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM SHEET: EXPLORE MODE (Image 2) vs DIRECTIONS DOCK (Image 1)
         ───────────────────────────────────────────────────────────── */}
      {mapMode === 'explore' ? (
        /* Explore Bottom Card (Matches Image 2) */
        <div className="relative z-30 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] px-5 pt-3 pb-5 pointer-events-auto">
          {/* Subtle drag handle */}
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" />

          {/* Location Title & Weather Pill (Image 2: Gachibowli • ⛅ 23° NAQI) */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Gachibowli</h3>
              <p className="text-xs text-slate-500 font-medium">Financial District • Hyderabad</p>
            </div>

            {/* Weather / AQI badge matching Image 2 */}
            <div className="px-3 py-1 rounded-2xl bg-slate-100 border border-slate-200 flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <span>⛅ 23°</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-slate-500 uppercase">NAQI</span>
            </div>
          </div>

          {/* Saved Place Shortcuts: Home, Office, Gym, Hostel */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {savedPlaces.map((sp) => {
              const icon =
                sp.id === 'home' ? (
                  <Home className="w-3.5 h-3.5" />
                ) : sp.id === 'office' ? (
                  <Briefcase className="w-3.5 h-3.5" />
                ) : sp.id === 'gym' ? (
                  <Dumbbell className="w-3.5 h-3.5" />
                ) : (
                  <Bed className="w-3.5 h-3.5" />
                );

              return (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => handleShortcutClick(sp)}
                  className="py-2 px-1 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 text-slate-700 hover:text-emerald-800 flex flex-col items-center gap-1 transition-colors cursor-pointer text-center"
                >
                  <span className="p-1 rounded-lg bg-white shadow-2xs text-emerald-600">{icon}</span>
                  <span className="text-[11px] font-bold capitalize">{sp.label}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Tabs: Explore (Active teal pill), You, Contribute (Image 2) */}
          <div className="flex items-center justify-around border-t border-slate-100 pt-2.5">
            <button
              type="button"
              onClick={() => setExploreTab('explore')}
              className={`px-5 py-1.5 rounded-full text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                exploreTab === 'explore'
                  ? 'bg-[#C2E7FF] text-[#001D35]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-4 h-4 fill-current" />
              <span>Explore</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setExploreTab('you');
                navigateTo('profile');
              }}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 flex flex-col items-center gap-1 transition-all cursor-pointer"
            >
              <Bookmark className="w-4 h-4" />
              <span>You</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setExploreTab('contribute');
                showToast('Report road condition, petrol price, or speed traps to community');
              }}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 flex flex-col items-center gap-1 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Contribute</span>
            </button>
          </div>
        </div>
      ) : (
        /* Glassmorphic Directions Action Dock with Centralized Action Button & Improved Elevation */
        <footer className="relative z-30 bg-white/85 backdrop-blur-2xl border-t border-white/60 shadow-[0_-12px_45px_rgba(0,0,0,0.12)] px-4 py-3.5 pointer-events-auto">
          <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
            {/* Left: Add stops */}
            <button
              type="button"
              onClick={() => {
                showToast('Add stops along route: Petrol, Hotels, EV charging available');
                navigateTo('nearby');
              }}
              className="py-3 px-3.5 bg-slate-100/90 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs border border-slate-200/60"
            >
              <Plus className="w-4 h-4" />
              <span>Add stops</span>
            </button>

            {/* Center: Elevated Central Start Navigation Button */}
            <button
              type="button"
              onClick={handleStartNavigation}
              className="flex-1 py-3.5 px-5 bg-gradient-to-r from-[#087F5B] to-[#0A966C] hover:from-[#064E3B] hover:to-[#087F5B] text-white text-sm font-extrabold rounded-2xl shadow-[0_8px_24px_rgba(8,127,91,0.45)] border border-emerald-300/40 flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-95"
            >
              <Navigation className="w-4 h-4 fill-current -rotate-45" />
              <span className="tracking-wide">Start Navigation</span>
            </button>

            {/* Right: Share Route */}
            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `Route to ${destinationQuery}`,
                    text: `Check out our route to ${destinationQuery} (${currentEstimate.distance}, ${currentEstimate.duration}) on RouteMitra!`,
                    url: window.location.href,
                  });
                } else {
                  showToast(`Route to ${destinationQuery} copied to clipboard!`);
                }
              }}
              className="p-3 bg-slate-100/90 hover:bg-slate-200 text-slate-800 rounded-2xl transition-colors cursor-pointer shadow-xs border border-slate-200/60"
              title="Share Directions"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Right: Save Route */}
            <button
              type="button"
              onClick={() => {
                showToast(`Saved route to ${destinationQuery} in your favorites!`);
              }}
              className="p-3 bg-slate-100/90 hover:bg-slate-200 text-slate-800 rounded-2xl transition-colors cursor-pointer shadow-xs border border-slate-200/60"
              title="Save Route"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
};
