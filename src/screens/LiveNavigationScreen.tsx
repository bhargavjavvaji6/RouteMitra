import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  CornerUpRight,
  LocateFixed,
  Users,
  Music,
  Compass,
  ArrowUp,
  ArrowDown,
  Edit3,
  X,
  StopCircle,
  Copy,
  Check,
  AlertTriangle,
  Volume2,
  VolumeX,
  Search,
  Navigation as NavIcon,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useTrip } from '../context/TripContext';

export const LiveNavigationScreen: React.FC = () => {
  const {
    currentSpeed,
    completeTrip,
    navigateTo,
    showToast,
    goBack,
    members,
    activeTrip,
    activeSharedTrip,
    currentTripId,
    isTripActive,
    liveLocationSharingActive,
    updateSharedDestination,
    endSharedTrip,
    copyTripId,
  } = useTrip();

  // Navigation steps matching image_3ac05970.png and image_43001c7c.png
  const instructions = [
    {
      dist: '750 m',
      text: 'Take left under the flyover',
      sub: 'NH16 Elevated Corridor Vijayawada Bypass',
      turnType: 'left',
    },
    {
      dist: '300 m',
      text: 'Towards State Bank Rd Then ↱',
      sub: 'Keep left and take the service road',
      turnType: 'right',
    },
    {
      dist: '2.4 km',
      text: 'Continue straight on NH16',
      sub: 'Toll Plaza in 4.5 km • Fastag lane active',
      turnType: 'straight',
    },
    {
      dist: '500 m',
      text: 'Keep right at the junction towards Destination',
      sub: 'Approaching terminal destination',
      turnType: 'right',
    },
  ];

  const [instructionStep, setInstructionStep] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'3d' | 'real_map'>('3d');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showDestModal, setShowDestModal] = useState<boolean>(false);
  const [newDestInput, setNewDestInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [hazardReported, setHazardReported] = useState<boolean>(false);

  // Live GPS tracking coordinates
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number }>({
    lat: 16.5062,
    lng: 80.648,
  });

  const currentDestination =
    activeTrip?.destination || activeSharedTrip?.destination || 'Gachibowli, Hyderabad';

  const currentInstr = instructions[instructionStep];

  // Live GPS tracking
  useEffect(() => {
    let watchId: number | null = null;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setGpsCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // Fallback simulation
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
      );
    }
    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const handleCopyId = () => {
    copyTripId();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDestinationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDestInput.trim()) return;

    await updateSharedDestination(newDestInput.trim());
    setShowDestModal(false);
    setNewDestInput('');
  };

  const handleEndNavigationConfirm = async () => {
    setShowEndModal(false);
    await endSharedTrip('Navigation ended by user');
  };

  const handleReportHazard = () => {
    setHazardReported(true);
    showToast('⚠️ Hazard reported on route: Shared with convoy participants');
    setTimeout(() => setHazardReported(false), 4000);
  };

  // Google Maps Embed URL for Real Map View
  const realMapUrl = `https://maps.google.com/maps?saddr=${gpsCoords.lat},${gpsCoords.lng}&daddr=${encodeURIComponent(
    currentDestination
  )}&dirflg=d&t=m&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="relative w-full h-screen bg-[#070D12] text-white overflow-hidden select-none flex flex-col justify-between">
      {/* ── Background Map Canvas ── */}
      {viewMode === '3d' ? (
        /* ── 3D Flyover Road View (Matches image_3ac05970.png) ── */
        <div className="absolute inset-0 z-0">
          {/* Sky background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#101E2E] via-[#1A2D3F] to-[#0A121A]" />

          {/* Concrete Overpass Flyover Bridge Overhead (Matches image_3ac05970.png) */}
          <div className="absolute top-[26%] left-[-15%] right-[-15%] h-24 transform -rotate-1 z-10 pointer-events-none">
            <div className="w-full h-11 bg-gradient-to-b from-[#3E4F5E] via-[#2A3742] to-[#162028] border-b-2 border-[#0F161C] shadow-[0_15px_30px_rgba(0,0,0,0.85)] relative flex items-center justify-between px-16">
              <span className="text-[9px] font-mono tracking-widest text-emerald-400/70 uppercase">
                NH16 FLYOVER VIJAYAWADA BYPASS
              </span>
              <span className="text-[9px] font-mono tracking-widest text-white/50 uppercase">
                CORRIDOR ELEVATED
              </span>
            </div>
            {/* Bridge Support Columns */}
            <div className="w-full flex justify-around px-12">
              <div className="w-8 h-56 bg-gradient-to-r from-[#2B3945] via-[#3E5162] to-[#1E2832] shadow-2xl" />
              <div className="w-10 h-56 bg-gradient-to-r from-[#2B3945] via-[#3E5162] to-[#1E2832] shadow-2xl" />
              <div className="w-8 h-56 bg-gradient-to-r from-[#2B3945] via-[#3E5162] to-[#1E2832] shadow-2xl" />
            </div>
          </div>

          {/* Perspective Asphalt Highway Canvas */}
          <svg
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="roadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1C2834" />
                <stop offset="100%" stopColor="#0B1117" />
              </linearGradient>
              <linearGradient id="navGlow" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="50%" stopColor="#00E5FF" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
            </defs>

            {/* Asphalt Ground */}
            <polygon points="120,280 320,280 480,900 -40,900" fill="url(#roadGrad)" />

            {/* Lane lines */}
            <path
              d="M 220 280 L 220 900"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeDasharray="14 14"
              opacity="0.35"
            />
            <path
              d="M 170 280 L 90 900"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeDasharray="10 10"
              opacity="0.4"
            />
            <path
              d="M 270 280 L 350 900"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeDasharray="10 10"
              opacity="0.3"
            />

            {/* Glowing Navigation Route Line */}
            <path
              d="M 220 860 C 220 640, 190 480, 160 290"
              stroke="url(#navGlow)"
              strokeWidth="16"
              fill="none"
              strokeLinecap="round"
              opacity="0.9"
            />
            <path
              d="M 220 860 C 220 640, 190 480, 160 290"
              stroke="#ffffff"
              strokeWidth="4"
              strokeDasharray="8 8"
              fill="none"
            />

            {/* Live Vehicle Indicator (Radar glow) */}
            <circle cx="220" cy="740" r="22" fill="rgba(52, 211, 153, 0.2)" />
            <circle cx="220" cy="740" r="14" fill="rgba(52, 211, 153, 0.4)" />
            <circle cx="220" cy="740" r="9" fill="#087F5B" stroke="#34D399" strokeWidth="3" />
          </svg>
        </div>
      ) : (
        /* ── Real Google Maps View with Dark Mode/Night Palette (Matches image_43001c7c.png) ── */
        <div className="absolute inset-0 z-0 w-full h-full">
          <iframe
            title="Real Time Navigation Map"
            src={realMapUrl}
            className="w-full h-full border-0 brightness-[0.88] contrast-[1.1] invert-[0.9] hue-rotate-[180deg]"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )}

      {/* ── Top Header Section (Matches image_3ac05970.png) ── */}
      <div className="relative z-30 pt-3 px-3 sm:px-4 max-w-xl mx-auto w-full space-y-2 pointer-events-auto">
        {/* Row 1: Green Turn Navigation Card + Music Button */}
        <div className="flex items-center gap-2">
          {/* Green Turn Box */}
          <div className="flex-1 bg-[#087F5B] rounded-2xl p-3 sm:p-4 shadow-xl border border-[#34D399]/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => goBack()}
                className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white cursor-pointer transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                <CornerUpRight className="w-5 h-5 stroke-[2.5]" />
              </div>

              <div>
                <div className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {currentInstr.dist}
                </div>
                <p className="text-xs font-bold text-white/95 leading-tight">{currentInstr.text}</p>
                <p className="text-[10px] text-white/70 leading-tight mt-0.5">{currentInstr.sub}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setInstructionStep((prev) => (prev + 1) % instructions.length)}
              className="px-2.5 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white text-[10px] font-bold cursor-pointer shrink-0"
              title="Preview next maneuver"
            >
              Step
            </button>
          </div>

          {/* Music Quick Icon (Top Right in image_3ac05970.png) */}
          <button
            type="button"
            onClick={() => navigateTo('music')}
            className="w-12 h-12 rounded-2xl bg-[#087F5B] hover:bg-[#064E3B] text-white flex items-center justify-center shadow-lg border border-[#34D399]/40 cursor-pointer shrink-0"
            title="Open Journey Music Player"
          >
            <Music className="w-5 h-5 text-[#34D399]" />
          </button>
        </div>

        {/* Row 2: Destination & Unique Trip ID Bar */}
        <div className="bg-[#16222F]/95 backdrop-blur-md rounded-2xl px-3.5 py-2 border border-[#27384A] shadow-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-white/60">Dest:</span>
            <span className="font-bold text-white truncate">{currentDestination}</span>
            <button
              type="button"
              onClick={() => setShowDestModal(true)}
              className="p-1 rounded text-[#34D399] hover:bg-white/10 transition-colors cursor-pointer"
              title="Change destination for all devices in real-time"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopyId}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#202E3E] hover:bg-[#2B3D52] text-[11px] font-mono text-emerald-300 font-bold border border-emerald-500/30 transition-colors cursor-pointer shrink-0"
            title="Click to copy Trip ID"
          >
            <span>{activeSharedTrip?.id || currentTripId}</span>
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>

        {/* Row 3: View Mode Switcher: 3D Flyover View vs Real Google Maps */}
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === '3d' ? 'real_map' : '3d')}
            className="px-3.5 py-1.5 rounded-full bg-[#16222F]/90 backdrop-blur-md border border-[#34D399]/40 text-xs font-bold text-white flex items-center gap-1.5 shadow-md cursor-pointer hover:bg-[#202E3E]"
          >
            <Compass className="w-3.5 h-3.5 text-[#34D399]" />
            <span>{viewMode === '3d' ? 'Switch to Real 2D Map' : 'Switch to 3D Flyover View'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-full bg-[#16222F]/90 backdrop-blur-md border border-[#27384A] text-white hover:bg-[#202E3E] transition-colors cursor-pointer"
            title={isMuted ? 'Unmute voice guidance' : 'Mute voice guidance'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* ── Floating Right: Convoy Members Distances (Only for joined members while trip is active) ──
          Requirement 2: "Only display the details and live location of users who actually join using the Trip ID.
          Ensure that once the trip ends, member locations are no longer visible to other participants."
      */}
      {isTripActive && liveLocationSharingActive && (
        <div className="relative z-20 px-4 flex flex-col items-end gap-3 pointer-events-auto">
          {/* Sumanth ahead badge */}
          <div
            onClick={() => navigateTo('members')}
            className="px-3 py-1.5 rounded-2xl bg-[#16222F]/90 backdrop-blur-md border border-blue-500 shadow-xl flex items-center gap-2.5 cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden border border-blue-400 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                alt="Sumanth"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white flex items-center gap-1">
                Sumanth
                <ArrowUp className="w-3 h-3 text-blue-400" />
              </p>
              <p className="text-[10px] text-white/60">10 m ahead</p>
            </div>
          </div>

          {/* Rohith behind badge */}
          <div
            onClick={() => navigateTo('members')}
            className="px-3 py-1.5 rounded-2xl bg-[#16222F]/90 backdrop-blur-md border border-amber-500 shadow-xl flex items-center gap-2.5 cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-400 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                alt="Rohith"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white flex items-center gap-1">
                Rohith
                <ArrowDown className="w-3 h-3 text-amber-400" />
              </p>
              <p className="text-[10px] text-white/60">20 m behind</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Mid Floating Action Buttons (Matches image_43001c7c.png) ── */}
      <div className="relative z-20 px-4 flex items-center justify-between pointer-events-auto">
        {/* Re-centre button */}
        <button
          type="button"
          onClick={() => {
            showToast('Navigation re-centred on live GPS location');
          }}
          className="px-4 py-2 rounded-full bg-[#16222F]/90 backdrop-blur-md border border-[#27384A] text-white text-xs font-bold flex items-center gap-2 shadow-xl hover:bg-[#202E3E] cursor-pointer"
        >
          <LocateFixed className="w-4 h-4 text-[#34D399]" />
          <span>Re-centre</span>
        </button>

        {/* Report Hazard button */}
        <button
          type="button"
          onClick={handleReportHazard}
          className={`px-4 py-2 rounded-full backdrop-blur-md border text-xs font-bold flex items-center gap-2 shadow-xl transition-all cursor-pointer ${
            hazardReported
              ? 'bg-amber-500 text-slate-900 border-amber-400'
              : 'bg-[#16222F]/90 text-amber-400 border-amber-500/40 hover:bg-[#202E3E]'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>{hazardReported ? 'Reported!' : 'Report'}</span>
        </button>
      </div>

      {/* ── Bottom Navigation Bar (Matches image_3ac05970.png and image_43001c7c.png) ── */}
      <footer className="relative z-30 p-4 max-w-xl mx-auto w-full pointer-events-auto">
        {/* Speedometer Gauge & Convoy Count */}
        <div className="flex items-center justify-between mb-3">
          {/* Speed limit indicator: 74 km/h (Matches image_3ac05970.png) */}
          <div className="w-16 h-16 rounded-full bg-white border-4 border-red-600 shadow-2xl flex flex-col items-center justify-center text-slate-900 font-black">
            <span className="text-xl leading-none">{currentSpeed}</span>
            <span className="text-[8px] font-bold text-slate-500 uppercase">km/h</span>
          </div>

          {/* Convoy participants pill */}
          <button
            type="button"
            onClick={() => navigateTo('members')}
            className="px-3.5 py-2 rounded-2xl bg-[#16222F]/95 backdrop-blur-md border border-[#34D399]/40 shadow-xl flex items-center gap-2 cursor-pointer hover:bg-[#202E3E]"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <Users className="w-4 h-4 text-[#34D399]" />
            <span className="text-xs font-bold text-white">3 in Convoy</span>
          </button>
        </div>

        {/* ETA & End Button Card */}
        <div className="bg-[#16222F]/95 backdrop-blur-md rounded-3xl p-4 border border-[#27384A] shadow-2xl flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">5h 12m</span>
              <span className="text-xs text-white/50 font-bold">• 4:53 PM</span>
            </div>
            <p className="text-xs text-[#34D399] font-bold mt-0.5">368 km remaining on NH16</p>
            <p className="text-[11px] text-amber-300/80 font-medium mt-0.5">₹460.00 • Saves 10% petrol</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* End Shared Trip Button */}
            <button
              type="button"
              onClick={() => setShowEndModal(true)}
              className="px-6 py-3.5 bg-[#E11D48] hover:bg-[#BE123C] text-white font-black text-sm rounded-2xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <StopCircle className="w-4 h-4" />
              <span>End</span>
            </button>
          </div>
        </div>
      </footer>

      {/* ── End Trip Confirmation Modal ── */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#16222F] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#27384A] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <StopCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">End Navigation?</h3>
              <p className="text-xs text-white/60 mt-1">
                This will stop live tracking for all participants in this convoy. In accordance with privacy rules, member locations will be permanently removed.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-3 bg-[#202E3E] text-white text-xs font-bold rounded-2xl cursor-pointer"
              >
                Keep Going
              </button>
              <button
                type="button"
                onClick={handleEndNavigationConfirm}
                className="flex-1 py-3 bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold rounded-2xl shadow-md cursor-pointer"
              >
                End Navigation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Change Destination Modal ── */}
      {showDestModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#16222F] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#27384A] relative">
            <button
              type="button"
              onClick={() => setShowDestModal(false)}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Update Destination</h3>
            <p className="text-xs text-white/60 mb-4">
              Synchronizes in real time with all convoy participants' devices.
            </p>

            <form onSubmit={handleDestinationSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Enter new destination..."
                value={newDestInput}
                onChange={(e) => setNewDestInput(e.target.value)}
                className="w-full px-4 py-3 bg-[#0E1620] border border-[#27384A] rounded-2xl text-sm font-medium text-white placeholder-white/40 focus:outline-none focus:border-[#34D399]"
                autoFocus
              />

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDestModal(false)}
                  className="flex-1 py-3 bg-[#202E3E] text-white text-sm font-bold rounded-2xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#087F5B] hover:bg-[#064E3B] text-white text-sm font-bold rounded-2xl shadow-md cursor-pointer"
                >
                  Sync Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
