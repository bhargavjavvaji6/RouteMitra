import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Navigation,
  Plus,
  Search,
  Share2,
  Check,
  Copy,
  ChevronRight,
  Sparkles,
  Route,
  ArrowUpRight,
  Filter,
  Car,
  Home as HomeIcon,
  Compass,
  User as UserIcon,
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { TripItem } from '../types';

export const TripsScreen: React.FC = () => {
  const {
    trips,
    activeTrip,
    activeSharedTrip,
    isTripActive,
    navigateTo,
    goBack,
    showToast,
    copyTripId,
    currentTripId,
    startTripWithDetails,
  } = useTrip();

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    showToast(`Copied Trip ID: ${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartAgain = (trip: TripItem) => {
    startTripWithDetails(trip.destination, trip.membersCount || 3, false);
    showToast(`Restarting convoy to ${trip.destination}`);
    navigateTo('live-navigation');
  };

  const filteredTrips = trips.filter((t) => {
    if (filter === 'active' && t.status !== 'active') return false;
    if (filter === 'completed' && t.status !== 'completed') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.destination.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-800 flex flex-col pb-28 relative select-none">
      {/* ── Top App Bar ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-slate-200/80 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => goBack()}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">My Trips</h1>
            <p className="text-xs text-slate-500">Convoy journeys & route history</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigateTo('start-trip')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#087F5B] hover:bg-[#064E3B] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Trip</span>
        </button>
      </header>

      {/* ── Main Content Area (Layout cleanly adjusted without profile account card) ── */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 pt-4 space-y-4">
        {/* Active Trip Banner if currently on a trip */}
        {isTripActive && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-[#E2F6EB] via-[#ECFDF5] to-[#E0F2FE] border border-[#34D399]/50 shadow-md">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                  Active Convoy Journey
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                Live Now
              </span>
            </div>

            <div className="mt-2.5">
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                {activeTrip?.destination || activeSharedTrip?.destination || 'Convoy Destination'}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Trip ID: <span className="font-mono font-bold text-slate-800">{currentTripId}</span>
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1 font-semibold">
                  <Route className="w-3.5 h-3.5 text-emerald-600" />
                  {activeTrip?.distance || '368 km'}
                </span>
                <span className="flex items-center gap-1 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  {activeTrip?.duration || '5h 12m'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigateTo('live-navigation')}
                className="px-3.5 py-1.5 rounded-xl bg-[#087F5B] hover:bg-[#064E3B] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 fill-current" />
                <span>Resume Navigation</span>
              </button>
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by destination or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#087F5B] transition-colors shadow-2xs"
            />
          </div>

          <div className="flex bg-slate-200/80 p-0.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === 'completed' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Past
            </button>
          </div>
        </div>

        {/* Trip Count & Overview */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Convoy History ({filteredTrips.length})
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Auto-synced</span>
        </div>

        {/* Trips List */}
        <div className="space-y-3">
          {filteredTrips.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No trips found</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {searchQuery ? 'Try matching a different keyword' : 'Plan your first convoy trip to see it listed here.'}
              </p>
              <button
                type="button"
                onClick={() => navigateTo('start-trip')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#087F5B] text-white text-xs font-bold shadow-xs hover:bg-[#064E3B] transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Trip</span>
              </button>
            </div>
          ) : (
            filteredTrips.map((trip) => {
              const isActive = trip.status === 'active';
              return (
                <div
                  key={trip.id}
                  className="bg-white rounded-3xl p-4 shadow-xs border border-slate-200/90 hover:border-slate-300 transition-all space-y-3 group"
                >
                  {/* Top line: Destination and Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#087F5B] transition-colors">
                          {trip.destination}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">{trip.title}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        isActive
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isActive ? 'Ongoing' : 'Completed'}
                    </span>
                  </div>

                  {/* Trip Stats: Date, Distance, Duration, Members */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">Distance</span>
                      <span className="font-bold text-slate-800">{trip.distance}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">Duration</span>
                      <span className="font-bold text-slate-800">{trip.duration}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 font-semibold uppercase">Convoy</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-500" />
                        {trip.membersCount || 3} members
                      </span>
                    </div>
                  </div>

                  {/* Footer Action buttons: Trip ID + Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={(e) => handleCopy(trip.id, e)}
                      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-mono transition-colors cursor-pointer"
                      title="Copy Trip ID"
                    >
                      <span>{trip.id}</span>
                      {copiedId === trip.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          showToast(`Viewing route for ${trip.destination}`);
                          navigateTo('google-maps');
                        }}
                        className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Map View
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartAgain(trip)}
                        className="py-1.5 px-3 rounded-xl bg-[#087F5B] hover:bg-[#064E3B] text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                      >
                        <span>Start</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* ── Standard Footer Navigation Bar with "+" (Add) in Center ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-2xl border-t border-white/60 shadow-[0_-12px_45px_rgba(0,0,0,0.12)] px-4 py-2 pointer-events-auto">
        <div className="max-w-md mx-auto flex items-center justify-between relative">
          {/* Home Tab */}
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="flex flex-col items-center gap-1 py-1 px-3.5 text-slate-400 hover:text-slate-600 font-medium transition-colors cursor-pointer rounded-2xl"
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </button>

          {/* Map Tab */}
          <button
            type="button"
            onClick={() => navigateTo('google-maps')}
            className="flex flex-col items-center gap-1 py-1 px-3.5 text-slate-400 hover:text-slate-600 font-medium transition-colors cursor-pointer rounded-2xl"
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px]">Map</span>
          </button>

          {/* Centralized "+" (Add) Action Button */}
          <div className="relative -top-6 flex items-center justify-center">
            <button
              type="button"
              onClick={() => navigateTo('start-trip')}
              className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#087F5B] to-[#10B981] hover:from-[#064E3B] hover:to-[#087F5B] text-white flex items-center justify-center shadow-[0_12px_30px_rgba(8,127,91,0.5),0_4px_12px_rgba(0,0,0,0.15)] ring-4 ring-white/95 transition-all transform hover:scale-110 active:scale-95 cursor-pointer border border-emerald-300/40"
              title="Create New Trip"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
          </div>

          {/* Trips Tab (Active) */}
          <button
            type="button"
            className="flex flex-col items-center gap-1 py-1 px-3.5 text-[#087F5B] font-bold transition-colors cursor-pointer rounded-2xl"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px]">Trips</span>
          </button>

          {/* Profile Tab */}
          <button
            type="button"
            onClick={() => navigateTo('profile')}
            className="flex flex-col items-center gap-1 py-1 px-3.5 text-slate-400 hover:text-slate-600 font-medium transition-colors cursor-pointer rounded-2xl"
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px]">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
