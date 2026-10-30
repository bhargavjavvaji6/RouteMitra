import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  UserProfile,
  TripMember,
  NearbyPlace,
  GroupNotification,
  MusicTrack,
  TripItem,
  SharedTrip,
} from '../types';

interface TripContextType {
  // Navigation
  currentScreen: string;
  navigateTo: (screen: string, options?: { isPlanned?: boolean }) => void;
  goBack: () => void;
  isPlannedTrip: boolean;

  // View frame mode (toggleable for desktop demo)
  phoneFrame: boolean;
  togglePhoneFrame: () => void;

  // User Profile & Auth
  user: UserProfile | null;
  updateUserName: (name: string) => void;
  savedPlaces: { id: 'home' | 'office' | 'gym' | 'hostel'; label: string; address: string; isSet: boolean }[];
  updateSavedPlace: (id: 'home' | 'office' | 'gym' | 'hostel', address: string) => void;
  isIncognito: boolean;
  toggleIncognito: () => void;
  registerUser: (name: string, email: string) => void;
  loginUser: (email: string) => boolean;
  loginWithSocial: (provider: 'google' | 'facebook' | 'instagram' | 'apple') => void;
  signOut: () => void;

  // Real-time Shared Trip & Join Trip Feature
  activeSharedTrip: SharedTrip | null;
  currentTripId: string;
  isTripActive: boolean;
  liveLocationSharingActive: boolean;
  createSharedTrip: (
    destination: string,
    peopleCount: number,
    isPlanned: boolean
  ) => Promise<{ success: boolean; tripId?: string; error?: string }>;
  joinTrip: (tripId: string) => Promise<{ success: boolean; error?: string }>;
  updateSharedDestination: (newDestination: string) => Promise<boolean>;
  endSharedTrip: (reason?: string) => Promise<void>;
  copyTripId: () => void;

  // Members
  members: TripMember[];
  addMember: (name: string) => void;

  // Nearby Places
  places: NearbyPlace[];
  addPlaceToTrip: (place: NearbyPlace) => void;

  // Group Notifications
  notifications: GroupNotification[];
  approveNotification: (id: string) => void;
  denyNotification: (id: string) => void;
  unreadNotificationsCount: number;

  // Music Player
  tracks: MusicTrack[];
  currentTrackIndex: number;
  isPlaying: boolean;
  isFavorite: boolean;
  playTrack: (index: number) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleFavorite: () => void;

