import React, { useEffect, useState } from 'react';
import { useTrip } from '../context/TripContext';

export const SplashScreen: React.FC = () => {
  const { user, navigateTo } = useTrip();
  const [scale, setScale] = useState(0.85);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setScale(1);
      setOpacity(1);
    }, 100);

    const navTimer = setTimeout(() => {
      if (user && user.name && user.email) {
        navigateTo('home');
      } else {
        navigateTo('register');
      }
    }, 2800);

    return () => {
      clearTimeout(timer);
      clearTimeout(navTimer);
    };
  }, [user, navigateTo]);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden text-center select-none bg-[#0B131C]">
      {/* ── Background: Scenic Highway at Sunset (Matching Image 1 Screen 1) ── */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=1200&auto=format&fit=crop&q=80"
          alt="Sunset Highway"
          className="w-full h-full object-cover brightness-[0.7] contrast-[1.1]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B131C] via-[#0B131C]/60 to-black/40" />
      </div>

      {/* Top spacer */}
      <div className="relative z-10 pt-16" />

      {/* ── Center Brand & Logo ── */}
      <div
        className="relative z-10 flex flex-col items-center px-6 transition-all duration-700 ease-out"
        style={{ transform: `scale(${scale})`, opacity }}
      >
        {/* App Logo Icon from attached Image 2 */}
        <div className="relative mb-6">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(52,211,153,0.5)] border-2 border-[#34D399]/40 bg-[#0F1923] p-1 flex items-center justify-center">
            <img
              src="/assets/aistudio/Route_Mitra_Logo_69de06f0.jpeg"
              alt="RouteMitra Logo"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div className="absolute -inset-1 rounded-3xl bg-[#34D399]/20 blur-xl -z-10 animate-pulse" />
        </div>

        {/* Brand Name */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight flex items-center justify-center">
          <span className="text-white drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)]">Route</span>
          <span className="text-[#34D399] drop-shadow-[0_2px_15px_rgba(52,211,153,0.6)]">Mitra</span>
        </h1>

        <p className="mt-2.5 text-sm sm:text-base font-semibold tracking-wide text-white/85 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          Travel Together. Reach Together.
        </p>

        {/* Circular Progress Spinner */}
        <div className="mt-8 flex items-center justify-center">
          <div className="w-7 h-7 border-3 border-[#34D399]/25 border-t-[#34D399] rounded-full animate-spin" />
        </div>
      </div>

      {/* ── Bottom Section: App Icon Variations (Matching Image 1 Screen 1) ── */}
      <div className="relative z-10 pb-10 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3.5">
          {[
            { border: 'border-[#34D399]', bg: 'bg-[#0F1923]' },
            { border: 'border-[#F59E0B]', bg: 'bg-[#0F1923]' },
            { border: 'border-[#3B82F6]', bg: 'bg-[#0F1923]' },
            { border: 'border-[#10B981]', bg: 'bg-[#0F1923]' },
          ].map((style, i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-xl overflow-hidden border ${style.border} ${style.bg} p-0.5 shadow-lg transition-transform hover:scale-110 cursor-pointer`}
            >
              <img
                src="/assets/aistudio/Route_Mitra_Logo_69de06f0.jpeg"
                alt="RouteMitra Variant"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
        <p className="text-[11px] font-medium text-white/60 tracking-wider">App Icon Variations</p>
      </div>
    </div>
  );
};
