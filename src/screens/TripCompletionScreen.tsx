import React, { useState } from 'react';
import { Check, Compass } from 'lucide-react';
import { useTrip } from '../context/TripContext';

export const TripCompletionScreen: React.FC = () => {
  const { navigateTo } = useTrip();

  const [selectedRating, setSelectedRating] = useState<number>(0);
  const emojis = ['😟', '😕', '😐', '🙂', '😄'];
  const feedbackTexts = [
    '',
    "We'll do better!",
    'Thanks for the feedback',
    'Not bad!',
    'Glad you enjoyed it!',
    'Awesome! 🎉',
  ];

  const handleClose = () => {
    navigateTo('home');
  };

  return (
    <div className="min-h-screen bg-[#0F1923] text-white flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none">
      <div className="max-w-md w-full space-y-6">
        {/* Finish Flag Illustration with Confetti (Matches Image 1 Screen 12) */}
        <div className="flex justify-center relative">
          <div className="relative">
            {/* Confetti particles */}
            <div className="absolute -top-3 -left-4 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <div className="absolute -top-2 right-0 w-2.5 h-1.5 rotate-45 bg-pink-400" />
            <div className="absolute bottom-2 -left-6 w-3 h-1.5 -rotate-12 bg-blue-400" />
            <div className="absolute top-4 -right-6 w-2 h-2 rounded-full bg-emerald-400" />

            {/* Checkered Flag Graphic */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1A2E3E] to-[#111C24] border border-[#2D4559] flex items-center justify-center shadow-[0_10px_40px_rgba(52,211,153,0.3)]">
              <svg className="w-14 h-14" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Flag pole */}
                <line x1="12" y1="8" x2="12" y2="42" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
                <circle cx="12" cy="7" r="2.5" fill="#F59E0B" />
                {/* Checkered flag */}
                <rect x="12" y="8" width="8" height="6" fill="#FFFFFF" />
                <rect x="20" y="8" width="8" height="6" fill="#1E293B" />
                <rect x="28" y="8" width="8" height="6" fill="#FFFFFF" />
                <rect x="12" y="14" width="8" height="6" fill="#1E293B" />
                <rect x="20" y="14" width="8" height="6" fill="#FFFFFF" />
                <rect x="28" y="14" width="8" height="6" fill="#1E293B" />
                <rect x="12" y="20" width="8" height="6" fill="#FFFFFF" />
                <rect x="20" y="20" width="8" height="6" fill="#1E293B" />
                <rect x="28" y="20" width="8" height="6" fill="#FFFFFF" />
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-black text-white">All Members Reached!</h1>
          <p className="text-sm text-white/60 mt-2 leading-relaxed">
            Your group journey has been completed
            <br />
            successfully with all convoy buddies safe.
          </p>
        </div>

        {/* Trip Stats Card */}
        <div className="p-6 rounded-3xl bg-[#1A2633] border border-[#2D3D4F] shadow-xl space-y-4">
          <div className="grid grid-cols-2 divide-x divide-[#2D3D4F]">
            <div>
              <p className="text-2xl font-black text-white">3 / 3</p>
              <p className="text-xs text-white/50 mt-1">Members arrived</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#34D399]">5h 18m</p>
              <p className="text-xs text-white/50 mt-1">Total time</p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#2D3D4F] flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-white/60 text-xs font-semibold">
              <Compass className="w-4 h-4 text-[#34D399]" />
              <span>Distance</span>
            </div>
            <span className="text-lg font-black text-white">368 km</span>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="p-6 rounded-3xl bg-[#1A2633] border border-[#2D3D4F] shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white/80">How was your trip? (Optional)</h3>

          <div className="flex items-center justify-between px-2">
            {emojis.map((emoji, index) => {
              const rating = index + 1;
              const isSelected = selectedRating === rating;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedRating(rating)}
                  className={`w-13 h-13 rounded-2xl flex items-center justify-center text-2xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#087F5B]/30 border-2 border-[#34D399] scale-110 shadow-lg'
                      : 'bg-[#243447] border border-[#2D3D4F] hover:scale-105'
                  }`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>

          {selectedRating > 0 && (
            <p className="text-xs font-bold text-[#34D399] animate-fade-in">
              {feedbackTexts[selectedRating]}
            </p>
          )}
        </div>

        {/* Close Trip Button */}
        <div>
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-4 px-6 bg-[#087F5B] hover:bg-[#064E3B] text-white font-black text-base rounded-2xl shadow-xl shadow-[#087F5B]/30 transition-all cursor-pointer"
          >
            Close Trip
          </button>
        </div>
      </div>
    </div>
  );
};