  // Active Trip & Speed
  currentSpeed: number;
  activeTrip: TripItem | null;
  startTripWithDetails: (destination: string, peopleCount: number, isPlanned: boolean) => void;
  completeTrip: () => void;
  trips: TripItem[];

  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const defaultTracks: MusicTrack[] = [
  {
    id: 't1',
    title: 'Highway',
    artist: 'A. R. Rahman',
    source: 'spotify',
    durationSeconds: 234,
    albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 't2',
    title: 'Safar',
    artist: 'Jubin Nautiyal',
    source: 'spotify',
    durationSeconds: 215,
    albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 't3',
    title: 'Kesariya',
    artist: 'Arijit Singh',
    source: 'youtube',
    durationSeconds: 268,
    albumArt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 't4',
    title: 'Ilahi',
    artist: 'A. R. Rahman',
    source: 'spotify',
    durationSeconds: 228,
    albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&q=80',
  },
];

const initialPlaces: NearbyPlace[] = [
  {
    id: 'p1',
    name: 'Indian Oil Petrol Bunk',
    category: 'petrol',
    address: 'NH16, Anakapalli Bypass',
    distance: '2 km',
    isOpen: true,
    openHours: 'Open 24 hours',
    rating: 4.8,
    phone: '+91 8924 220000',
    lat: 16.495,
    lng: 80.655,
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p2',
    name: 'Tata Power Fast EV Station',
    category: 'ev',
    address: 'Near NH16 Toll Plaza, Gannavaram',
    distance: '3.4 km',
    isOpen: true,
    openHours: 'Open 24 hours',
    rating: 4.7,
    phone: '+91 8924 221144',
    lat: 16.515,
    lng: 80.675,
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p3',
    name: 'Italian Bistro & Cafe',
    category: 'food',
    address: '3.1 km from route, Benz Circle',
    distance: '3.1 km',
    isOpen: true,
    openHours: '10:00 AM - 11:30 PM',
    rating: 4.9,
    phone: '+91 866 2489999',
    lat: 16.502,
    lng: 80.642,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'p4',
    name: 'Highway Dhaba & Family Resto',
    category: 'food',
    address: 'NH16 Highway Mile 42, Telaprolu',
    distance: '4.8 km',
    isOpen: true,
    openHours: 'Open 24 hours',
    rating: 4.6,
    phone: '+91 866 2481122',
    lat: 16.485,
    lng: 80.638,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
  },
];

const initialNotifications: GroupNotification[] = [
  {
    id: 'n1',
    senderName: 'Karthik',
    senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    type: 'place_request',
    title: 'Italian Bistro',
    subtitle: '3.1 km from route • Italian',
    distance: '3.1 km',
    timeAgo: 'Just now',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'n2',
    senderName: 'Sumanth',
    senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    type: 'fuel_stop',
    title: 'Indian Oil Petrol Bunk',
    subtitle: '2 km ahead • NH16, Anakapalli',
    distance: '2 km',
    timeAgo: '10 mins ago',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=300&q=80',
  },
];

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation history & current screen
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [history, setHistory] = useState<string[]>([]);
  const [isPlannedTrip, setIsPlannedTrip] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Phone frame toggle: default to false so mobile users experience full-width native view immediately!
  const [phoneFrame, setPhoneFrame] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 1024;
    }
    return false;
  });

  // User state (Matches reference image WhatsApp_Image_2026-10-29_at_10.18.44_PM_fb379a66.jpeg)
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const name = localStorage.getItem('user_name') || 'Bhargav sai Javvaji';
      const email = localStorage.getItem('user_email') || 'bhargavjavvaji6@gmail.com';
      const id = localStorage.getItem('user_id') || 'RM-482913';
      return {
        name,
        email,
        userId: id,
        convoyId: 'RM-482913',
        avatar: '/assets/aistudio/image_3d1745ac.png',
      };
    } catch {
      return {
        name: 'Bhargav sai Javvaji',
        email: 'bhargavjavvaji6@gmail.com',
        userId: 'RM-482913',
        convoyId: 'RM-482913',
        avatar: '/assets/aistudio/image_3d1745ac.png',
      };
    }
  });

  // Saved Locations for Profile (Home, Office, Gym, Hostel - Feature Requirement 5)
  const [savedPlaces, setSavedPlaces] = useState<
    { id: 'home' | 'office' | 'gym' | 'hostel'; label: string; address: string; isSet: boolean }[]
  >(() => {
    try {
      const stored = localStorage.getItem('saved_places');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: 'home', label: 'Home', address: 'Road No. 4, Benz Circle, Vijayawada', isSet: true },
      { id: 'office', label: 'Office', address: 'Tech Park, IT SEZ, Gannavaram', isSet: true },
      { id: 'gym', label: 'Gym', address: "Gold's Fitness Hub, MG Road", isSet: true },
      { id: 'hostel', label: 'Hostel', address: 'Mitra Residency, Near VR Siddhartha College', isSet: true },
    ];
  });

  const [isIncognito, setIsIncognito] = useState<boolean>(false);

  // Real-time Shared Trip state
  const [activeSharedTrip, setActiveSharedTrip] = useState<SharedTrip | null>(null);
  const [currentTripId, setCurrentTripId] = useState<string>('RM-482913');
  const [liveLocationSharingActive, setLiveLocationSharingActive] = useState<boolean>(true);
  const wsRef = useRef<WebSocket | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Members list (synced with activeSharedTrip)
  const [members, setMembers] = useState<TripMember[]>([
    {
      id: 'm1',
      name: 'Bhargav (You)',
      isOrganizer: true,
      status: 'live',
      eta: 'Organizer',
      distance: '0 km',
      lat: 16.4952,
      lng: 80.6515,
      locationName: 'Benz Circle',
      avatarColor: '#34D399',
      avatarImg: '/assets/bhargav_avatar_clean.jpg',
    },
    {
      id: 'm2',
      name: 'Sumanth',
      isOrganizer: false,
      status: 'ahead',
      eta: '4:48 PM',
      distance: '10m ahead',
      lat: 16.505,
      lng: 80.648,
      locationName: '10m ahead (NH16)',
      avatarColor: '#3B82F6',
      avatarImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    },
    {
      id: 'm3',
      name: 'Karthik',
      isOrganizer: false,
      status: 'behind',
      eta: '4:52 PM',
      distance: '20m behind',
      lat: 16.488,
      lng: 80.655,
      locationName: '20m behind',
      avatarColor: '#F59E0B',
      avatarImg: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    },
  ]);

  // Places, notifications, music
  const [places, setPlaces] = useState<NearbyPlace[]>(initialPlaces);
  const [notifications, setNotifications] = useState<GroupNotification[]>(initialNotifications);
  const [tracks] = useState<MusicTrack[]>(defaultTracks);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [currentSpeed, setCurrentSpeed] = useState<number>(80);

  // Active Trip
  const [activeTrip, setActiveTrip] = useState<TripItem | null>({
    id: 'RM-482913',
    title: 'Quick Trip to Bhavani Island',
    destination: 'Bhavani Island, Vijayawada',
    date: 'Today, 2:30 PM',
    membersCount: 3,
    distance: '368 km',
    duration: '5h 12m',
    status: 'active',
  });

  const [trips, setTrips] = useState<TripItem[]>([
    {
      id: 'RM-482913',
      title: 'Quick Trip to Bhavani Island',
      destination: 'Bhavani Island, Vijayawada',
      date: 'Today, 2:30 PM',
      membersCount: 3,
      distance: '368 km',
      duration: '5h 12m',
      status: 'active',
    },
    {
      id: 'RM-102941',
      title: 'Vizag Highway Convoy',
      destination: 'Rushikonda Beach, Vizag',
      date: 'Yesterday',
      membersCount: 4,
      distance: '350 km',
      duration: '5h 30m',
      status: 'completed',
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3800);
  };

  // Toast helper and navigator
  const navigateTo = (screen: string, options?: { isPlanned?: boolean }) => {
    if (options?.isPlanned !== undefined) {
      setIsPlannedTrip(options.isPlanned);
    }
    setHistory((prev) => [...prev, currentScreen]);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((old) => old.slice(0, -1));
      setCurrentScreen(prev);
    } else {
      setCurrentScreen('home');
    }
  };

  const togglePhoneFrame = () => {
    setPhoneFrame((prev) => !prev);
  };

  // ── Real-Time WebSocket Connection ──
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        ws = new WebSocket(`${protocol}//${host}`);
        wsRef.current = ws;

        ws.onopen = () => {
          // Subscribe to current Trip ID
          if (currentTripId) {
            ws?.send(
              JSON.stringify({
                type: 'subscribe',
                tripId: currentTripId,
                userId: user?.userId || 'u-user',
                userName: user?.name || 'Convoy Member',
              })
            );
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'sync') {
              const syncedTrip: SharedTrip = data.trip;
              setActiveSharedTrip(syncedTrip);
              if (syncedTrip.status === 'ended' || syncedTrip.status === 'completed') {
                handleTripEndedLocally(syncedTrip, 'Trip ended');
              } else {
                syncMembersFromTrip(syncedTrip);
              }
            } else if (data.type === 'destination:updated') {
              // Real-time Destination Synchronization across all devices!
              const { destination, updatedBy, trip } = data;
              if (trip) setActiveSharedTrip(trip);
              setActiveTrip((prev) =>
                prev ? { ...prev, destination, title: `Trip to ${destination}` } : null
              );
              showToast(`🎯 Destination updated to "${destination}" by ${updatedBy}`);
            } else if (data.type === 'member:joined') {
              const { trip, member } = data;
              if (trip) {
                setActiveSharedTrip(trip);
                syncMembersFromTrip(trip);
              }
              showToast(`🚗 ${member.userName} joined the trip!`);
            } else if (data.type === 'trip:ended') {
              // Real-time Stop / End Trip across all devices!
              const { endedBy, reason, trip } = data;
              handleTripEndedLocally(trip, reason, endedBy);
            }
          } catch (err) {
            console.error('Error handling WS message:', err);
          }
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        };
      } catch (e) {
        console.error('WebSocket connection error:', e);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [currentTripId, user?.userId, user?.name]);

  // Helper to sync local members from backend trip
  const syncMembersFromTrip = (trip: SharedTrip) => {
    if (!trip.participants) return;
    const mapped: TripMember[] = trip.participants.map((p, idx) => ({
      id: p.userId || `m-${idx}`,
      name: p.userName,
      isOrganizer: p.isOrganizer,
      status: p.isOrganizer ? 'live' : idx % 2 === 0 ? 'ahead' : 'behind',
      eta: p.eta || '4:50 PM',
      distance: p.distance || '10m',
      lat: p.lat,
      lng: p.lng,
      locationName: p.locationName || 'En route',
      avatarColor: p.isOrganizer ? '#34D399' : idx === 1 ? '#3B82F6' : '#F59E0B',
      avatarImg:
        idx === 0
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'
          : idx === 1
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80'
          : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    }));
    setMembers(mapped);
  };

  /**
   * CRITICAL PRIVACY & TRIP END HANDLER (User Request #2 & #5)
   * "everytime user members don't shown once trip is over. like check an 3rd image if share the members details
   * don't show the user details once trip is over on next minute don't show another user details didn't show where his live now."
   */
  const handleTripEndedLocally = (trip?: SharedTrip, reason?: string, endedBy?: string) => {
    // 1. Stop location watch
    if (watchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // 2. Disable live location sharing
    setLiveLocationSharingActive(false);

    // 3. WIPE ALL MEMBER LIVE LOCATIONS from UI state!
    setMembers((prev) =>
      prev.map((m) => ({
        ...m,
        status: 'ended',
        lat: undefined,
        lng: undefined,
        locationName: undefined,
        distance: undefined,
        eta: undefined,
      }))
    );

    // 4. Update active trip status
    if (trip) setActiveSharedTrip(trip);
    setActiveTrip((prev) => (prev ? { ...prev, status: 'completed' } : null));

    // 5. Display clear notification
    const actor = endedBy || 'A participant';
    showToast(`🛑 Trip has ended (${actor}: ${reason || 'Completed'}). Live location sharing stopped.`);
  };

  // Initial fetch for default trip
  useEffect(() => {
    fetch(`/api/trips/${currentTripId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.trip) {
          setActiveSharedTrip(data.trip);
          if (data.trip.status === 'active') {
            syncMembersFromTrip(data.trip);
          } else {
            handleTripEndedLocally(data.trip);
          }
        }
      })
      .catch(() => {
        // Dev fallback handled gracefully
      });
  }, [currentTripId]);

  // Simulated live telemetry movement during active trip
  useEffect(() => {
    if (!liveLocationSharingActive || activeSharedTrip?.status === 'ended') return;

    const interval = setInterval(() => {
      setCurrentSpeed((prev) => {
        const delta = Math.floor(Math.random() * 7) - 3;
        return Math.min(95, Math.max(65, prev + delta));
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [liveLocationSharingActive, activeSharedTrip?.status]);

  // ── Feature 1: Create a Trip (Device X) ──
  const createSharedTrip = async (
    destination: string,
    peopleCount: number,
    isPlanned: boolean
  ): Promise<{ success: boolean; tripId?: string; error?: string }> => {
    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          peopleCount,
          isPlanned,
          organizerName: user?.name || 'Rohith',
          userId: user?.userId || 'RM482913',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to create trip.' };
      }

      const createdTrip: SharedTrip = data.trip;
      setCurrentTripId(createdTrip.id);
      setActiveSharedTrip(createdTrip);
      setLiveLocationSharingActive(true);

      setActiveTrip({
        id: createdTrip.id,
        title: createdTrip.title,
        destination: createdTrip.destination,
        date: 'Just now',
        membersCount: createdTrip.peopleCount,
        distance: '368 km',
        duration: '5h 12m',
        status: 'active',
      });

      // Subscribe WS to new trip
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'subscribe',
            tripId: createdTrip.id,
            userId: user?.userId || 'RM482913',
            userName: user?.name || 'Rohith',
          })
        );
      }

      showToast(`Trip created! Unique ID: ${createdTrip.id}`);
      return { success: true, tripId: createdTrip.id };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error creating trip.' };
    }
  };

  // ── Feature 2: Join a Trip (Device Y) ──
  const joinTrip = async (tripIdToJoin: string): Promise<{ success: boolean; error?: string }> => {
    const cleanId = tripIdToJoin.trim().toUpperCase();
    if (!cleanId) {
      return { success: false, error: 'Please enter a valid Trip ID.' };
    }

    try {
      const res = await fetch(`/api/trips/${cleanId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.userId || `RM-${Math.floor(Math.random() * 900000 + 100000)}`,
          userName: user?.name || 'Convoy Member',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || `Could not join trip "${cleanId}". Please check the ID.`,
        };
      }

      const joinedTrip: SharedTrip = data.trip;
      setCurrentTripId(joinedTrip.id);
      setActiveSharedTrip(joinedTrip);
      setLiveLocationSharingActive(true);

      setActiveTrip({
        id: joinedTrip.id,
        title: joinedTrip.title,
        destination: joinedTrip.destination,
        date: 'Today',
        membersCount: joinedTrip.participants.length,
        distance: '368 km',
        duration: '5h 12m',
        status: 'active',
      });

      syncMembersFromTrip(joinedTrip);

      // Subscribe WS to joined trip
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'subscribe',
            tripId: joinedTrip.id,
            userId: user?.userId || 'RM-user',
            userName: user?.name || 'Convoy Member',
          })
        );
      }

      showToast(`Joined ${joinedTrip.id} successfully! Connected to convoy.`);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Unable to connect to server.' };
    }
  };

  // ── Feature 3: Synchronize Destination Updates in Real Time ──
  const updateSharedDestination = async (newDestination: string): Promise<boolean> => {
    if (!newDestination.trim()) return false;
    const dest = newDestination.trim();

    try {
      // Optimistic local update
      setActiveTrip((prev) =>
        prev ? { ...prev, destination: dest, title: `Trip to ${dest}` } : null
      );

      // Send to server
      await fetch(`/api/trips/${currentTripId}/destination`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: dest,
          updatedBy: user?.name || 'Rohith',
        }),
      });

      // Also trigger WS event
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'destination:update',
            tripId: currentTripId,
            destination: dest,
            updatedBy: user?.name || 'Rohith',
          })
        );
      }

      showToast(`Destination updated to: ${dest}`);
      return true;
    } catch {
      showToast('Error syncing destination.');
      return false;
    }
  };

  // ── Feature 4 & 5: Stop or End the Shared Trip & Privacy Enforcer ──
  const endSharedTrip = async (reason = 'Manual stop') => {
    try {
      const res = await fetch(`/api/trips/${currentTripId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endedBy: user?.name || 'Rohith',
          reason,
        }),
      });

      const data = await res.json();
      const updated = data.trip || activeSharedTrip;

      // Broadcast WS end
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'trip:end',
            tripId: currentTripId,
            endedBy: user?.name || 'Rohith',
            reason,
          })
        );
      }

      handleTripEndedLocally(updated, reason, user?.name || 'Rohith');
      navigateTo('completion');
    } catch {
      handleTripEndedLocally(undefined, reason, user?.name || 'Rohith');
      navigateTo('completion');
    }
  };

  const copyTripId = () => {
    const idToCopy = activeSharedTrip?.id || currentTripId || user?.convoyId || 'RM-482913';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(idToCopy);
    }
    showToast(`Copied Trip ID: ${idToCopy}`);
  };

  // User Profile Name Edit (Change Name ONLY - Feature Requirement 5)
  const updateUserName = (newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setUser((prev) => (prev ? { ...prev, name: trimmed } : null));
    setMembers((prev) =>
      prev.map((m) => (m.isOrganizer ? { ...m, name: `${trimmed} (You)` } : m))
    );
    try {
      localStorage.setItem('user_name', trimmed);
    } catch {}
    showToast(`Profile name updated to: ${trimmed}`);
  };

  // Saved Locations for Profile (Home, Office, Gym, Hostel - Feature Requirement 5)
  const updateSavedPlace = (id: 'home' | 'office' | 'gym' | 'hostel', address: string) => {
    const trimmed = address.trim();
    if (!trimmed) return;
    setSavedPlaces((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, address: trimmed, isSet: true } : p));
      try {
        localStorage.setItem('saved_places', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(`Saved location for ${id.toUpperCase()} updated!`);
  };

  const toggleIncognito = () => {
    setIsIncognito((prev) => {
      const next = !prev;
      if (next) {
        showToast('Incognito mode turned ON: Live location paused');
      } else {
        showToast('Incognito mode turned OFF: Live location active');
      }
      return next;
    });
  };

  // Auth Handlers
  const registerUser = (name: string, email: string) => {
    const newUser: UserProfile = {
      name,
      email,
      userId: `RM${Math.floor(100000 + Math.random() * 900000)}`,
      convoyId: `RM${Math.floor(100000 + Math.random() * 900000)}`,
      avatar: '/assets/aistudio/image_3d1745ac.png',
    };
    setUser(newUser);
    try {
      localStorage.setItem('user_name', newUser.name);
      localStorage.setItem('user_email', newUser.email);
      localStorage.setItem('user_id', newUser.userId);
    } catch {}
    showToast(`Welcome, ${name}!`);
    navigateTo('home');
  };

  const loginUser = (email: string): boolean => {
    const newUser: UserProfile = {
      name: email.split('@')[0] || 'Bhargav sai Javvaji',
      email,
      userId: 'RM-482913',
      convoyId: 'RM-482913',
      avatar: '/assets/aistudio/image_3d1745ac.png',
    };
    setUser(newUser);
    showToast(`Signed in as ${newUser.name}`);
    navigateTo('home');
    return true;
  };

  const loginWithSocial = (provider: 'google' | 'facebook' | 'instagram' | 'apple') => {
    const providerNames = {
      google: 'Google',
      facebook: 'Facebook',
      instagram: 'Instagram',
      apple: 'Apple',
    };
    const newUser: UserProfile = {
      name: 'Bhargav sai Javvaji',
      email: 'bhargavjavvaji6@gmail.com',
      userId: 'RM-482913',
      convoyId: 'RM-482913',
      avatar: '/assets/aistudio/image_3d1745ac.png',
    };
    setUser(newUser);
    showToast(`Authenticated with ${providerNames[provider]}`);
    navigateTo('home');
  };

  const signOut = () => {
    setUser(null);
    try {
      localStorage.clear();
    } catch {}
    showToast('Signed out');
    navigateTo('login');
  };

  const addMember = (name: string) => {
    const newMember: TripMember = {
      id: `m-${Date.now()}`,
      name,
      status: 'ahead',
      eta: '4:55 PM',
      distance: '15m ahead',
      avatarColor: '#10B981',
      avatarImg: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
    };
    setMembers((prev) => [...prev, newMember]);
    showToast(`Added ${name} to convoy`);
  };

  const addPlaceToTrip = (place: NearbyPlace) => {
    showToast(`Added stop: ${place.name}`);
  };

  const approveNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isApproved: true, isDenied: false } : n))
    );
    showToast('Stop approved for all convoy members');
  };

  const denyNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isApproved: false, isDenied: true } : n))
    );
    showToast('Stop proposal declined');
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isApproved && !n.isDenied).length;

  const playTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const toggleFavorite = () => {
    setIsFavorite((prev) => !prev);
    showToast(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const startTripWithDetails = async (
    destination: string,
    peopleCount: number,
    isPlanned: boolean
  ) => {
    await createSharedTrip(destination, peopleCount, isPlanned);
    navigateTo('live-navigation');
  };

  const completeTrip = async () => {
    await endSharedTrip('Destination reached');
  };

  return (
    <TripContext.Provider
      value={{
        currentScreen,
        navigateTo,
        goBack,
        isPlannedTrip,
        phoneFrame,
        togglePhoneFrame,
        user,
        updateUserName,
        savedPlaces,
        updateSavedPlace,
        isIncognito,
        toggleIncognito,
        registerUser,
        loginUser,
        loginWithSocial,
        signOut,
        activeSharedTrip,
        currentTripId,
        isTripActive: activeSharedTrip?.status === 'active',
        liveLocationSharingActive,
        createSharedTrip,
        joinTrip,
        updateSharedDestination,
        endSharedTrip,
        copyTripId,
        members,
        addMember,
        places,
        addPlaceToTrip,
        notifications,
        approveNotification,
        denyNotification,
        unreadNotificationsCount,
        tracks,
        currentTrackIndex,
        isPlaying,
        isFavorite,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        toggleFavorite,
        currentSpeed,
        activeTrip,
        startTripWithDetails,
        completeTrip,
        trips,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
