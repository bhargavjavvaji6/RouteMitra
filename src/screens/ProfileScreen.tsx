import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Pencil,
  ChevronDown,
  Shield,
  EyeOff,
  Home as HomeIcon,
  Briefcase,
  Dumbbell,
  Building,
  MapPin,
  Users,
  Clock,
  LogOut,
  Check,
  Copy,
  Plus,
  Compass,
  Calendar,
  Lock,
  Sparkles,
  Navigation,
} from 'lucide-react';
import { useTrip } from '../context/TripContext';

export interface ProfileScreenProps {
  initialSection?: 'overview' | 'members' | 'history';
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ initialSection = 'overview' }) => {
  const {
    user,
    updateUserName,
    savedPlaces,
    updateSavedPlace,
    isIncognito,
    toggleIncognito,
    members,
    addMember,
    trips,
    signOut,
    navigateTo,
    goBack,
    showToast,
    copyTripId,
    currentTripId,
  } = useTrip();

  // Edit Name Modal State (Change Name ONLY - Requirement 5)
  const [showEditNameModal, setShowEditNameModal] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(user?.name || 'Bhargav sai Javvaji');

  // Edit Saved Location Modal State
  const [editingPlaceId, setEditingPlaceId] = useState<'home' | 'office' | 'gym' | 'hostel' | null>(null);
  const [placeAddressInput, setPlaceAddressInput] = useState<string>('');

  // Add Member Modal State
  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false);
  const [newMemberName, setNewMemberName] = useState<string>('');

  // Active view tab inside profile ('overview' | 'members' | 'history')
  const [activeSection, setActiveSection] = useState<'overview' | 'members' | 'history'>(initialSection);

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyId = () => {
    copyTripId();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    updateUserName(nameInput.trim());
    setShowEditNameModal(false);
  };

  const handleOpenEditPlace = (id: 'home' | 'office' | 'gym' | 'hostel', currentAddr: string) => {
    setEditingPlaceId(id);
    setPlaceAddressInput(currentAddr);
  };

  const handleSavePlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlaceId || !placeAddressInput.trim()) return;
    updateSavedPlace(editingPlaceId, placeAddressInput.trim());
    setEditingPlaceId(null);
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    addMember(newMemberName.trim());
    setNewMemberName('');
    setShowAddMemberModal(false);
  };

  const getPlaceIcon = (id: string) => {
    switch (id) {
      case 'home':
        return <HomeIcon className="w-5 h-5 text-emerald-600" />;
      case 'office':
        return <Briefcase className="w-5 h-5 text-blue-600" />;
      case 'gym':
        return <Dumbbell className="w-5 h-5 text-amber-600" />;
      case 'hostel':
        return <Building className="w-5 h-5 text-purple-600" />;
      default:
        return <MapPin className="w-5 h-5 text-rose-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-800 flex flex-col pb-28 relative select-none">
      {/* ── Top Header Bar ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-slate-200/80 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => goBack()}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Your Profile</h1>
            <p className="text-xs text-slate-500">Account & Convoy Settings</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyId}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-xs"
          title="Copy Convoy ID"
        >
          <span>{currentTripId || 'RM-482913'}</span>
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
        </button>
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 pt-5 space-y-4">
        {/* ── Google Luxury Profile Card (Matches WhatsApp_Image_2026-10-29_at_10.18.44_PM_fb379a66.jpeg) ── */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 transition-all">
          <div className="flex items-center justify-between gap-3">
            {/* Avatar with Circular Gradient Border and Pencil Badge */}
            <div className="relative shrink-0">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full p-[3px] bg-gradient-to-tr from-[#3B82F6] via-[#60A5FA] to-[#93C5FD] shadow-md flex items-center justify-center">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100">
                  <img
                    src={user?.avatar || '/assets/aistudio/image_3d1745ac.png'}
                    alt={user?.name || 'Bhargav'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        '/assets/bhargav_avatar_clean.jpg';
                    }}
                  />
                </div>
              </div>

              {/* Edit Pencil Button (Change Name ONLY - Requirement 5) */}
              <button
                type="button"
                onClick={() => {
                  setNameInput(user?.name || 'Bhargav sai Javvaji');
                  setShowEditNameModal(true);
                }}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white text-slate-800 shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-100 hover:scale-105 transition-all cursor-pointer"
                title="Edit name only"
              >
                <Pencil className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0 pl-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
                  {user?.name || 'Bhargav sai Javvaji'}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 truncate font-normal mt-0.5">
                {user?.email || 'bhargavjavvaji6@gmail.com'}
              </p>

              {/* Pro Badge */}
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#DBEAFE] to-[#E0E7FF] text-[#1E40AF] border border-[#BFDBFE] shadow-2xs">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span>Pro</span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Verified Convoy Lead</span>
              </div>
            </div>

            {/* Down Chevron Button */}
            <button
              type="button"
              onClick={() => {
                setNameInput(user?.name || 'Bhargav sai Javvaji');
                setShowEditNameModal(true);
              }}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Profile Options"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Google Multi-Pill Action 1: Manage your Google Account (Matches Image 3) ── */}
        <button
          type="button"
          onClick={() => {
            showToast('Opening Google Account credentials and security dashboard');
          }}
          className="w-full bg-white rounded-full py-3.5 px-6 shadow-xs border border-slate-200/80 flex items-center gap-3.5 hover:bg-slate-50 transition-colors cursor-pointer text-left"
        >
          {/* Multi-color Google G Icon */}
          <div className="w-6 h-6 shrink-0 flex items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold text-slate-800 tracking-tight">
            Manage your Google Account
          </span>
        </button>

        {/* ── Google Multi-Pill Action 2: Turn on Incognito mode (Matches Image 3) ── */}
        <button
          type="button"
          onClick={toggleIncognito}
          className={`w-full rounded-full py-3.5 px-6 shadow-xs border transition-all flex items-center justify-between cursor-pointer ${
            isIncognito
              ? 'bg-slate-900 border-slate-900 text-white'
              : 'bg-white border-slate-200/80 text-slate-800 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3.5">
            {/* Incognito Icon (Glasses & Fedora) */}
            <div className={`w-6 h-6 shrink-0 flex items-center justify-center ${isIncognito ? 'text-amber-400' : 'text-slate-800'}`}>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2a5 5 0 0 0-4.9 4H3a1 1 0 0 0 0 2h1.1l1.8 7.3A3.5 3.5 0 0 0 9.3 18h5.4a3.5 3.5 0 0 0 3.4-2.7L19.9 8H21a1 1 0 0 0 0-2h-4.1A5 5 0 0 0 12 2zm0 2c1.7 0 3 1.3 3 3H9c0-1.7 1.3-3 3-3zm-4.5 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm9 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight">
              {isIncognito ? 'Incognito mode is ON (Location Hidden)' : 'Turn on Incognito mode'}
            </span>
          </div>

          <span
            className={`text-xs px-2.5 py-1 rounded-full font-bold ${
              isIncognito ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {isIncognito ? 'Active' : 'Off'}
          </span>
        </button>

        {/* ── Section Switcher: Overview / Members / History (Moved from Dashboard - Req 3) ── */}
        <div className="bg-slate-200/70 p-1 rounded-2xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveSection('overview')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'overview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Locations & Info
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('members')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSection === 'members'
                ? 'bg-white text-[#7C3AED] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Members ({members.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('history')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSection === 'history'
                ? 'bg-white text-amber-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </div>

        {/* ── TAB 1: SAVED LOCATIONS (Home, Office, Gym, Hostel - Requirement 5) ── */}
        {activeSection === 'overview' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Saved Locations</h3>
                <p className="text-xs text-slate-500">Quickly route to your frequent stops</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedPlaces.map((place) => (
                <div
                  key={place.id}
                  className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col justify-between gap-3 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 shadow-2xs">
                        {getPlaceIcon(place.id)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 capitalize">{place.label}</h4>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                          Active Pin
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenEditPlace(place.id, place.address)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      title={`Edit ${place.label} location`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded-xl border border-slate-100 font-medium">
                    {place.address}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      showToast(`Routing to ${place.label}: ${place.address}`);
                      navigateTo('google-maps');
                    }}
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#087F5B]" />
                    <span>Route to {place.label}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 2: MEMBERS SECTION (Moved from Dashboard - Requirement 3) ── */}
        {activeSection === 'members' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Convoy Members</h3>
                <p className="text-xs text-slate-500">Active participants in your shared trip</p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddMemberModal(true)}
                className="px-3 py-1.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <img
                        src={member.avatarImg || member.avatarColor || '/assets/bhargav_avatar_clean.jpg'}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-slate-900">{member.name}</p>
                        {member.isOrganizer && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                            Lead
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {member.locationName || 'Vijayawada Highway'} • ETA: {member.eta || 'Live'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-block text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
                      {member.distance || '0 km'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: HISTORY SECTION (Moved from Dashboard - Requirement 3) ── */}
        {activeSection === 'history' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Trip History</h3>
                <p className="text-xs text-slate-500">Your completed convoy journeys</p>
              </div>

              <span className="text-xs font-semibold text-slate-500">{trips.length} Trips</span>
            </div>

            <div className="space-y-2.5">
              {trips.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {item.date} • {item.membersCount} participants
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-semibold text-slate-600">{item.distance}</span>
                        <span className="text-[11px] text-slate-400">•</span>
                        <span className="text-[11px] font-semibold text-slate-600">{item.duration}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Sign Out & Account Actions ── */}
        <div className="pt-2">
          <button
            type="button"
            onClick={signOut}
            className="w-full bg-white rounded-2xl py-3 px-4 border border-rose-200 text-rose-600 font-bold text-xs hover:bg-rose-50 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of RouteMitra</span>
          </button>
        </div>
      </main>

      {/* ── Modal: Edit Name ONLY (Feature Requirement 5) ── */}
      {showEditNameModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Profile Name</h3>
                <p className="text-xs text-slate-500">Only display name can be changed</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditNameModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveName} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-emerald-600 font-normal">(Editable)</span>
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#087F5B] focus:ring-2 focus:ring-[#087F5B]/10"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Email Address (Protected)</span>
                </label>
                <input
                  type="email"
                  value={user?.email || 'bhargavjavvaji6@gmail.com'}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-medium text-slate-500 cursor-not-allowed select-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Convoy ID (Permanent)</span>
                </label>
                <input
                  type="text"
                  value={currentTripId || 'RM-482913'}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-mono font-medium text-slate-500 cursor-not-allowed select-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditNameModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#087F5B] hover:bg-[#064E3B] text-white text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer"
                >
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Edit Saved Location (Home, Office, Gym, Hostel - Requirement 5) ── */}
      {editingPlaceId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 capitalize">
                  Edit {editingPlaceId} Location
                </h3>
                <p className="text-xs text-slate-500">Set address for quick convoy navigation</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingPlaceId(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlace} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location Address / Landmark
                </label>
                <textarea
                  rows={3}
                  value={placeAddressInput}
                  onChange={(e) => setPlaceAddressInput(e.target.value)}
                  placeholder={`Enter ${editingPlaceId} address...`}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:border-[#087F5B] focus:ring-2 focus:ring-[#087F5B]/10 resize-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingPlaceId(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#087F5B] hover:bg-[#064E3B] text-white text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Add Member ── */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Convoy Member</h3>
                <p className="text-xs text-slate-500">Invite a friend to your journey</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Member Name
                </label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10"
                  autoFocus
                />
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Curved Bottom Navigation Dock ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-5px_25px_rgba(0,0,0,0.06)] px-4 py-2">
        <div className="max-w-md mx-auto flex items-center justify-between relative">
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="flex flex-col items-center gap-1 py-1 px-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold">Home</span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('google-maps')}
            className="flex flex-col items-center gap-1 py-1 px-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] font-bold">Map</span>
          </button>

          {/* Elevated Floating (+) Action Button in Center */}
          <div className="relative -top-5">
            <button
              type="button"
              onClick={() => navigateTo('start-trip')}
              className="w-13 h-13 rounded-full bg-[#087F5B] hover:bg-[#064E3B] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(8,127,91,0.4)] border-4 border-white transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              title="Start Trip"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setActiveSection('history')}
            className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors cursor-pointer ${
              activeSection === 'history' ? 'text-amber-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] font-bold">Trips</span>
          </button>

          <button
            type="button"
            className="flex flex-col items-center gap-1 py-1 px-3 text-[#087F5B] transition-colors cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full overflow-hidden border border-[#087F5B]">
              <img src={user?.avatar || '/assets/aistudio/image_3d1745ac.png'} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <span className="text-[10px] font-bold">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
