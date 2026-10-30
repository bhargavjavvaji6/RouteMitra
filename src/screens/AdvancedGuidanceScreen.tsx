import React, { useState } from 'react';
import {
  ArrowLeft,
  CornerDownLeft,
  CornerUpRight,
  GitMerge,
  Compass,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useTrip } from '../context/TripContext';

interface GuidanceStep {
  distance: string;
  instruction: string;
  subtext?: string;
  type: 'under' | 'over' | 'merge';
}

export const AdvancedGuidanceScreen: React.FC = () => {
  const { goBack, completeTrip, showToast, navigateTo } = useTrip();
  const [isMuted, setIsMuted] = useState(false);

  const steps: GuidanceStep[] = [
    {
      distance: '300 m',
      instruction: 'Keep left and take the service road under the flyover',
      subtext: 'Go under the flyover and take left',
      type: 'under',
    },
    {
      distance: '1.2 km',
      instruction: 'Take the elevated ramp onto NH16 Express corridor',
      subtext: 'Stay on right two lanes over the bridge',
      type: 'over',
    },
    {
      distance: '3.4 km',
      instruction: 'Merge smoothly into center lane after toll plaza',
      subtext: 'FASTag lane active',
      type: 'merge',
    },
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const activeStep = steps[currentStepIndex];

  const handleNextStep = () => {
    setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : 0));
    showToast('Guidance updated for next highway interchange');
  };

  return (
    <div className="relative w-full h-screen bg-[#0A121A] text-white overflow-hidden select-none flex flex-col justify-between">
      {/* ── Highway 3D Perspective Canvas with Flyover Structure ── */}
      <div className="absolute inset-0 z-0">
        {/* Sky / Sunset gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1C2C3D] via-[#2A3E52] to-[#121B24]" />

        {/* Distant Hills / Horizon */}
        <div className="absolute top-[32%] left-0 right-0 h-16 opacity-30 bg-[radial-gradient(ellipse_at_top,#38BDF8_0%,transparent_70%)]" />

        {/* Realistic Highway Flyover Concrete Structure (Matches Image 1 Screen 10) */}
        <div className="absolute top-[28%] left-[-10%] right-[-10%] h-28 transform -rotate-3 z-10">
          {/* Concrete Bridge Deck */}
          <div className="w-full h-12 bg-gradient-to-b from-[#4A5D6E] via-[#374756] to-[#25323E] border-b-4 border-[#1E2933] shadow-[0_15px_30px_rgba(0,0,0,0.8)] relative flex items-center justify-between px-12">
            {/* Safety railings */}
            <div className="absolute -top-3 left-0 right-0 h-3 border-t-2 border-white/40 flex justify-between px-6 opacity-60">
              <span className="text-[9px] font-mono tracking-widest text-white/50 uppercase">NH16 ELEVATED FLYOVER</span>
              <span className="text-[9px] font-mono tracking-widest text-white/50 uppercase">VIJAYAWADA BYPASS</span>
            </div>
            {/* Vehicle silhouettes on flyover */}
            <div className="w-6 h-3 bg-red-400/80 rounded-sm shadow-sm" />
            <div className="w-8 h-4 bg-white/70 rounded-sm shadow-sm" />
          </div>

          {/* Heavy Concrete Pillar Columns supporting the flyover */}
          <div className="w-full flex justify-around px-8 mt-[-2px]">
            <div className="w-10 h-64 bg-gradient-to-r from-[#2B3945] via-[#475A6C] to-[#1E2832] shadow-2xl rounded-b-md" />
            <div className="w-12 h-64 bg-gradient-to-r from-[#2B3945] via-[#475A6C] to-[#1E2832] shadow-2xl rounded-b-md" />
            <div className="w-10 h-64 bg-gradient-to-r from-[#2B3945] via-[#475A6C] to-[#1E2832] shadow-2xl rounded-b-md" />
          </div>
        </div>

        {/* Lower Ground Road Perspective (Perspective vanishing to horizon under flyover) */}
        <svg
          className="absolute inset-0 w-full h-full z-0"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Road Asphalt Gradient */}
            <linearGradient id="asphaltGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1C2731" />
              <stop offset="60%" stopColor="#15202B" />
              <stop offset="100%" stopColor="#0E161E" />
            </linearGradient>

            {/* Glowing Navigation Route Cyan */}
            <linearGradient id="navGuidanceGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="40%" stopColor="#00E5FF" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>

            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Road Surface Polygon */}
          <polygon points="120,290 320,290 480,900 -40,900" fill="url(#asphaltGrad)" />

          {/* Service road forking to the left (under the flyover) */}
          <polygon points="140,290 190,290 60,900 -120,900" fill="#18232D" />

          {/* Road Lane Lines */}
          <path d="M 220 290 L 220 900" stroke="#FFFFFF" strokeWidth="3" strokeDasharray="14 14" opacity="0.3" />
          <path d="M 160 290 L 100 900" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="12 12" opacity="0.4" />
          <path d="M 280 290 L 340 900" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="12 12" opacity="0.3" />

          {/* Neon Guidance Path (curves left into service lane under flyover) */}
          <path
            d="M 220 850 C 220 620, 190 460, 150 310"
            stroke="url(#navGuidanceGrad)"
            strokeWidth="18"
            fill="none"
            strokeLinecap="round"
            filter="url(#neonGlow)"
            opacity="0.85"
          />
          <path
            d="M 220 850 C 220 620, 190 460, 150 310"
            stroke="#ffffff"
            strokeWidth="4"
            strokeDasharray="8 8"
            fill="none"
            strokeLinecap="round"
          />

          {/* GPS Vehicle Marker */}
          <circle cx="220" cy="740" r="18" fill="rgba(52, 211, 153, 0.25)" />
          <circle cx="220" cy="740" r="10" fill="#087F5B" stroke="#34D399" strokeWidth="3" />
          <polygon points="220,732 225,745 220,742 215,745" fill="#ffffff" />
        </svg>

        {/* Ambient overlay shadows under the flyover */}
        <div className="absolute top-[32%] left-0 right-0 h-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />
      </div>

      {/* ── Top Guidance Banner (Matches Image 1 Screen 10) ── */}
      <header className="relative z-30 pt-4 px-4 max-w-lg mx-auto w-full">
        {/* Top green box with turn instruction */}
        <div
          onClick={handleNextStep}
          className="bg-[#087F5B] rounded-3xl p-4 sm:p-5 shadow-[0_12px_35px_rgba(8,127,91,0.5)] border border-[#34D399]/40 cursor-pointer active:scale-[0.99] transition-transform"
        >
          <div className="flex items-start gap-4">
            {/* Back button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goBack();
              }}
              className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white cursor-pointer transition-colors shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Turn Icon */}
            <div className="p-3 bg-white/20 rounded-2xl shrink-0 text-white flex items-center justify-center">
              <CornerDownLeft className="w-7 h-7 stroke-[3]" />
            </div>

            {/* Instruction Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {activeStep.distance}
                </span>
                <span className="text-[11px] text-emerald-100/70 font-semibold uppercase">
                  Service lane
                </span>
              </div>
              <p className="text-sm sm:text-base font-bold text-white mt-1 leading-snug">
                {activeStep.instruction}
              </p>
            </div>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
                showToast(isMuted ? 'Voice guidance resumed' : 'Voice guidance muted');
              }}
              className="p-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white cursor-pointer transition-colors shrink-0"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mid-Screen Floating Widgets (Matches Image 1 Screen 10) ── */}
      <div className="relative z-20 px-4 w-full max-w-lg mx-auto flex items-center justify-between pointer-events-none">
        {/* Speed Limit Indicator (60 km/h in red circular sign) */}
        <div className="pointer-events-auto w-16 h-16 rounded-full bg-white border-4 border-red-600 shadow-2xl flex flex-col items-center justify-center text-slate-900 font-black">
          <span className="text-lg leading-none tracking-tight">60</span>
          <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">km/h</span>
        </div>

        {/* Floating Guidance Badge: "Go under the flyover and take left" */}
        <div className="pointer-events-auto bg-[#1A2633]/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#34D399]/40 shadow-xl max-w-[200px] text-right">
          <p className="text-xs font-bold text-emerald-300">
            {activeStep.subtext || 'Go under the flyover and take left'}
          </p>
          <span className="text-[10px] text-white/50">Lane guidance</span>
        </div>
      </div>

      {/* ── Bottom Navigation Status Bar (Matches Image 1 Screen 10) ── */}
      <footer className="relative z-30 p-4 max-w-lg mx-auto w-full">
        <div className="bg-[#1A2633]/95 backdrop-blur-md rounded-3xl p-4 border border-[#2D3D4F] shadow-2xl flex items-center justify-between gap-4">
          {/* Trip ETA & Distance */}
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-white">5h 02m</span>
              <span className="text-xs text-white/50 font-bold">• 4:43 PM</span>
            </div>
            <p className="text-xs text-[#34D399] font-bold mt-0.5">362 km remaining on NH16</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View on real Google Maps */}
            <button
              type="button"
              onClick={() => navigateTo('google-maps')}
              className="p-3 bg-[#243447] hover:bg-[#2D3D4F] border border-[#2D3D4F] rounded-2xl text-[#34D399] transition-colors cursor-pointer"
              title="Switch to Real Google Map"
            >
              <Compass className="w-5 h-5" />
            </button>

            {/* End Trip button */}
            <button
              type="button"
              onClick={() => completeTrip()}
              className="px-5 py-3 bg-[#E11D48] hover:bg-[#BE123C] text-white font-black text-sm rounded-2xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            >
              End
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
