import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, CheckCircle2, ChevronDown, ChevronUp, Database } from 'lucide-react';
import { useTrip } from '../context/TripContext';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, trips, activeTrip } = useTrip();
  const [showReconnectedBanner, setShowReconnectedBanner] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [wasOffline, setWasOffline] = useState<boolean>(!isOnline);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      // Just reconnected
      setShowReconnectedBanner(true);
      const timer = setTimeout(() => {
        setShowReconnectedBanner(false);
        setWasOffline(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // If online and not in reconnected banner, render nothing
  if (isOnline && !showReconnectedBanner) {
    return null;
  }

  // Reconnected Toast
  if (isOnline && showReconnectedBanner) {
    return (
      <aside aria-label="Connection Status" className="fixed top-12 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm transition-all duration-300">
        <div className="bg-[#064E3B]/95 backdrop-blur-md border border-emerald-500/50 text-white rounded-2xl px-4 py-2.5 shadow-xl flex items-center justify-between gap-3 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Back Online — Convoy sync connected</span>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
        </div>
      </aside>
    );
  }

  // Offline Mode Banner
  return (
    <aside aria-label="Offline Mode" className="fixed top-12 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm transition-all duration-300 select-none">
      <div className="bg-[#1E1B4B]/95 backdrop-blur-md border border-amber-400/40 text-amber-200 rounded-2xl shadow-2xl p-3 text-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
              <WifiOff className="w-4 h-4 animate-pulse" />
            </span>
            <div>
              <p className="font-bold text-white text-[13px] leading-tight">
                Offline Mode Active
              </p>
              <p className="text-[11px] text-amber-200/80 leading-tight">
                Navigation & Profile History cached
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
              Local Storage
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="p-1 rounded-lg text-amber-300 hover:bg-white/10 transition-colors cursor-pointer"
              title="Toggle offline details"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Diagnostics */}
        {isExpanded && (
          <div className="mt-2.5 pt-2.5 border-t border-amber-400/20 space-y-1.5 text-[11px] text-slate-200">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-amber-100">
                <Database className="w-3 h-3 text-amber-400" />
                <span>Profile Trips History:</span>
              </span>
              <span className="font-bold text-white">{trips.length} journeys available</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-amber-100">Active Navigation:</span>
              <span className="font-bold text-white truncate max-w-[170px]">
                {activeTrip?.destination || 'Offline route ready'}
              </span>
            </div>

            <p className="text-[10px] text-amber-300/70 pt-1">
              • Turn-by-turn guidance and saved locations work without network.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
