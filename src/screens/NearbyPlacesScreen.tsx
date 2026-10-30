import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Fuel,
  Zap,
  UtensilsCrossed,
  LayoutGrid,
  Phone,
  Navigation,
  Star,
  MapPin,
  Clock,
  Compass,
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { PlaceCategory, NearbyPlace } from '../types';

export const NearbyPlacesScreen: React.FC = () => {
  const { places, goBack, showToast, addPlaceToTrip, navigateTo } = useTrip();

  const [selectedFilter, setSelectedFilter] = useState<PlaceCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('p1');

  const filteredPlaces = places.filter((p) => {
    const matchesCategory = selectedFilter === 'all' || p.category === selectedFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeFeaturedPlace =
    places.find((p) => p.id === selectedPlaceId) || filteredPlaces[0] || places[0];

  return (
    <div className="relative min-h-screen bg-[#0F1923] text-white flex flex-col overflow-hidden">
      {/* ── Top Bar with Back Button & Search ── */}
      <header className="relative z-20 bg-[#0F1923]/90 backdrop-blur-md px-4 pt-4 pb-3 border-b border-[#233547] space-y-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => goBack()}
            className="p-2.5 rounded-xl bg-[#1A2633] border border-[#2D3D4F] text-white/80 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search along route..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1A2633] border border-[#2D3D4F] rounded-2xl text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#34D399] transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={() => navigateTo('google-maps')}
            className="p-2.5 rounded-xl bg-[#087F5B] text-white border border-[#34D399]/40 hover:bg-[#064E3B] transition-colors cursor-pointer shrink-0 text-xs font-bold flex items-center gap-1"
            title="Open Real-time Google Maps"
          >
            <Compass className="w-4 h-4 text-[#34D399]" />
            <span className="hidden sm:inline">Map</span>
          </button>
        </div>

        {/* Filter Pills (Matches Image 1 Screen 9: All, Petrol, EV, Food) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-[#087F5B] text-white border border-[#34D399] shadow-md shadow-[#087F5B]/30'
                : 'bg-[#1A2633] text-white/70 border border-[#2D3D4F] hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            All
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('petrol')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedFilter === 'petrol'
                ? 'bg-[#2563EB] text-white border border-[#60A5FA] shadow-md shadow-blue-500/30'
                : 'bg-[#1A2633] text-white/70 border border-[#2D3D4F] hover:text-white'
            }`}
          >
            <Fuel className="w-3.5 h-3.5 text-blue-300" />
            Petrol
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('ev')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedFilter === 'ev'
                ? 'bg-[#059669] text-white border border-[#34D399] shadow-md shadow-emerald-500/30'
                : 'bg-[#1A2633] text-white/70 border border-[#2D3D4F] hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-300" />
            EV
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('food')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedFilter === 'food'
                ? 'bg-[#E11D48] text-white border border-[#FB7185] shadow-md shadow-rose-500/30'
                : 'bg-[#1A2633] text-white/70 border border-[#2D3D4F] hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-rose-300" />
            Food
          </button>
        </div>
      </header>

      {/* ── Interactive Route Canvas Section (Matches Image 1 Screen 9 Top Half) ── */}
      <div className="relative w-full h-64 sm:h-72 bg-[#10202F] overflow-hidden border-b border-[#233547]">
        {/* Styled Vector Map Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#1A384D_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />

        {/* Winding Highway SVG with Glowing Route */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="50%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Secondary road network */}
          <path d="M 0 100 Q 150 140 280 80 T 500 120" stroke="#1E384D" strokeWidth="3" fill="none" />
          <path d="M 120 0 Q 160 140 180 300" stroke="#1E384D" strokeWidth="2.5" fill="none" />
          <path d="M 280 0 Q 260 180 340 300" stroke="#1E384D" strokeWidth="2" fill="none" />

          {/* Highway Route (NH16) */}
          <path
            d="M 140 280 C 140 200, 220 180, 220 120 C 220 70, 300 60, 360 20"
            stroke="rgba(56, 189, 248, 0.25)"
            strokeWidth="16"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 140 280 C 140 200, 220 180, 220 120 C 220 70, 300 60, 360 20"
            stroke="url(#routeGradient)"
            strokeWidth="6"
            fill="none"
            filter="url(#glow)"
            strokeLinecap="round"
          />
          <path
            d="M 140 280 C 140 200, 220 180, 220 120 C 220 70, 300 60, 360 20"
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="6 6"
            fill="none"
          />
        </svg>

        {/* Map Pins along route */}
        {/* Petrol Station Pin */}
        <button
          type="button"
          onClick={() => setSelectedPlaceId('p1')}
          className={`absolute top-[48%] left-[54%] -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 cursor-pointer ${
            activeFeaturedPlace.id === 'p1' ? 'scale-125 z-30' : 'scale-100 z-10 opacity-90'
          }`}
        >
          <div className="relative flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
              <Fuel className="w-4 h-4" />
            </div>
            <div className="w-2 h-2 bg-blue-600 rotate-45 -mt-1 shadow" />
          </div>
        </button>

        {/* Food Pin */}
        <button
          type="button"
          onClick={() => setSelectedPlaceId('p3')}
          className={`absolute top-[68%] left-[30%] -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 cursor-pointer ${
            activeFeaturedPlace.id === 'p3' ? 'scale-125 z-30' : 'scale-100 z-10 opacity-90'
          }`}
        >
          <div className="relative flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center text-white">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div className="w-2 h-2 bg-amber-500 rotate-45 -mt-1 shadow" />
          </div>
        </button>

        {/* EV Pin */}
        <button
          type="button"
          onClick={() => setSelectedPlaceId('p2')}
          className={`absolute top-[28%] left-[62%] -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 cursor-pointer ${
            activeFeaturedPlace.id === 'p2' ? 'scale-125 z-30' : 'scale-100 z-10 opacity-90'
          }`}
        >
          <div className="relative flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center text-white">
              <Zap className="w-4 h-4" />
            </div>
            <div className="w-2 h-2 bg-emerald-500 rotate-45 -mt-1 shadow" />
          </div>
        </button>

        {/* Hotel/Attraction Pin */}
        <button
          type="button"
          onClick={() => setSelectedPlaceId('p4')}
          className={`absolute top-[20%] left-[38%] -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 cursor-pointer ${
            activeFeaturedPlace.id === 'p4' ? 'scale-125 z-30' : 'scale-100 z-10 opacity-90'
          }`}
        >
          <div className="relative flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-purple-600 border-2 border-white shadow-lg flex items-center justify-center text-white">
              <MapPin className="w-3.5 h-3.5" />
            </div>
          </div>
        </button>

        {/* Floating Zoom Controls */}
        <div className="absolute right-3 bottom-3 z-20 flex flex-col gap-1.5 bg-[#1A2633]/90 backdrop-blur-md p-1 rounded-xl border border-[#2D3D4F] text-xs">
          <button
            type="button"
            onClick={() => showToast('Zoomed in')}
            className="w-7 h-7 flex items-center justify-center font-bold text-white hover:bg-[#243447] rounded-lg cursor-pointer"
          >
            +
          </button>
          <div className="h-[1px] bg-white/10" />
          <button
            type="button"
            onClick={() => showToast('Zoomed out')}
            className="w-7 h-7 flex items-center justify-center font-bold text-white hover:bg-[#243447] rounded-lg cursor-pointer"
          >
            −
          </button>
        </div>

        {/* Location Target Button */}
        <button
          type="button"
          onClick={() => showToast('Centered GPS location along NH16')}
          className="absolute left-3 bottom-3 z-20 p-2 rounded-xl bg-[#1A2633]/90 backdrop-blur-md border border-[#2D3D4F] text-[#34D399] shadow-lg cursor-pointer hover:bg-[#243447]"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* ── Featured Place Bottom Sheet Card (Matches Image 1 Screen 9 Bottom Half) ── */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 space-y-4 overflow-y-auto">
        {/* Primary Featured Card */}
        {activeFeaturedPlace && (
          <div className="bg-[#1A2633] rounded-3xl p-4 border border-[#2D3D4F] shadow-2xl space-y-4">
            <div className="flex gap-3.5">
              {/* Photo */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 relative bg-[#243447]">
                <img
                  src={
                    activeFeaturedPlace.image ||
                    'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={activeFeaturedPlace.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white">
                  {activeFeaturedPlace.distance}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <h2 className="text-base font-black text-white truncate">
                    {activeFeaturedPlace.name}
                  </h2>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-400/10 text-amber-400 text-xs font-bold shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {activeFeaturedPlace.rating}
                  </div>
                </div>

                <p className="text-xs text-emerald-400 font-bold mt-0.5">
                  {activeFeaturedPlace.distance} ahead
                </p>

                <p className="text-xs text-white/60 truncate mt-1">
                  {activeFeaturedPlace.address}
                </p>

                <div className="flex items-center gap-2 mt-2 text-[11px] text-white/50">
                  <Clock className="w-3 h-3 text-[#34D399]" />
                  <span className="text-[#34D399] font-medium">
                    {activeFeaturedPlace.openHours || 'Open 24 hours'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Directions (5 min) & Call */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  addPlaceToTrip(activeFeaturedPlace);
                  showToast(`Added stop: ${activeFeaturedPlace.name}`);
                }}
                className="py-3 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Navigation className="w-4 h-4 fill-white" />
                Directions (5 min)
              </button>

              <button
                type="button"
                onClick={() => {
                  showToast(`Calling ${activeFeaturedPlace.name} (${activeFeaturedPlace.phone || '+91 8924 220000'})`);
                }}
                className="py-3 px-4 bg-[#243447] hover:bg-[#2D3D4F] border border-[#3D5268] text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#34D399]" />
                Call
              </button>
            </div>
          </div>
        )}

        {/* Carousel / List of all other nearby places */}
        <div>
          <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider mb-2.5 px-1">
            More Places on Highway
          </h3>

          <div className="space-y-2.5">
            {filteredPlaces.map((place) => {
              const isSelected = place.id === activeFeaturedPlace.id;
              return (
                <div
                  key={place.id}
                  onClick={() => setSelectedPlaceId(place.id)}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-[#1E2E3E] border-[#34D399]/60 shadow-lg'
                      : 'bg-[#1A2633] border-[#2D3D4F] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={place.image || 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=150&q=80'}
                      alt={place.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-white truncate">{place.name}</p>
                      <p className="text-[11px] text-white/50 truncate">{place.address}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                        <span className="text-emerald-400 font-semibold">{place.distance}</span>
                        <span className="text-white/20">•</span>
                        <span className="text-amber-400 font-semibold">★ {place.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addPlaceToTrip(place);
                        showToast(`Stop added: ${place.name}`);
                      }}
                      className="p-2 rounded-xl bg-[#243447] text-[#34D399] hover:bg-[#2D3D4F] transition-colors"
                      title="Add to trip"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
