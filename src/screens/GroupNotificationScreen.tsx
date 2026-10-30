import React from 'react';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Eye,
  SlidersHorizontal,
  Star,
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { GroupNotification } from '../types';

export const GroupNotificationScreen: React.FC = () => {
  const {
    notifications,
    approveNotification,
    denyNotification,
    goBack,
    showToast,
    navigateTo,
  } = useTrip();

  return (
    <div className="min-h-screen bg-[#0B131C] text-white flex flex-col pb-12">
      {/* ── Top Header (Matching Image 1 Screen 7) ── */}
      <header className="sticky top-0 z-20 bg-[#0B131C]/95 backdrop-blur-xl px-4 sm:px-6 py-4 border-b border-[#243447]/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => goBack()}
            className="p-2 rounded-xl bg-[#16222F] border border-[#27384A] text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-black text-white">Place Request</h1>
          </div>
        </div>

        <button
          type="button"
          onClick={() => showToast('Filters: All convoy requests')}
          className="p-2 rounded-xl bg-[#16222F] border border-[#27384A] text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </header>

      {/* ── Notifications List ── */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 space-y-4">
        {notifications.map((notif: GroupNotification) => {
          const isPending = !notif.isApproved && !notif.isDenied;

          return (
            <div
              key={notif.id}
              className="p-4 rounded-3xl bg-[#16222F] border border-[#27384A] shadow-xl space-y-3"
            >
              {/* Sender Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 bg-gray-700 shrink-0">
                    {notif.senderAvatar ? (
                      <img
                        src={notif.senderAvatar}
                        alt={notif.senderName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs">
                        {notif.senderName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">{notif.senderName}</span>
                    <span className="text-xs text-white/50 ml-1.5">
                      {notif.type === 'place_request'
                        ? 'suggested a place'
                        : 'suggested a fuel stop'}
                    </span>
                    <p className="text-[10px] text-white/40">{notif.timeAgo || 'Just now'}</p>
                  </div>
                </div>
              </div>

              {/* Photo Thumbnail (Matching Image 1 Screen 7) */}
              {notif.image && (
                <div className="w-full h-36 rounded-2xl overflow-hidden relative shadow-md">
                  <img
                    src={notif.image}
                    alt={notif.title}
                    className="w-full h-full object-cover brightness-[0.9]"
                  />
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    4.3
                  </div>
                </div>
              )}

              {/* Place Info */}
              <div>
                <h3 className="text-base font-extrabold text-white">{notif.title}</h3>
                <div className="flex items-center gap-2 text-xs text-white/60 mt-0.5">
                  <span className="text-amber-400 font-bold">★ 3.5 km from route</span>
                  <span>•</span>
                  <span>{notif.subtitle}</span>
                </div>
              </div>

              {/* Actions: View, Deny, Approve (Matching Image 1 Screen 7) */}
              {isPending ? (
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      showToast(`Viewing ${notif.title} on Google Maps...`);
                      navigateTo('google-maps');
                    }}
                    className="py-2.5 px-3 rounded-xl bg-[#202E3E] hover:bg-[#2A3C50] border border-[#2D3E52] text-xs font-bold text-white/90 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </button>

                  <button
                    type="button"
                    onClick={() => denyNotification(notif.id)}
                    className="py-2.5 px-3 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-xs font-bold text-white flex items-center justify-center transition-colors cursor-pointer shadow"
                  >
                    Deny
                  </button>

                  <button
                    type="button"
                    onClick={() => approveNotification(notif.id)}
                    className="py-2.5 px-3 rounded-xl bg-[#087F5B] hover:bg-[#064E3B] text-xs font-bold text-white flex items-center justify-center transition-colors cursor-pointer shadow"
                  >
                    Approve
                  </button>
                </div>
              ) : (
                <div className="pt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                      notif.isApproved
                        ? 'bg-[#087F5B]/20 text-[#34D399] border border-[#34D399]/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {notif.isApproved ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approved by Convoy
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        Denied
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
};
