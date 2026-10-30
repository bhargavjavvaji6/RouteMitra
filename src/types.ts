export interface UserProfile {
  name: string;
  email: string;
  userId: string;
  avatar?: string;
  convoyId?: string;
}

export interface SavedPlace {
  id: 'home' | 'office' | 'gym' | 'hostel';
  label: string;
  address: string;
  isSet: boolean;
}

export type MemberStatus = 'live' | 'ahead' | 'behind' | 'arrived' | 'ended';

export interface TripMember {
  id: string;
  name: string;
  isOrganizer?: boolean;
  status?: MemberStatus;
  eta?: string;
  distance?: string;
  lat?: number;
  lng?: number;
  locationName?: string;
  avatarColor?: string;
  avatarImg?: string;
}

export interface SharedTrip {
  id: string; // e.g. "RM-482913"
  title: string;
  destination: string;
  organizerId: string;
  organizerName: string;
  createdAt: number;
  status: 'active' | 'completed' | 'ended';
  isPlanned?: boolean;
  peopleCount: number;
  endedBy?: string;
  endedReason?: string;
  endedAt?: number;
  participants: {
    userId: string;
    userName: string;
    isOrganizer: boolean;
    joinedAt: number;
    lat?: number;
    lng?: number;
    locationName?: string;
    distance?: string;
    eta?: string;
  }[];
}

export type PlaceCategory = 'petrol' | 'ev' | 'food' | 'all';

export interface NearbyPlace {
  id: string;
  name: string;
  category: PlaceCategory;
  address: string;
  distance: string;
  isOpen: boolean;
  openHours?: string;
  rating: number;
  phone?: string;
  lat?: number;
  lng?: number;
  image?: string;
}

export interface GroupNotification {
  id: string;
  senderName: string;
  senderAvatar?: string;
  type: 'place_request' | 'fuel_stop' | 'member_arrived' | 'destination_change' | 'trip_ended';
  title: string;
  subtitle?: string;
  distance?: string;
  timeAgo?: string;
  isApproved?: boolean;
  isDenied?: boolean;
  image?: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  source: 'spotify' | 'youtube' | 'device';
  durationSeconds: number;
  isPlaying?: boolean;
  albumArt?: string;
}

export interface GuidanceStep {
  distance: string;
  instruction: string;
  subtext?: string;
  type: 'under' | 'over' | 'turn-left' | 'turn-right' | 'straight' | 'merge';
}

export interface TripItem {
  id: string;
  title: string;
  destination: string;
  date: string;
  membersCount: number;
  distance: string;
  duration: string;
  status: 'active' | 'completed' | 'planned' | 'ended';
}
