import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Home,
  Briefcase,
  Dumbbell,
  BedDouble,
  Navigation,
  Fuel,
  Zap,
  UtensilsCrossed,
  Hotel,
  Users,
  Copy,
  Check,
  Share2,
  MessageCircle,
  Smartphone,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
} from 'lucide-react';
import { useTrip } from '../context/TripContext';

const DESTINATION_SUGGESTIONS = [
  { name: 'Gachibowli, Hyderabad', desc: 'Financial District & IT Corridor', distance: '274 km' },
  { name: 'Bhavani Island, Vijayawada', desc: 'Krishna River Tourism Hub', distance: '12.6 km' },
  { name: 'Mangalagiri Temple & Hilltop', desc: 'NH16 Scenic Elevation', distance: '22.4 km' },
  { name: 'Hitech City & Cyber Towers', desc: 'Madhapur Tech Zone', distance: '280 km' },
  { name: 'Benz Circle Hub, Vijayawada', desc: 'City Center & Ring Road', distance: '3.2 km' },
  { name: 'Rushikonda Beach, Vizag', desc: 'East Coast Marine Drive', distance: '350 km' },
];

export const StartTripScreen: React.FC = () => {
  const {
    isPlannedTrip,
    startTripWithDetails,
    goBack,
    user,
    showToast,
    savedPlaces,
  } = useTrip();

  // Step 1: Member Count
  const [selectedPeople, setSelectedPeople] = useState<number>(3);

  // Step 2: Destination & Shortcuts (Home, Office, Gym, Room)
  const [destination, setDestination] = useState<string>('Gachibowli, Hyderabad');
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [selectedShortcut, setSelectedShortcut] = useState<string | null>(null);

  // Step 3: Trip ID & Sharing
  const [generatedTripId] = useState<string>(() => {
    return `RM-${Math.floor(100000 + Math.random() * 900000)}`;
  });
  const [copied, setCopied] = useState<boolean>(false);

  // Step 4: Optional Route Stops
  const [showFuelStations, setShowFuelStations] = useState<boolean>(true);
  const [showEvCharging, setShowEvCharging] = useState<boolean>(false);
  const [showRestaurants, setShowRestaurants] = useState<boolean>(true);
  const [showHotels, setShowHotels] = useState<boolean>(false);

  // Optional Planned Trip date/time
  const [tripDate, setTripDate] = useState<string>('Today');
  const [tripTime, setTripTime] = useState<string>('06:00 AM');

  // Loading state
  const [isStarting, setIsStarting] = useState<boolean>(false);

  // Shortcuts config matching Requirement 2: Home, Office, Gym, Room
  const shortcuts = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-4 h-4 text-emerald-600" />,
      address: savedPlaces.find((p) => p.id === 'home')?.address || 'Home Residence',
    },
    {
      id: 'office',
      label: 'Office',
      icon: <Briefcase className="w-4 h-4 text-blue-600" />,
      address: savedPlaces.find((p) => p.id === 'office')?.address || 'Cyber Gateway, Tech City',
    },
    {
      id: 'gym',
      label: 'Gym',
      icon: <Dumbbell className="w-4 h-4 text-amber-600" />,
      address: savedPlaces.find((p) => p.id === 'gym')?.address || 'Gold Fitness Arena, Ring Rd',
    },
    {
      id: 'room',
      label: 'Room',
      icon: <BedDouble className="w-4 h-4 text-purple-600" />,
      address: savedPlaces.find((p) => p.id === 'hostel')?.address || 'Mitra Residency, Hostel Block B',
    },
  ];

  const handleSelectShortcut = (shortcut: typeof shortcuts[0]) => {
    setSelectedShortcut(shortcut.id);
    setDestination(shortcut.address);
    setShowSuggestions(false);
    showToast(`Selected shortcut: ${shortcut.label}`);
  };

  const handleCopyTripId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(generatedTripId);
    }
    setCopied(true);
    showToast(`Copied Trip ID: ${generatedTripId}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🚗 Join my RouteMitra convoy to ${destination}!\nTrip ID: ${generatedTripId}\nOpen RouteMitra and enter this Trip ID in "Join Trip" to sync navigation and locations in real time.`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareSMS = () => {
    const body = encodeURIComponent(
      `Join my RouteMitra convoy to ${destination}! Trip ID: ${generatedTripId}`
    );
    window.location.href = `sms:?body=${body}`;
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my RouteMitra Convoy',
          text: `Join my RouteMitra convoy to ${destination}! Use Trip ID: ${generatedTripId}`,
          url: window.location.origin,
        });
      } catch {
        handleCopyTripId();
      }
    } else {
      handleCopyTripId();
    }
  };

  // Step 5: Start Live Navigation
  const handleStartNavigation = async () => {
    const finalDest = destination.trim() || 'Gachibowli, Hyderabad';
    setIsStarting(true);
    showToast(`Starting ${isPlannedTrip ? 'Planned' : 'Quick'} Trip to ${finalDest}...`);
    await startTripWithDetails(finalDest, selectedPeople, isPlannedTrip);
    setIsStarting(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col pb-12 select-none">
      {/* ── Top Header ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => goBack()}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {isPlannedTrip ? 'Planned Trip Setup' : 'Quick Trip Setup'}
            </h1>
            <p className="text-xs text-slate-500">
              {isPlannedTrip ? 'Long journey convoy planning' : 'Going out with friends or family?'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E2F6EB] text-[#087F5B] text-xs font-bold border border-[#C5ECD6]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isPlannedTrip ? 'Planned' : 'Quick'}</span>
        </div>
      </header>

      {/* ── 5-Step Workflow Form Container ── */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* ── Step 1: Select the number of members ── */}
        <section className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E2F6EB] text-[#087F5B] flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">How many people?</h3>
                <p className="text-xs text-slate-500">Select number of participants</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#087F5B] bg-[#E2F6EB] px-2.5 py-0.5 rounded-full">
              {selectedPeople} {selectedPeople === 1 ? 'Person' : 'Members'}
            </span>
          </div>

          <div className="grid grid-cols-6 gap-2 pt-1">
            {[1, 2, 3, 4, 5, 6].map((count) => {
              const label = count === 6 ? '6+' : `${count}`;
              const selected = selectedPeople === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => setSelectedPeople(count)}
                  className={`py-3 rounded-2xl font-bold text-sm transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                    selected
                      ? 'bg-[#087F5B] text-white shadow-md shadow-[#087F5B]/30 scale-[1.03]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{label}</span>
                  <Users className="w-3 h-3 opacity-60" />
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Step 2: Select the Destination ── */}
        <section className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 space-y-3 relative">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold text-xs">
              2
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Where are we going?</h3>
              <p className="text-xs text-slate-500">Enter place name, address or landmark</p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
            <input
              type="text"
              placeholder="Search destination..."
              value={destination}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setDestination(e.target.value);
                setShowSuggestions(true);
              }}
              className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#087F5B] focus:ring-2 focus:ring-[#087F5B]/10 transition-all"
            />
            {destination && (
              <button
                type="button"
                onClick={() => setDestination('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Live Location Suggestions Dropdown */}
          {showSuggestions && (
            <div className="border border-slate-200 rounded-2xl bg-white shadow-xl overflow-hidden divide-y divide-slate-100 z-20">
              {DESTINATION_SUGGESTIONS.map((item) => (
                <div
                  key={item.name}
                  onClick={() => {
                    setDestination(item.name);
                    setShowSuggestions(false);
                    setSelectedShortcut(null);
                  }}
                  className="p-3 hover:bg-[#F0FDF4] cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#087F5B] flex items-center justify-center shrink-0">
                      <Navigation className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.name}</p>
                      <p className="text-[10px] text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {item.distance}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Shortcut options with small icons: Home, Office, Gym, Room (Requirement 2) */}
          <div>
            <p className="text-xs font-bold text-slate-600 mb-2">Shortcut Locations</p>
            <div className="grid grid-cols-4 gap-2">
              {shortcuts.map((sc) => {
                const isSelected = selectedShortcut === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => handleSelectShortcut(sc)}
                    className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#E2F6EB] border-[#087F5B] text-[#087F5B] shadow-xs scale-[1.02]'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="p-1 rounded-lg bg-white shadow-2xs">{sc.icon}</div>
                    <span className="text-xs font-bold">{sc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Step 3: Generate a Trip ID & Invite Participants ── */}
        <section className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Trip ID Generated</h3>
                <p className="text-xs text-slate-500">Share with members to join the convoy</p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#7C3AED] bg-[#EDE9FE] px-2.5 py-1 rounded-full">
              <span>{generatedTripId}</span>
            </span>
          </div>

          {/* Trip ID Highlight Box with 1-Click Copy */}
          <div className="bg-[#FAF5FF] border border-[#E9D5FF] rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-purple-700">Unique Convoy Code</p>
              <p className="text-lg font-black font-mono text-purple-950 tracking-wider mt-0.5">
                {generatedTripId}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyTripId}
              className="px-3 py-2 bg-white hover:bg-purple-50 text-[#7C3AED] border border-[#D8B4FE] rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
          </div>

          {/* Share Buttons Row: WhatsApp, SMS, Native Share */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="py-2.5 px-3 rounded-xl bg-[#DCFCE7] hover:bg-[#BBF7D0] text-[#15803D] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleShareSMS}
              className="py-2.5 px-3 rounded-xl bg-[#E0E7FF] hover:bg-[#C7D2FE] text-[#4338CA] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>SMS</span>
            </button>

            <button
              type="button"
              onClick={handleNativeShare}
              className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>

          {/* Privacy Notice (Requirement 2 & 5) */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Real-Time Location Privacy Guard
            </p>
            <p>
              Only members who actively join using this Trip ID will see your route. As soon as the trip ends, all participant locations are immediately hidden.
            </p>
          </div>
        </section>

        {/* ── Step 4: Optional Route Stops ── */}
        <section className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center font-bold text-xs">
              4
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Optional Route Stops</h3>
              <p className="text-xs text-slate-500">Highlight amenities along the highway</p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            {/* Fuel Stations */}
            <label className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Fuel className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Show fuel stations</p>
                  <p className="text-[10px] text-slate-500">Petrol, diesel & highway pumps</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showFuelStations}
                onChange={(e) => setShowFuelStations(e.target.checked)}
                className="accent-[#087F5B] w-5 h-5 cursor-pointer"
              />
            </label>

            {/* EV Charging */}
            <label className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Show EV charging</p>
                  <p className="text-[10px] text-slate-500">Fast highway chargers & stations</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showEvCharging}
                onChange={(e) => setShowEvCharging(e.target.checked)}
                className="accent-[#087F5B] w-5 h-5 cursor-pointer"
              />
            </label>

            {/* Restaurants */}
            <label className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Show restaurants & food</p>
                  <p className="text-[10px] text-slate-500">Dhabas and cafes along route</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showRestaurants}
                onChange={(e) => setShowRestaurants(e.target.checked)}
                className="accent-[#087F5B] w-5 h-5 cursor-pointer"
              />
            </label>

            {/* Hotels */}
            <label className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Hotel className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Show hotels</p>
                  <p className="text-[10px] text-slate-500">Highway lodges and rest areas</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={showHotels}
                onChange={(e) => setShowHotels(e.target.checked)}
                className="accent-[#087F5B] w-5 h-5 cursor-pointer"
              />
            </label>
          </div>
        </section>

        {/* ── Planned Trip Extra Options (If planned trip) ── */}
        {isPlannedTrip && (
          <section className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Schedule Date & Departure Time</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Departure Date</label>
                <input
                  type="text"
                  value={tripDate}
                  onChange={(e) => setTripDate(e.target.value)}
                  placeholder="e.g. Tomorrow"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Departure Time</label>
                <input
                  type="text"
                  value={tripTime}
                  onChange={(e) => setTripTime(e.target.value)}
                  placeholder="e.g. 06:30 AM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                />
              </div>
            </div>
          </section>
        )}

        {/* ── Step 5: Start Live Navigation ── */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleStartNavigation}
            disabled={isStarting}
            className="w-full py-4 px-6 bg-[#087F5B] hover:bg-[#064E3B] text-white font-extrabold text-base rounded-2xl shadow-xl shadow-[#087F5B]/30 flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
          >
            {isStarting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                <span>Start Live Navigation</span>
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};
