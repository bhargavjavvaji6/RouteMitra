import React, { useState } from 'react';
import {
  Send,
  Calendar,
  Map as MapIcon,
  Users,
  MapPin,
  Music,
  Heart,
  Clock,
  Settings,
  Car,
  GitFork,
  Bell,
  Search,
  Home as HomeIcon,
  User as UserIcon,
  Plus,
  Copy,
  Check,
  Radio,
  Sparkles,
  ArrowRight,
  LogOut,
  Navigation,
  X,
  Compass,
} from 'lucide-react';
import { useTrip } from '../context/TripContext';

export const HomeScreen: React.FC = () => {
  const {
    user,
    signOut,
    navigateTo,
    unreadNotificationsCount,
    showToast,
    activeTrip,
    activeSharedTrip,
    currentTripId,
    joinTrip,
    copyTripId,
    isTripActive,
    liveLocationSharingActive,
    updateSharedDestination,
    endSharedTrip,
  } = useTrip();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Join Trip Modal State
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [joinTripInput, setJoinTripInput] = useState<string>('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState<boolean>(false);

  // Change Destination Modal State
  const [showChangeDestModal, setShowChangeDestModal] = useState<boolean>(false);
  const [newDestInput, setNewDestInput] = useState<string>('');

  // Quick Action Sheet (+) State
  const [showQuickSheet, setShowQuickSheet] = useState<boolean>(false);

  // Tab state for bottom dock
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'trips' | 'profile'>('home');

  const displayName = user?.name ? user.name.trim().split(' ')[0] : 'Rohith';
  const displayId = activeSharedTrip?.id || currentTripId || user?.convoyId || 'RM482913';

  const handleCopyId = () => {
    copyTripId();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      showToast(`Searching for "${searchQuery}" along route...`);
      navigateTo('nearby');
    }
  };

  const handleJoinTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    if (!joinTripInput.trim()) {
      setJoinError('Please enter a valid Trip ID (e.g. RM-482913)');
      return;
    }

    setIsJoining(true);
    const result = await joinTrip(joinTripInput.trim());
    setIsJoining(false);

    if (result.success) {
      setShowJoinModal(false);
      setJoinTripInput('');
      navigateTo('live-navigation');
    } else {
      setJoinError(result.error || 'Failed to join trip. Please check the ID.');
    }
  };

  const handleChangeDestinationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDestInput.trim()) return;

    await updateSharedDestination(newDestInput.trim());
    setShowChangeDestModal(false);
    setNewDestInput('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col pb-28 relative select-none">
      {/* ── Top Header (Matches Image 1: image_fa5fea77.png) ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between shadow-xs">
        {/* User Info with Avatar - Clickable to open Profile */}
        <div
          onClick={() => navigateTo('profile')}
          className="flex items-center gap-3 cursor-pointer group"
          title="Open Profile"
        >
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#087F5B] shadow-sm shrink-0 bg-slate-100 group-hover:scale-105 transition-transform">
            <img
              src={
                user?.avatar ||
                '/assets/aistudio/image_3d1745ac.png'
              }
              alt={displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  '/assets/bhargav_avatar_clean.jpg';
              }}
            />
          </div>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight flex items-center gap-1.5">
              <span>Hi, {displayName}</span>
              <span className="text-amber-500">👋</span>
            </h1>

            {/* Trip ID with Copy Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyId();
              }}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors mt-0.5 font-medium cursor-pointer"
              title="Click to copy Trip ID for sharing with friends"
            >
              <span>ID: {displayId}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {/* Right Header Actions: Favorites Icon + Notification Bell (Requirement 1 & Image fa5fea77.png) */}
        <div className="flex items-center gap-2">
          {/* Favorites Button (Icon ONLY - no text label per user requirement) */}
          <button
            type="button"
            onClick={() => {
              showToast('Favorites: Quick access to your favorite convoy routes and stops');
              navigateTo('profile');
            }}
            className="p-2.5 rounded-full bg-slate-100 hover:bg-rose-50 text-rose-500 hover:text-rose-600 transition-colors cursor-pointer shadow-xs"
            title="Favorites"
          >
            <Heart className="w-5 h-5 fill-rose-500" />
          </button>

          {/* Notification Bell with Badge */}
          <button
            type="button"
            onClick={() => navigateTo('notifications')}
            className="relative p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700 cursor-pointer shadow-xs"
            title="Group Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#E11D48] text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Active Shared Trip Real-Time Banner (If active) ── */}
      {isTripActive && (
        <div className="mx-4 sm:mx-6 mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-[#E2F6EB] to-[#E0F2FE] border border-[#34D399]/40 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                Active Convoy: {activeTrip?.destination || activeSharedTrip?.destination}
              </p>
              <p className="text-[11px] text-slate-600">
                Trip ID: <span className="font-mono font-bold text-emerald-700">{displayId}</span>
                {liveLocationSharingActive ? ' • Live GPS Active' : ' • Live GPS Off'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowChangeDestModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-white text-emerald-800 text-xs font-bold shadow-xs hover:bg-emerald-50 transition-colors cursor-pointer"
              title="Update destination for all devices"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => navigateTo('live-navigation')}
              className="px-3 py-1.5 rounded-xl bg-[#087F5B] text-white text-xs font-bold shadow-xs hover:bg-[#064E3B] transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* ── Main Content Area ── */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 pt-4 space-y-5">
        {/* ── Search Bar with Circular Green Search Button (Matches Image 1) ── */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search location, place, or member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-5 pr-14 py-3.5 bg-white border border-slate-200/80 rounded-full text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:border-[#087F5B] focus:ring-2 focus:ring-[#087F5B]/10 transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 w-10 h-10 rounded-full bg-[#087F5B] hover:bg-[#064E3B] text-white flex items-center justify-center shadow-md transition-colors cursor-pointer shrink-0"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* ── 4 Primary Grid Cards (2 columns x 2 rows) + Full Width Settings (Requirements 1, 2, 3) ── */}
        <section className="grid grid-cols-2 gap-3 sm:gap-3.5">
          {/* Card 1: Start Trip (Mint Green) */}
          <button
            type="button"
            onClick={() => navigateTo('start-trip', { isPlanned: false })}
            className="p-4 rounded-3xl bg-[#E2F6EB] hover:bg-[#D3F2E0] transition-all duration-200 flex flex-col items-center justify-center text-center gap-2.5 shadow-xs border border-[#C5ECD6] cursor-pointer active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/60 flex items-center justify-center text-[#087F5B] shadow-xs">
              <Send className="w-5 h-5 -rotate-45 ml-0.5" />
            </div>
            <span className="text-sm font-bold text-slate-900">Start Trip</span>
          </button>

          {/* Card 2: Live Map (Soft Light Blue) */}
          <button
            type="button"
            onClick={() => navigateTo('google-maps')}
            className="p-4 rounded-3xl bg-[#E0F2FE] hover:bg-[#BAE6FD] transition-all duration-200 flex flex-col items-center justify-center text-center gap-2.5 shadow-xs border border-[#BAE6FD] cursor-pointer active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/60 flex items-center justify-center text-[#0284C7] shadow-xs">
              <MapIcon className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-900">Live Map</span>
          </button>

          {/* Card 3: Nearby Places (Soft Pink) */}
          <button
            type="button"
            onClick={() => navigateTo('nearby')}
            className="p-4 rounded-3xl bg-[#FCE7F3] hover:bg-[#FBCFE8] transition-all duration-200 flex flex-col items-center justify-center text-center gap-2.5 shadow-xs border border-[#FBCFE8] cursor-pointer active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/60 flex items-center justify-center text-[#DB2777] shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-900">Nearby Places</span>
          </button>

          {/* Card 4: Music (Soft Coral / Peach) */}
          <button
            type="button"
            onClick={() => navigateTo('music')}
            className="p-4 rounded-3xl bg-[#FFE4E6] hover:bg-[#FECDD3] transition-all duration-200 flex flex-col items-center justify-center text-center gap-2.5 shadow-xs border border-[#FECDD3] cursor-pointer active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-2xl bg-white/60 flex items-center justify-center text-[#E11D48] shadow-xs">
              <Music className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-slate-900">Music</span>
          </button>

        </section>

        {/* ── Explore More Banner (Matches Image 2: image_da05232f.png) ── */}
        <section className="relative rounded-3xl overflow-hidden shadow-md border border-[#23384D] bg-[#0C1A29]">
          <div className="relative h-32 sm:h-36 w-full flex items-center justify-between px-5 sm:px-6">
            {/* Background Image / Mountains art */}
            <img
              src="/assets/aistudio/image_da05232f.png"
              alt="Explore More"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0C1A29]/90 via-[#0C1A29]/60 to-transparent" />

            {/* Banner Text */}
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F8E2C2] tracking-wide font-serif italic drop-shadow">
                Explore More
              </h2>
              <p className="text-[10px] sm:text-xs font-bold tracking-widest text-amber-200/90 uppercase mt-1">
                TRIPS • PEOPLE • PLACES
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigateTo('google-maps')}
              className="relative z-10 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white text-xs font-bold border border-white/30 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>

        {/* ── Quick Start Section (Matches Image 1 + Feature Join Trip) ── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Quick Start</h2>
            <button
              type="button"
              onClick={() => setShowJoinModal(true)}
              className="text-xs font-bold text-[#087F5B] hover:text-[#064E3B] flex items-center gap-1 cursor-pointer"
            >
              <span>Join with ID</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Quick Trip (Short trip) */}
            <button
              type="button"
              onClick={() => navigateTo('start-trip', { isPlanned: false })}
              className="p-4 rounded-3xl bg-[#E8F8F0] hover:bg-[#D5F5E3] border border-[#C2F0D8] transition-all flex flex-col items-start gap-2 shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <div className="p-2 rounded-xl bg-white/80 text-[#087F5B] shadow-xs">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Quick Trip</p>
                <p className="text-xs text-slate-500 mt-0.5">Short trip</p>
              </div>
            </button>

            {/* Planned Trip (Long journey) */}
            <button
              type="button"
              onClick={() => navigateTo('start-trip', { isPlanned: true })}
              className="p-4 rounded-3xl bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] transition-all flex flex-col items-start gap-2 shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <div className="p-2 rounded-xl bg-white/80 text-[#2563EB] shadow-xs">
                <GitFork className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Planned Trip</p>
                <p className="text-xs text-slate-500 mt-0.5">(Long journey)</p>
              </div>
            </button>
          </div>

          {/* Join Trip Banner Card (Feature Requirement 2: Person B on Device Y) */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-[#F3E8FF] to-[#EDE9FE] border border-[#D8B4FE] shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white text-[#7C3AED] flex items-center justify-center shadow-xs shrink-0 font-bold">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Join a Shared Trip</p>
                <p className="text-xs text-slate-600">Enter a Trip ID to sync convoy in real time</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowJoinModal(true)}
              className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-2xl shadow-sm transition-all cursor-pointer shrink-0"
            >
              Join Trip
            </button>
          </div>
        </section>
      </main>

      {/* ── Join Trip Modal (Feature 2: Person B enters Trip ID) ── */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setShowJoinModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center shrink-0">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Join Trip</h3>
                <p className="text-xs text-slate-500">Real-time sync with Person A</p>
              </div>
            </div>

            <form onSubmit={handleJoinTripSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Enter Trip ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. RM-482913"
                  value={joinTripInput}
                  onChange={(e) => {
                    setJoinTripInput(e.target.value.toUpperCase());
                    setJoinError(null);
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 uppercase"
                  autoFocus
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Try default demo trip: <span className="font-mono font-bold text-[#7C3AED]">RM-482913</span>
                </p>
              </div>

              {joinError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {joinError}
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-2xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isJoining}
                  className="flex-1 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white text-sm font-bold rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isJoining ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Start</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Change Destination Modal (Feature 3: Synchronize Destination across Device X & Y) ── */}
      {showChangeDestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setShowChangeDestModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">Update Destination</h3>
            <p className="text-xs text-slate-500 mb-4">
              All connected devices (Device X, Device Y, Device Z) will update automatically in real time.
            </p>

            <form onSubmit={handleChangeDestinationSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Enter new destination..."
                value={newDestInput}
                onChange={(e) => setNewDestInput(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#087F5B]"
                autoFocus
              />

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowChangeDestModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 text-sm font-bold rounded-2xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#087F5B] hover:bg-[#064E3B] text-white text-sm font-bold rounded-2xl shadow-md cursor-pointer"
                >
                  Broadcast Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Curved Bottom Navigation Dock with Elevated Floating (+) Button (FoodGo Model - Matches Image 1 & 3) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-5px_25px_rgba(0,0,0,0.06)] px-4 py-2">
        <div className="max-w-md mx-auto flex items-center justify-between relative">
          {/* Home Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors cursor-pointer ${
              activeTab === 'home' ? 'text-[#087F5B]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold">Home</span>
          </button>

          {/* Map Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('map');
              navigateTo('google-maps');
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors cursor-pointer ${
              activeTab === 'map' ? 'text-[#087F5B]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] font-bold">Map</span>
          </button>

          {/* Elevated Floating (+) Action Button in Center */}
          <div className="relative -top-5">
            <button
              type="button"
              onClick={() => {
                if (isTripActive) {
                  navigateTo('live-navigation');
                } else {
                  navigateTo('start-trip');
                }
              }}
              className="w-13 h-13 rounded-full bg-[#087F5B] hover:bg-[#064E3B] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(8,127,91,0.4)] border-4 border-white transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              title="Start / Manage Trip"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
          </div>

          {/* Trips Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('trips');
              navigateTo('history');
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors cursor-pointer ${
              activeTab === 'trips' ? 'text-[#087F5B]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] font-bold">Trips</span>
          </button>

          {/* Profile Tab */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('profile');
              navigateTo('profile');
            }}
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors cursor-pointer ${
              activeTab === 'profile' ? 'text-[#087F5B]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
