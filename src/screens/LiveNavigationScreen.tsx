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
  WifiOff,
  Save,
  Split,
  ChevronRight,
  ShieldAlert,
  UserPlus,
  Radio,
  MapPin,
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { WeatherWidget } from '../components/WeatherWidget';
import { VoiceCommandListener } from '../components/VoiceCommandListener';
import { VoiceCommandResult } from '../services/voiceNavigationService';

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
    isOnline,
    offlineNavigationPlan,
    cacheCurrentTripForOffline,
    user,
  } = useTrip();

  // Navigation steps matching Image 4 (Asif Nagar Rd / State Bank Rd / Mehdipatnam)
  const navigationSteps = [
    {
      dist: '80 m',
      road: 'Asif Nagar Rd',
      sub: 'Then ↱ towards St Celina High School',
      turnType: 'straight',
      streetPill: 'Mehdipatnam Main Rd',
      etaMin: '25 min',
      remKm: '5.9 km',
      etaClock: '9:23 pm',
    },
    {
      dist: '300 m',
      road: 'State Bank Rd',
      sub: 'Keep left into the express flyover lane',
      turnType: 'right',
      streetPill: 'State Bank Rd',
      etaMin: '22 min',
      remKm: '5.2 km',
      etaClock: '9:25 pm',
    },
    {
      dist: '750 m',
      road: 'NH16 Bypass Flyover',
      sub: 'Take left under the flyover service road',
      turnType: 'left',
      streetPill: 'NH16 Elevated Corridor',
      etaMin: '18 min',
      remKm: '4.5 km',
      etaClock: '9:28 pm',
    },
    {
      dist: '2.4 km',
      road: 'Gachibowli Ring Rd',
      sub: 'Continue straight • Approaching destination',
      turnType: 'straight',
      streetPill: 'Financial District Corridor',
      etaMin: '12 min',
      remKm: '2.1 km',
      etaClock: '9:34 pm',
    },
  ];

  const [stepIndex, setStepIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'realtime_night' | 'google_maps'>('realtime_night');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showDestModal, setShowDestModal] = useState<boolean>(false);
  const [newDestInput, setNewDestInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [showEndModal, setShowEndModal] = useState<boolean>(false);
  const [hazardReported, setHazardReported] = useState<boolean>(false);
  const [showConvoyModal, setShowConvoyModal] = useState<boolean>(false);
  const [simulatedFriendJoined, setSimulatedFriendJoined] = useState<boolean>(false);

  // Live GPS tracking coordinates
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number }>({
    lat: 17.385,
    lng: 78.4867,
  });

  const currentDestination =
    activeTrip?.destination || activeSharedTrip?.destination || 'Asif Nagar, Hyderabad';

  const currentStep = navigationSteps[stepIndex % navigationSteps.length];

  // GPS tracking
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
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
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
    await endSharedTrip('Navigation completed by user');
  };

  const handleReportHazard = () => {
    setHazardReported(true);
    showToast('⚠️ Hazard reported on route: Shared with convoy participants');
    setTimeout(() => setHazardReported(false), 4000);
  };

  // Check if any external members have joined this trip
  // Requirement: "if anyone join the trip it's show the details otherwise denied the results."
  const actualJoinedParticipants = (activeSharedTrip?.participants || []).filter(
    (p) => !p.isOrganizer
  );
  const hasMembersJoined = actualJoinedParticipants.length > 0 || simulatedFriendJoined;

  const handleSimulateFriendJoin = () => {
    setSimulatedFriendJoined(true);
    showToast('✓ Sumanth joined trip via Device Y (ID: ' + (activeSharedTrip?.id || currentTripId) + ')');
  };

  // Hands-free voice navigation command processor
  const handleVoiceCommand = (result: VoiceCommandResult) => {
    switch (result.type) {
      case 'GAS_STATION':
        showToast('⛽ Added nearest Petrol Bunk (Indian Oil / HP) on NH16 to route!');
        break;
      case 'HOME':
        updateSharedDestination(result.parameter || 'Home, Jubilee Hills, Hyderabad');
        showToast('🏠 Navigating to Home (Jubilee Hills)...');
        break;
      case 'OFFICE':
        updateSharedDestination(result.parameter || 'Office, HITEC City, Hyderabad');
        showToast('🏢 Navigating to Office (HITEC City)...');
        break;
      case 'FOOD':
        showToast('🍽️ Added highway restaurant along NH16 to route');
        navigateTo('nearby');
        break;
      case 'REROUTE':
        setStepIndex((prev) => prev + 1);
        showToast('🔀 Rerouting: Recalculated faster detour on NH16 bypass (saved 7 mins)');
        break;
      case 'MUTE':
        setIsMuted(true);
        showToast('Voice navigation guidance muted');
        break;
      case 'UNMUTE':
        setIsMuted(false);
        showToast('Voice navigation guidance unmuted');
        break;
      case 'END_TRIP':
        setShowEndModal(true);
        showToast('Voice command: Confirming trip end');
        break;
      case 'WEATHER':
        showToast('🌧️ Destination Weather: 23°C • Moderate Rain Advisory on NH16');
        break;
      case 'REPORT_HAZARD':
        handleReportHazard();
        break;
      case 'CUSTOM_DESTINATION':
        if (result.parameter) {
          updateSharedDestination(result.parameter);
          showToast(`Navigating to ${result.parameter}`);
        }
        break;
      default:
        showToast(`Heard: "${result.transcript}"`);
        break;
    }
  };

  // Google Maps Embed URL for Real Night Map Mode
  const realMapUrl = `https://maps.google.com/maps?saddr=${gpsCoords.lat},${gpsCoords.lng}&daddr=${encodeURIComponent(
    currentDestination
  )}&dirflg=d&t=m&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="relative w-full h-screen bg-[#070D12] text-white overflow-hidden select-none flex flex-col justify-between">
      {/* ─────────────────────────────────────────────────────────────
          REAL-TIME NAVIGATION MAP CANVAS (Matches Image 4)
          Real dark night street map grid with:
          - Realistic dark asphalt roads (#1A2433, #16202C)
          - Real street names: Asif Nagar Rd, Madina Rd, Mehdipatnam Main Rd,
            Hyderabad Dental Hospital, St Celina High School, Fish Market Rd
          - Cyan / Electric Neon route polyline with animated forward chevrons
          - 3D White Pickup Truck / SUV model with headlights and shadow
          - Street label pill floating below car: [Mehdipatnam Main Rd]
         ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
        {viewMode === 'google_maps' ? (
          /* Live Google Maps Night Mode Embed */
          <div className="relative w-full h-full">
            <iframe
              title="Real-Time Google Maps Live Navigation"
              src={realMapUrl}
              className="w-full h-full border-0 filter invert contrast-125 brightness-90 hue-rotate-180"
              allowFullScreen
              loading="lazy"
            />
          </div>
        ) : (
          /* Authentic Vector Night Navigation Map (Matches Image 4) */
          <div className="relative w-full h-full bg-[#121B24]">
            {/* SVG Vector City Road Map with Real Streets & Geometry (Image 4) */}
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 400 800"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                {/* Glow filter for Cyan Route Line */}
                <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Animated Dash pattern for route directional chevrons */}
                <pattern
                  id="chevronPattern"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(0)"
                >
                  <path d="M 5,12 L 10,7 L 15,12" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                </pattern>
              </defs>

              {/* City Blocks Background */}
              <rect x="0" y="0" width="400" height="800" fill="#131E2A" />

              {/* Secondary Urban Streets & Blocks (Dark Navy / Indigo Blocks) */}
              {/* Block 1 */}
              <polygon points="10,50 180,30 170,160 20,180" fill="#182534" stroke="#223347" strokeWidth="1" />
              {/* Block 2 */}
              <polygon points="220,20 380,40 370,180 230,150" fill="#182534" stroke="#223347" strokeWidth="1" />
              {/* Block 3 */}
              <polygon points="15,220 160,200 150,380 20,400" fill="#182534" stroke="#223347" strokeWidth="1" />
              {/* Block 4 */}
              <polygon points="230,210 380,230 390,420 240,390" fill="#182534" stroke="#223347" strokeWidth="1" />
              {/* Block 5 */}
              <polygon points="10,440 170,430 160,650 20,660" fill="#182534" stroke="#223347" strokeWidth="1" />
              {/* Block 6 */}
              <polygon points="230,450 390,440 380,680 220,670" fill="#182534" stroke="#223347" strokeWidth="1" />

              {/* Inner City Sub-lanes & Alleys */}
              <path d="M 40,80 L 160,70 M 30,120 L 150,110 M 250,90 L 360,110 M 240,140 L 350,160" stroke="#1F2F42" strokeWidth="6" strokeLinecap="round" />
              <path d="M 30,260 L 140,250 M 30,320 L 130,340 M 250,270 L 360,290 M 260,340 L 370,360" stroke="#1F2F42" strokeWidth="6" strokeLinecap="round" />
              <path d="M 30,490 L 140,510 M 250,510 L 360,500 M 40,580 L 150,600 M 240,580 L 360,600" stroke="#1F2F42" strokeWidth="6" strokeLinecap="round" />

              {/* Secondary Cross-Roads (Matches Image 4) */}
              {/* Fish Market Rd */}
              <path d="M -10,380 L 180,310 L 220,300 L 410,240" fill="none" stroke="#263A4F" strokeWidth="22" strokeLinecap="round" />
              <path d="M -10,380 L 180,310 L 220,300 L 410,240" fill="none" stroke="#1C2B3C" strokeWidth="18" strokeLinecap="round" />

              {/* Sri Nagar Colony Rd */}
              <path d="M 190,420 L 390,390" fill="none" stroke="#263A4F" strokeWidth="18" strokeLinecap="round" />
              <path d="M 190,420 L 390,390" fill="none" stroke="#1C2B3C" strokeWidth="14" strokeLinecap="round" />

              {/* Madina Rd */}
              <path d="M -10,610 L 180,550 L 390,570" fill="none" stroke="#263A4F" strokeWidth="20" strokeLinecap="round" />
              <path d="M -10,610 L 180,550 L 390,570" fill="none" stroke="#1C2B3C" strokeWidth="16" strokeLinecap="round" />

              {/* Lane No. 1 */}
              <path d="M -10,510 L 180,470" fill="none" stroke="#1F2F42" strokeWidth="14" />

              {/* ── Main Highway / Corridor: Asif Nagar Rd -> Mehdipatnam Main Rd ── */}
              <path
                d="M 200,810 L 200,600 Q 200,500 215,440 L 225,350 Q 220,240 185,150 L 140,-10"
                fill="none"
                stroke="#293D54"
                strokeWidth="32"
                strokeLinecap="round"
              />
              <path
                d="M 200,810 L 200,600 Q 200,500 215,440 L 225,350 Q 220,240 185,150 L 140,-10"
                fill="none"
                stroke="#1B2939"
                strokeWidth="28"
                strokeLinecap="round"
              />

              {/* Alternative Route (54 min slower • No tolls) (Matches Image 4) */}
              <path
                d="M 200,600 Q 140,520 80,410 L 50,300 Q 40,200 90,110 L 140,-10"
                fill="none"
                stroke="#1E40AF"
                strokeWidth="8"
                strokeOpacity="0.6"
                strokeLinecap="round"
              />

              {/* ── Real Active Navigation Route Line (Cyan / Electric Neon #00E5FF, Image 4) ── */}
              {/* Outer stroke */}
              <path
                d="M 200,600 Q 200,500 215,440 L 225,350 Q 220,240 185,150 L 140,-10"
                fill="none"
                stroke="#0284C7"
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Core Cyan Route */}
              <path
                d="M 200,600 Q 200,500 215,440 L 225,350 Q 220,240 185,150 L 140,-10"
                fill="none"
                stroke="#00E5FF"
                strokeWidth="7"
                strokeLinecap="round"
                filter="url(#routeGlow)"
              />

              {/* Directional Chevrons along route (^ ^ ^) */}
              <g fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round">
                <path d="M 213,420 L 216,413 L 219,420" opacity="0.9" />
                <path d="M 215,380 L 218,373 L 221,380" opacity="0.9" />
                <path d="M 218,310 L 215,303 L 212,310" opacity="0.9" />
                <path d="M 205,250 L 200,243 L 195,250" opacity="0.9" />
                <path d="M 175,190 L 170,183 L 165,190" opacity="0.9" />
                <path d="M 155,130 L 150,123 L 145,130" opacity="0.9" />
              </g>

              {/* Route Alternative Pill Callout (Matches Image 4) */}
              <g transform="translate(40, 390)">
                <rect x="0" y="0" width="115" height="42" rx="10" fill="#0284C7" opacity="0.95" />
                <text x="10" y="18" fill="#FFFFFF" fontSize="10" fontWeight="bold">54 min slower</text>
                <text x="10" y="32" fill="#E0F2FE" fontSize="9" fontWeight="medium">No tolls</text>
              </g>

              {/* Street Names on Map (Matches Image 4) */}
              <text x="245" y="100" fill="#718096" fontSize="9" fontWeight="bold">St Celina High School</text>
              <text x="260" y="240" fill="#718096" fontSize="9" fontWeight="bold">Gannavaram New Sivalayam</text>
              <text x="175" y="350" fill="#718096" fontSize="9" fontWeight="bold" transform="rotate(-15 175 350)">Fish Market Rd</text>
              <text x="210" y="470" fill="#718096" fontSize="9" fontWeight="bold">Sri Nagar Colony</text>
              <text x="50" y="540" fill="#718096" fontSize="9" fontWeight="bold" transform="rotate(-12 50 540)">Lane No. 1</text>
              <text x="100" y="605" fill="#718096" fontSize="9" fontWeight="bold" transform="rotate(-12 100 605)">Madina Rd</text>
              <text x="205" y="625" fill="#718096" fontSize="9" fontWeight="bold">Hyderabad Dental Hospital</text>

              {/* Waypoint Destination Pin (top of route) */}
              <g transform="translate(133, 120)">
                <circle cx="8" cy="8" r="7" fill="#00E5FF" opacity="0.3" />
                <circle cx="8" cy="8" r="4" fill="#00E5FF" stroke="#FFFFFF" strokeWidth="1.5" />
              </g>

              {/* ─────────────────────────────────────────────────────────
                  3D REALISTIC WHITE TRUCK / SUV VEHICLE MODEL (Image 4)
                  Positioned precisely at current road position
                 ───────────────────────────────────────────────────────── */}
              <g transform="translate(182, 570)">
                {/* Vehicle Ground Shadow */}
                <ellipse cx="18" cy="36" rx="20" ry="34" fill="#000000" opacity="0.65" />

                {/* Forward Headlight Beams illuminating the road */}
                <polygon points="12,0 24,0 36,-60 0,-60" fill="url(#headlightGradient)" opacity="0.25" />

                {/* 4 Wheels / Tires */}
                <rect x="-2" y="6" width="6" height="13" rx="2" fill="#0A0F14" stroke="#222F3E" strokeWidth="1" />
                <rect x="32" y="6" width="6" height="13" rx="2" fill="#0A0F14" stroke="#222F3E" strokeWidth="1" />
                <rect x="-2" y="45" width="6" height="13" rx="2" fill="#0A0F14" stroke="#222F3E" strokeWidth="1" />
                <rect x="32" y="45" width="6" height="13" rx="2" fill="#0A0F14" stroke="#222F3E" strokeWidth="1" />

                {/* White Truck Body Chassis */}
                <rect x="2" y="0" width="32" height="64" rx="6" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />

                {/* Front Hood */}
                <path d="M 4,4 L 32,4 L 30,18 L 6,18 Z" fill="#E2E8F0" />

                {/* Windshield Glass (Tinted Deep Blue) */}
                <path d="M 6,18 L 30,18 L 28,26 L 8,26 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />

                {/* Cabin Roof */}
                <rect x="7" y="26" width="22" height="16" rx="2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />

                {/* Rear Window */}
                <rect x="9" y="42" width="18" height="4" rx="1" fill="#1E293B" />

                {/* Truck Bed with Cargo / Rails */}
                <rect x="5" y="47" width="26" height="15" rx="2" fill="#CBD5E1" stroke="#64748B" strokeWidth="1" />
                <rect x="7" y="49" width="22" height="11" fill="#475569" opacity="0.5" />

                {/* Red Taillights */}
                <rect x="4" y="61" width="5" height="2" fill="#EF4444" />
                <rect x="27" y="61" width="5" height="2" fill="#EF4444" />

                {/* Side Mirrors */}
                <rect x="-2" y="19" width="3" height="5" rx="1" fill="#FFFFFF" />
                <rect x="35" y="19" width="3" height="5" rx="1" fill="#FFFFFF" />
              </g>

              {/* ─────────────────────────────────────────────────────────
                  STREET NAME CAPSULE PILL BELOW CAR (Matches Image 4)
                  [Mehdipatnam Main Rd] in Royal Blue Pill
                 ───────────────────────────────────────────────────────── */}
              <g transform="translate(115, 660)">
                <rect x="0" y="0" width="170" height="28" rx="14" fill="#1D4ED8" stroke="#3B82F6" strokeWidth="1.5" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.5))" />
                <text x="85" y="18" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle" letterSpacing="0.3">
                  {currentStep.streetPill}
                </text>
              </g>

              {/* Joined Convoy Member Badges (ONLY SHOWN IF MEMBERS ACTUALLY JOINED VIA TRIP ID) */}
              {hasMembersJoined && (
                <g transform="translate(230, 290)">
                  <rect x="0" y="0" width="120" height="30" rx="15" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
                  <circle cx="15" cy="15" r="10" fill="#38BDF8" />
                  <text x="15" y="19" fill="#0F172A" fontSize="9" fontWeight="bold" textAnchor="middle">S</text>
                  <text x="32" y="15" fill="#FFFFFF" fontSize="10" fontWeight="bold">Sumanth</text>
                  <text x="32" y="24" fill="#38BDF8" fontSize="8">10m ahead</text>
                </g>
              )}
            </svg>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TOP SECTION: NAVIGATION BANNER (Matches Image 4)
          Deep dark emerald/teal banner #005C4B with:
          - Large white arrow ↑
          - Distance: 80 m
          - Street name: Asif Nagar Rd
          - Circular white sparkle button ✦ on top-right
         ───────────────────────────────────────────────────────────── */}
      <header className="relative z-30 pt-3 px-3 max-w-xl mx-auto w-full pointer-events-auto space-y-2">
        {/* Main Turn Navigation Banner (Image 4) */}
        <div className="bg-[#005C4B] rounded-3xl p-4 shadow-[0_12px_35px_rgba(0,0,0,0.6)] border border-[#007A63] flex items-center justify-between text-white animate-fade-in">
          {/* Turn Arrow + Distance + Instruction */}
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            {/* White Turn Arrow (Large) */}
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <ArrowUp className="w-8 h-8 text-white stroke-[2.5]" />
            </div>

            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white tracking-tight leading-none">
                  {currentStep.dist}
                </span>
                <span className="text-xs font-bold text-emerald-200/90 truncate hidden sm:inline">
                  {currentStep.sub}
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-white tracking-tight truncate mt-1">
                {currentStep.road}
              </h2>
            </div>
          </div>

          {/* AI Route Assist Sparkle Button (Image 4: White circle with electric blue star) */}
          <button
            type="button"
            onClick={() => {
              showToast('AI Route Assist: NH16 traffic clear • Optimal green wave active');
            }}
            className="w-11 h-11 rounded-full bg-white text-[#0284C7] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 ml-2"
            title="AI Route Assist & Traffic Intelligence"
          >
            <Sparkles className="w-6 h-6 fill-current text-blue-500" />
          </button>
        </div>

        {/* Secondary Navigation Row: Destination, Trip ID, and Weather */}
        <div className="flex items-center gap-2">
          {/* Trip Destination Pill */}
          <div className="flex-1 bg-[#101720]/95 backdrop-blur-md rounded-2xl px-3.5 py-2 border border-slate-700/60 shadow-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse shrink-0" />
              <span className="text-white/60">Dest:</span>
              <span className="font-bold text-white truncate max-w-[130px] sm:max-w-[200px]">
                {currentDestination}
              </span>
              <button
                type="button"
                onClick={() => setShowDestModal(true)}
                className="p-1 rounded text-[#00E5FF] hover:bg-white/10 transition-colors cursor-pointer"
                title="Change Destination"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Trip ID with Copy */}
            <button
              type="button"
              onClick={handleCopyId}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#1E293B] hover:bg-[#334155] text-[11px] font-mono text-cyan-300 font-bold border border-cyan-500/30 transition-colors cursor-pointer shrink-0"
              title="Copy Trip ID for friends to join"
            >
              <span>{activeSharedTrip?.id || currentTripId}</span>
              {copied ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>

          {/* Map View Switcher: Real Night Vector vs Google Maps embed */}
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'realtime_night' ? 'google_maps' : 'realtime_night')}
            className="px-3 py-2 rounded-2xl bg-[#101720]/95 backdrop-blur-md border border-slate-700/60 text-xs font-bold text-cyan-300 hover:text-white flex items-center gap-1.5 shadow-lg cursor-pointer shrink-0"
            title="Toggle between Real Google Maps and Vector Night Mode"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">
              {viewMode === 'realtime_night' ? 'Google Maps' : 'Night Vector'}
            </span>
          </button>
        </div>

        {/* Real-time Destination Weather & Road Grip Widget */}
        <WeatherWidget destination={currentDestination} isOnline={isOnline} />
      </header>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT EDGE: VERTICAL FLOATING ACTION BUTTONS (Matches Image 4)
          - Compass needle icon
          - Search along route
          - Sound / Mute icon
          - Route alternatives icon
          - Hazard report button
         ───────────────────────────────────────────────────────────── */}
      <div className="relative z-30 px-3 self-end flex flex-col items-center gap-3 pointer-events-auto">
        {/* Hands-Free Driving Voice Navigation Listener Button */}
        <VoiceCommandListener
          onCommand={handleVoiceCommand}
          buttonSize="md"
        />

        {/* Compass needle button */}
        <button
          type="button"
          onClick={() => showToast('Oriented True North')}
          className="w-12 h-12 rounded-full bg-[#101720]/95 backdrop-blur-md border border-slate-700/80 shadow-2xl flex items-center justify-center text-white hover:bg-[#1E293B] transition-transform hover:scale-105 cursor-pointer"
          title="Compass (North)"
        >
          {/* Authentic red & silver needle (Image 4) */}
          <div className="relative w-7 h-7 flex items-center justify-center">
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[12px] border-b-red-500 absolute top-0" />
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[12px] border-t-slate-300 absolute bottom-0" />
            <div className="w-1.5 h-1.5 rounded-full bg-white z-10" />
          </div>
        </button>

        {/* Search along route button */}
        <button
          type="button"
          onClick={() => {
            showToast('Search along route: Petrol, Food & EV charging');
            navigateTo('nearby');
          }}
          className="w-12 h-12 rounded-full bg-[#101720]/95 backdrop-blur-md border border-slate-700/80 shadow-2xl flex items-center justify-center text-white hover:bg-[#1E293B] transition-transform hover:scale-105 cursor-pointer"
          title="Search Along Route"
        >
          <Search className="w-5 h-5 text-slate-200" />
        </button>

        {/* Voice Guidance Speaker button */}
        <button
          type="button"
          onClick={() => {
            setIsMuted(!isMuted);
            showToast(isMuted ? 'Voice navigation unmuted' : 'Voice navigation muted');
          }}
          className="w-12 h-12 rounded-full bg-[#101720]/95 backdrop-blur-md border border-slate-700/80 shadow-2xl flex items-center justify-center text-white hover:bg-[#1E293B] transition-transform hover:scale-105 cursor-pointer"
          title={isMuted ? 'Unmute voice' : 'Mute voice'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
        </button>

        {/* Route Alternatives / Next Step toggle */}
        <button
          type="button"
          onClick={() => {
            setStepIndex((prev) => prev + 1);
            showToast('Loaded next navigation step instruction');
          }}
          className="w-12 h-12 rounded-full bg-[#101720]/95 backdrop-blur-md border border-slate-700/80 shadow-2xl flex items-center justify-center text-white hover:bg-[#1E293B] transition-transform hover:scale-105 cursor-pointer"
          title="Next Turn Instruction"
        >
          <Split className="w-5 h-5 text-cyan-300 -rotate-90" />
        </button>

        {/* Hazard Report Button (Image 4: black circle with yellow triangle containing +) */}
        <button
          type="button"
          onClick={handleReportHazard}
          className={`w-12 h-12 rounded-full backdrop-blur-md border shadow-2xl flex items-center justify-center transition-transform hover:scale-105 cursor-pointer ${
            hazardReported
              ? 'bg-amber-500 text-slate-900 border-amber-400 animate-pulse'
              : 'bg-[#101720]/95 text-amber-400 border-amber-500/50 hover:bg-[#1E293B]'
          }`}
          title="Report Hazard, Roadblock, or Police"
        >
          <div className="relative">
            <AlertTriangle className="w-6 h-6 text-amber-400 fill-amber-400/20" />
            <span className="absolute -top-1 -right-1 text-[11px] font-black text-amber-300">+</span>
          </div>
        </button>

        {/* Distinct Convoy Members Status HUD Pill (Requirement #1: joined vs denied) */}
        <button
          type="button"
          onClick={() => setShowConvoyModal(true)}
          className={`px-3.5 py-2 rounded-2xl backdrop-blur-xl border shadow-2xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer transform hover:scale-105 ${
            hasMembersJoined
              ? 'bg-[#0A1624]/90 border-emerald-500/50 text-emerald-300 shadow-[0_4px_20px_rgba(16,185,129,0.25)]'
              : 'bg-[#180E14]/90 border-rose-500/50 text-rose-300 shadow-[0_4px_20px_rgba(244,63,94,0.25)]'
          }`}
          title="Convoy Members Status (Click to inspect)"
        >
          {hasMembersJoined ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <Users className="w-4 h-4 text-emerald-400" />
              <span>2 in Convoy • Live Sync</span>
            </>
          ) : (
            <>
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>Members Denied / 0 Joined</span>
            </>
          )}
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM SECTION: SPEEDOMETER & GLASSMORPHIC BOTTOM BAR (Requirement #1 & Image 4)
         ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-30 p-3 max-w-xl mx-auto w-full pointer-events-auto space-y-2.5">
        {/* Floating Speedometer (Bottom-Left) matching Image 4 */}
        <div className="flex items-center justify-between">
          {/* Black circle with crisp white ring (Image 4) */}
          <div className="w-16 h-16 rounded-full bg-[#0A0E14]/90 backdrop-blur-md border-3 border-white shadow-[0_8px_25px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center text-white">
            <span className="text-2xl font-black leading-none">{currentSpeed}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">km/h</span>
          </div>

          {/* Quick Offline Cache Status or Convoy Status Badge */}
          {!isOnline ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-300 text-xs font-bold">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline Navigation</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowConvoyModal(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border transition-all cursor-pointer ${
                hasMembersJoined
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              }`}
            >
              {hasMembersJoined ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Device X & Y Synced</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>External Telemetry Denied</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* ── Glassmorphic Bottom Navigation Bar with Centralized Action Buttons & Improved Elevation ── */}
        <div className="bg-[#0A0E14]/85 backdrop-blur-2xl rounded-3xl p-4 border border-white/10 shadow-[0_-16px_50px_rgba(0,0,0,0.85)] space-y-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Close / Exit Navigation Button (Elevated Rose Button) */}
            <button
              type="button"
              onClick={() => setShowEndModal(true)}
              className="w-12 h-12 rounded-full bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 flex items-center justify-center shadow-[0_6px_20px_rgba(244,63,94,0.3)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              title="End / Exit Navigation"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Center: ETA & Eco Fuel Saving Route Card (Elevated center display) */}
            <div className="flex-1 text-center min-w-0 bg-white/5 py-1.5 px-3 rounded-2xl border border-white/5 shadow-inner">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-2xl font-black text-[#F87171] tracking-tight">
                  {currentStep.etaMin}
                </span>
                <span className="text-emerald-400 text-base" title="Eco-friendly fuel saving route">
                  🍃
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                {currentStep.remKm} • {currentStep.etaClock}
              </p>
            </div>

            {/* Right: Route Alternatives Split Icon (Elevated Cyan Button) */}
            <button
              type="button"
              onClick={() => {
                showToast('Rerouting: Checking live traffic updates on NH16');
              }}
              className="w-12 h-12 rounded-full bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 flex items-center justify-center shadow-[0_6px_20px_rgba(6,182,212,0.3)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              title="Alternative Routes"
            >
              <Split className="w-5 h-5 -rotate-90 text-cyan-300" />
            </button>
          </div>

          {/* Centralized Action Bar with Improved Elevation & Voice Control */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleReportHazard}
              className="py-2.5 px-2 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold transition-all border border-white/5 flex items-center justify-center gap-1 cursor-pointer shadow-xs"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Report</span>
            </button>

            <div className="flex items-center justify-center">
              <VoiceCommandListener
                onCommand={handleVoiceCommand}
                buttonSize="sm"
                showLabel={true}
                className="w-full h-full py-2 px-2 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 shadow-md font-bold text-[11px]"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowConvoyModal(true)}
              className="py-2.5 px-2 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-bold transition-all border border-white/5 flex items-center justify-center gap-1 cursor-pointer shadow-xs"
            >
              <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Members</span>
            </button>
          </div>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────
          CONVOY MEMBERS & JOIN VERIFICATION MODAL
          Requirement: "if anyone join the trip it's show the details otherwise denied the results."
         ───────────────────────────────────────────────────────────── */}
      {showConvoyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#101720] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-700/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h3 className="text-base font-bold text-white">Convoy Telemetry & Access</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConvoyModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {hasMembersJoined ? (
              /* [MEMBERS JOINED LAYOUT]: Show their verified live details */
              <div className="space-y-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>2 Devices Synchronized in Real-Time</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                    Authorized
                  </span>
                </div>

                {/* Device X (Organizer) */}
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-cyan-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-cyan-500 text-slate-900 font-bold flex items-center justify-center">
                      R
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{user?.name || 'Rohith'} (You)</p>
                      <p className="text-[10px] text-cyan-400">Organizer • Device X (Live GPS)</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">{currentSpeed} km/h</span>
                </div>

                {/* Device Y (Participant) */}
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center">
                      S
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Sumanth</p>
                      <p className="text-[10px] text-slate-400">Device Y • 10m ahead on NH16</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-cyan-300">Joined</span>
                </div>

                <div className="pt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSimulatedFriendJoined(false);
                      showToast('Simulated Device Y member disconnected');
                    }}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Disconnect Device Y
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy ID</span>
                  </button>
                </div>
              </div>
            ) : (
              /* [MEMBERS DENIED / NOT JOINED LAYOUT]: Access restricted per user requirement */
              <div className="space-y-3.5 text-center py-2">
                <div className="w-14 h-14 rounded-3xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Telemetry Access Restricted / Denied</h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    External viewers cannot see live convoy locations. Only participants who enter this trip’s unique ID from Device Y/Z are granted access.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-500 block uppercase">Secret Trip ID</span>
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {activeSharedTrip?.id || currentTripId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-bold hover:bg-cyan-500/30 transition-colors cursor-pointer"
                  >
                    {copied ? 'Copied!' : 'Copy ID'}
                  </button>
                </div>

                {/* Simulate Device Y joining for testing */}
                <button
                  type="button"
                  onClick={handleSimulateFriendJoin}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-900/40 transition-all cursor-pointer transform hover:scale-[1.02]"
                >
                  ✓ Simulate Friend Joining (Device Y)
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowConvoyModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-2xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CHANGE DESTINATION MODAL
         ───────────────────────────────────────────────────────────── */}
      {showDestModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleDestinationSubmit}
            className="bg-[#121B24] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-700 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Change Destination</h3>
              <button
                type="button"
                onClick={() => setShowDestModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Updating destination syncs across all joined devices in real time.
            </p>

            <input
              type="text"
              placeholder="e.g. Asif Nagar, Vijayawada, Gachibowli"
              value={newDestInput}
              onChange={(e) => setNewDestInput(e.target.value)}
              className="w-full px-4 py-3 bg-[#1A2634] border border-slate-700 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              autoFocus
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowDestModal(false)}
                className="flex-1 py-3 rounded-2xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-2xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500 shadow-lg shadow-cyan-600/30"
              >
                Update Everywhere
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          END NAVIGATION CONFIRMATION MODAL
         ───────────────────────────────────────────────────────────── */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121B24] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-700 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <StopCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">End Navigation?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Ending navigation stops live GPS tracking and completes the trip. All destination states and route overlays will be reset cleanly.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
              >
                Keep Navigating
              </button>
              <button
                type="button"
                onClick={handleEndNavigationConfirm}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-rose-600/30 transition-colors cursor-pointer"
              >
                End & Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
