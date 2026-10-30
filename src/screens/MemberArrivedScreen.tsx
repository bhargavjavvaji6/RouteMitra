import React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Car,
  Clock,
  Radio,
  Sparkles,
} from 'lucide-react';
import { useTrip } from '../context/TripContext';

interface ArrivalItem {
  id: string;
  name: string;
  actionText: string;
  subtext?: string;
  timeAgo: string;
  avatarUrl: string;
  isLiveLocation?: boolean;
  isAllCompleted?: boolean;
}

export const MemberArrivedScreen: React.FC = () => {
  const { goBack, navigateTo } = useTrip();

  const arrivals: ArrivalItem[] = [
    {
      id: 'a1',
      name: 'Rohith',
      actionText: 'reached the destination 🎉',
      timeAgo: '1 min ago',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    },
    {
      id: 'a2',
      name: 'Sumanth',
      actionText: 'reached the destination',
      timeAgo: '3 mins ago',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    },
    {
      id: 'a3',
      name: 'Karthik',
      actionText: 'is 5 km away',
      subtext: 'ETA: 8 mins',
      timeAgo: 'Just now',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      isLiveLocation: true,
    },
    {
      id: 'a4',
      name: 'All members',
      actionText: 'have reached the destination!',
      subtext: 'Trip will be closed automatically.',
      timeAgo: '2 mins ago',
      avatarUrl: '',
      isAllCompleted: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F1923] text-white flex flex-col select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-[#0F1923]/95 backdrop-blur-md px-4 sm:px-6 py-4 border-b border-[#2D3D4F] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => goBack()}
            className="p-2 rounded-xl bg-[#1A2633] border border-[#2D3D4F] text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white">Member Arrivals</h1>
            <p className="text-xs text-white/50">Real-time arrival feed</p>
          </div>
        </div>

        {/* Real-time Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#34D399]/15 border border-[#34D399]/30 text-[#34D399] text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-[#34D399] animate-ping" />
          Live Convoy
        </div>
      </header>

      {/* Main Feed (Matches Image 1 Screen 13) */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 space-y-3">
        {arrivals.map((item) => {
          if (item.isAllCompleted) {
            return (
              <div
                key={item.id}
                onClick={() => navigateTo('completion')}
                className="p-4 rounded-3xl bg-[#087F5B]/15 border-2 border-[#34D399]/50 shadow-xl flex items-center gap-3.5 cursor-pointer hover:bg-[#087F5B]/20 transition-all"
              >
                {/* Large Check Circle */}
                <div className="w-12 h-12 rounded-2xl bg-[#087F5B] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#087F5B]/40">
                  <CheckCircle2 className="w-6 h-6 text-[#34D399]" />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">
                    <span className="font-black text-[#34D399]">{item.name}</span>{' '}
                    {item.actionText}
                  </p>
                  <p className="text-xs text-white/60 mt-0.5">{item.subtext}</p>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-white/40">
                    <Clock className="w-3 h-3" />
                    <span>{item.timeAgo}</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-[#087F5B]/30 text-[#34D399]">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              className="p-4 rounded-3xl bg-[#1A2633] border border-[#2D3D4F] flex items-center gap-3.5 hover:border-white/20 transition-all shadow-md"
            >
              {/* Member Avatar */}
              <div className="relative shrink-0">
                <img
                  src={item.avatarUrl}
                  alt={item.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-[#34D399]/40 shadow"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#34D399] border-2 border-[#1A2633]" />
              </div>

              {/* Text info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-black text-white">{item.name}</span>{' '}
                  <span className="text-white/80">{item.actionText}</span>
                </p>

                {item.subtext && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-amber-400">{item.subtext}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-[#34D399]/30 text-[#34D399] text-[10px] font-bold">
                      <Radio className="w-2.5 h-2.5 animate-pulse" />
                      Live location
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-white/40">
                  <Clock className="w-3 h-3" />
                  <span>{item.timeAgo}</span>
                </div>
              </div>

              {/* Trailing Icon (Car for in-transit, Check for arrived) */}
              <div className="shrink-0">
                {item.isLiveLocation ? (
                  <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
                    <Car className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="p-2.5 rounded-2xl bg-[#087F5B]/20 text-[#34D399] border border-[#34D399]/20">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};
