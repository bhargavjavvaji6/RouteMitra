import React, { useState } from 'react';
import {
  ArrowLeft,
  Users,
  UserPlus,
  Car,
  Search,
  X,
  Share2,
  Circle,
  ArrowUp,
  ArrowDown,
  Shield,
  Copy,
  Check,
  Radio,
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { TripMember } from '../types';

export const MembersListScreen: React.FC = () => {
  const {
    members,
    addMember,
    goBack,
    showToast,
    navigateTo,
    activeSharedTrip,
    currentTripId,
    isTripActive,
    liveLocationSharingActive,
    copyTripId,
  } = useTrip();

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberName.trim()) {
      addMember(newMemberName.trim());
      setNewMemberName('');
      setShowAddModal(false);
    }
  };

  const handleCopy = () => {
    copyTripId();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B131C] text-white flex flex-col pb-24 select-none">
      {/* ── Top Header (Matching Image 1 Screen 6) ── */}
      <header className="sticky top-0 z-20 bg-[#0B131C]/95 backdrop-blur-xl px-4 sm:px-6 py-4 border-b border-[#243447]/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => goBack()}
            className="p-2 rounded-xl bg-[#16222F] border border-[#27384A] text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-white">Members ({members.length})</h1>
          </div>
        </div>

        {/* Share Trip ID button */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#16222F] border border-[#27384A] text-white/80 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
          title="Share Trip ID"
        >
          <span className="font-mono text-emerald-400 font-bold">
            {activeSharedTrip?.id || currentTripId}
          </span>
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </header>

      {/* ── Privacy Status Notice (Requirement #2) ── */}
      <div className="max-w-xl w-full mx-auto px-4 pt-3">
        {isTripActive && liveLocationSharingActive ? (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold">Live Convoy Active</span>
              <span className="text-white/50">• GPS sharing active for trip</span>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('google-maps')}
              className="text-[11px] underline text-emerald-400 font-semibold"
            >
              View on Map
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-white">Trip Ended • Location Sharing Ceased</p>
              <p className="text-[11px] text-slate-400">
                Live distances, speeds, and real-time member locations are permanently hidden.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Search Input ── */}
      <div className="max-w-xl w-full mx-auto px-4 pt-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search convoy members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#16222F] border border-[#27384A] rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#34D399] transition-colors"
          />
        </div>
      </div>

      {/* ── Members List (Matching Image 1 Screen 6) ── */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 space-y-3">
        {filteredMembers.map((member: TripMember) => {
          const isOrganizer = member.isOrganizer;

          return (
            <div
              key={member.id}
              className={`p-4 rounded-2xl bg-[#16222F] border transition-all flex items-center justify-between gap-3 shadow-sm ${
                isOrganizer ? 'border-[#087F5B]/50' : 'border-[#27384A]'
              }`}
            >
              {/* Member Avatar */}
              <div className="flex items-center gap-3.5">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-white/10 shrink-0 bg-[#202E3E]">
                  {member.avatarImg ? (
                    <img
                      src={member.avatarImg}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center font-bold text-base text-white"
                      style={{ backgroundColor: member.avatarColor || '#34D399' }}
                    >
                      {member.name.charAt(0)}
                    </div>
                  )}

                  {/* Status Indicator Dot (Only active while trip is live) */}
                  {isTripActive && liveLocationSharingActive && (
                    <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-[#34D399] ring-2 ring-[#16222F]" />
                  )}
                </div>

                {/* Name & Distance Tag */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{member.name}</h3>
                    {isOrganizer && (
                      <span className="px-2 py-0.5 rounded-md bg-[#087F5B]/30 border border-[#34D399]/40 text-[10px] font-bold text-[#34D399]">
                        Organizer
                      </span>
                    )}
                  </div>

                  {/* CRITICAL PRIVACY: Live distance and location are ONLY displayed while trip is active! */}
                  {isTripActive && liveLocationSharingActive ? (
                    <div className="flex items-center gap-2 mt-1">
                      {member.distance && (
                        <span className="text-xs font-semibold text-emerald-400">
                          {member.distance}
                        </span>
                      )}
                      {member.eta && (
                        <>
                          <span className="text-white/20">•</span>
                          <span className="text-xs text-white/50">ETA: {member.eta}</span>
                        </>
                      )}
                      {member.locationName && (
                        <span className="text-[10px] text-white/40 font-mono">
                          ({member.locationName})
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
                      <span>Trip Completed</span>
                      <span className="text-white/20">•</span>
                      <span className="text-emerald-400/80">Location Stopped</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Trailing Icon (Car / Check) */}
              <div className="shrink-0">
                {isTripActive && liveLocationSharingActive ? (
                  <div className="p-2.5 rounded-xl bg-[#202E3E] text-[#34D399]">
                    <Car className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                    <Shield className="w-4 h-4 text-emerald-500/60" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Member Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#16222F] hover:bg-[#202E3E] border border-dashed border-[#34D399]/40 text-[#34D399] font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Member</span>
          </button>
        </div>
      </main>

      {/* ── Add Member Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#16222F] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#27384A] relative">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Add Convoy Member</h3>
            <p className="text-xs text-white/50 mb-4">
              Enter participant name to add them to your active convoy trip.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Member name..."
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B131C] border border-[#27384A] rounded-2xl text-sm font-medium text-white placeholder-white/40 focus:outline-none focus:border-[#34D399]"
                autoFocus
              />

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-[#202E3E] text-white text-sm font-bold rounded-2xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#087F5B] hover:bg-[#064E3B] text-white text-sm font-bold rounded-2xl shadow-md cursor-pointer"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
