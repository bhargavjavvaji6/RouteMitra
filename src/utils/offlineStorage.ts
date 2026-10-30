import { TripItem, UserProfile, SavedPlace } from '../types';

export interface OfflineInstruction {
  dist: string;
  text: string;
  sub: string;
  turnType: 'left' | 'right' | 'straight' | 'merge';
}

export interface OfflineRoutePlan {
  destination: string;
  distance: string;
  duration: string;
  speedLimit: number;
  instructions: OfflineInstruction[];
  checkpoints: { name: string; distance: string; note: string }[];
  cachedAt: number;
}

const KEY_TRIPS_HISTORY = 'routemitra_trips_history';
const KEY_ACTIVE_TRIP = 'routemitra_active_trip';
const KEY_SAVED_PLACES = 'routemitra_saved_places';
const KEY_USER_PROFILE = 'routemitra_user_profile';
const KEY_OFFLINE_ROUTES = 'routemitra_offline_routes';
const KEY_OFFLINE_LAST_SYNC = 'routemitra_offline_last_sync';

// Default pre-cached trips for profile history
export const DEFAULT_OFFLINE_TRIPS: TripItem[] = [
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
    date: 'Yesterday, 8:15 AM',
    membersCount: 4,
    distance: '350 km',
    duration: '5h 30m',
    status: 'completed',
  },
  {
    id: 'RM-904123',
    title: 'Mangalagiri Sunrise Drive',
    destination: 'Panakala Narasimha Swamy Temple',
    date: 'Oct 24, 2026',
    membersCount: 2,
    distance: '24 km',
    duration: '42m',
    status: 'completed',
  },
  {
    id: 'RM-817290',
    title: 'Amaravati Riverfront Ride',
    destination: 'Amaravati Capital City Viewpoint',
    date: 'Oct 18, 2026',
    membersCount: 5,
    distance: '48 km',
    duration: '1h 10m',
    status: 'completed',
  },
];

export const DEFAULT_OFFLINE_PLACES: SavedPlace[] = [
  { id: 'home', label: 'Home', address: 'Road No. 4, Benz Circle, Vijayawada', isSet: true },
  { id: 'office', label: 'Office', address: 'Tech Park, IT SEZ, Gannavaram', isSet: true },
  { id: 'gym', label: 'Gym', address: "Gold's Fitness Hub, MG Road", isSet: true },
  { id: 'hostel', label: 'Hostel', address: 'Mitra Residency, Near VR Siddhartha College', isSet: true },
];

export const DEFAULT_OFFLINE_USER: UserProfile = {
  name: 'Bhargav sai Javvaji',
  email: 'bhargavjavvaji6@gmail.com',
  userId: 'RM-482913',
  convoyId: 'RM-482913',
  avatar: '/assets/bhargav_avatar.svg',
};

// ── Profile History Storage ──

export const loadCachedTrips = (): TripItem[] => {
  try {
    const raw = localStorage.getItem(KEY_TRIPS_HISTORY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[OfflineStorage] Failed to read trips history:', e);
  }
  // Initialize with defaults if empty
  saveCachedTrips(DEFAULT_OFFLINE_TRIPS);
  return DEFAULT_OFFLINE_TRIPS;
};

export const saveCachedTrips = (trips: TripItem[]): void => {
  try {
    localStorage.setItem(KEY_TRIPS_HISTORY, JSON.stringify(trips));
    localStorage.setItem(KEY_OFFLINE_LAST_SYNC, Date.now().toString());
  } catch (e) {
    console.warn('[OfflineStorage] Failed to write trips history:', e);
  }
};

export const appendTripToHistory = (newTrip: TripItem): TripItem[] => {
  const current = loadCachedTrips();
  // Filter out any existing trip with the same id
  const updated = [newTrip, ...current.filter((t) => t.id !== newTrip.id)];
  saveCachedTrips(updated);
  return updated;
};

// ── Active Trip & Basic Navigation Storage ──

export const loadCachedActiveTrip = (): TripItem | null => {
  try {
    const raw = localStorage.getItem(KEY_ACTIVE_TRIP);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[OfflineStorage] Failed to read active trip:', e);
  }
  return DEFAULT_OFFLINE_TRIPS[0];
};

export const saveCachedActiveTrip = (trip: TripItem | null): void => {
  try {
    if (trip) {
      localStorage.setItem(KEY_ACTIVE_TRIP, JSON.stringify(trip));
    } else {
      localStorage.removeItem(KEY_ACTIVE_TRIP);
    }
  } catch (e) {
    console.warn('[OfflineStorage] Failed to save active trip:', e);
  }
};

// ── Saved Locations Storage ──

export const loadCachedSavedPlaces = (): SavedPlace[] => {
  try {
    const raw = localStorage.getItem(KEY_SAVED_PLACES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[OfflineStorage] Failed to read saved places:', e);
  }
  saveCachedSavedPlaces(DEFAULT_OFFLINE_PLACES);
  return DEFAULT_OFFLINE_PLACES;
};

export const saveCachedSavedPlaces = (places: SavedPlace[]): void => {
  try {
    localStorage.setItem(KEY_SAVED_PLACES, JSON.stringify(places));
  } catch (e) {
    console.warn('[OfflineStorage] Failed to save places:', e);
  }
};

export interface RegisteredAccount {
  name: string;
  email: string;
  passwordHash: string;
  userId: string;
  avatar: string;
  provider?: string;
  createdAt: number;
}

const KEY_REGISTERED_ACCOUNTS = 'routemitra_registered_accounts';

export const getRegisteredAccounts = (): RegisteredAccount[] => {
  try {
    const raw = localStorage.getItem(KEY_REGISTERED_ACCOUNTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  // Default verified account for Bhargav
  const defaultAccounts: RegisteredAccount[] = [
    {
      name: 'Bhargav sai Javvaji',
      email: 'bhargavjavvaji6@gmail.com',
      passwordHash: 'password123',
      userId: 'RM-482913',
      avatar: '/assets/bhargav_avatar.svg',
      createdAt: Date.now() - 86400000,
    },
    {
      name: 'Rohith Varma',
      email: 'rohith@routemitra.app',
      passwordHash: 'demopass123',
      userId: 'RM-600617',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
      createdAt: Date.now() - 172800000,
    },
  ];
  try {
    localStorage.setItem(KEY_REGISTERED_ACCOUNTS, JSON.stringify(defaultAccounts));
  } catch {}
  return defaultAccounts;
};

export const saveRegisteredAccount = (account: RegisteredAccount): void => {
  const current = getRegisteredAccounts();
  const filtered = current.filter((a) => a.email.toLowerCase() !== account.email.toLowerCase());
  const updated = [account, ...filtered];
  try {
    localStorage.setItem(KEY_REGISTERED_ACCOUNTS, JSON.stringify(updated));
  } catch {}
};

// ── User Profile Storage ──

export const loadCachedUserProfile = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(KEY_USER_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[OfflineStorage] Failed to read user profile:', e);
  }
  // Initialize with Bhargav if first run and not explicitly logged out
  const wasLoggedOut = localStorage.getItem('routemitra_logged_out');
  if (wasLoggedOut === 'true') {
    return null;
  }
  saveCachedUserProfile(DEFAULT_OFFLINE_USER);
  return DEFAULT_OFFLINE_USER;
};

export const saveCachedUserProfile = (user: UserProfile | null): void => {
  try {
    if (user) {
      localStorage.setItem(KEY_USER_PROFILE, JSON.stringify(user));
      localStorage.setItem('user_name', user.name);
      localStorage.setItem('user_email', user.email);
      localStorage.setItem('user_id', user.userId);
      localStorage.removeItem('routemitra_logged_out');
    } else {
      localStorage.removeItem(KEY_USER_PROFILE);
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_id');
      localStorage.setItem('routemitra_logged_out', 'true');
    }
  } catch (e) {
    console.warn('[OfflineStorage] Failed to save user profile:', e);
  }
};

// ── Offline Navigation Route Generation & Cache ──

export const getOfflineNavigationPlan = (destinationName?: string): OfflineRoutePlan => {
  const dest = destinationName?.trim() || 'Bhavani Island, Vijayawada';
  const destLower = dest.toLowerCase();

  // Try retrieving cached custom routes first
  try {
    const rawRoutes = localStorage.getItem(KEY_OFFLINE_ROUTES);
    if (rawRoutes) {
      const routes: Record<string, OfflineRoutePlan> = JSON.parse(rawRoutes);
      if (routes[destLower]) {
        return routes[destLower];
      }
    }
  } catch {}

  // Generate a realistic, rich offline navigation plan for the destination
  let distance = '12.6 km';
  let duration = '28m';
  let speedLimit = 60;
  let instructions: OfflineInstruction[] = [];

  if (destLower.includes('hyderabad') || destLower.includes('gachibowli')) {
    distance = '295 km';
    duration = '5h 41m';
    speedLimit = 80;
    instructions = [
      {
        dist: '750 m',
        text: 'Take left under the flyover',
        sub: 'NH16 Corridor Vijayawada Bypass',
        turnType: 'left',
      },
      {
        dist: '300 m',
        text: 'Towards State Bank Rd Then ↱',
        sub: 'Keep left and merge onto NH65 service road',
        turnType: 'right',
      },
      {
        dist: '68 km',
        text: 'Continue straight towards Suryapet',
        sub: 'Toll Plaza 1 (Chityala) in 42 km • Fastag active',
        turnType: 'straight',
      },
      {
        dist: '120 km',
        text: 'Merge onto Hyderabad Outer Ring Road (ORR)',
        sub: 'Exit 19 towards Gachibowli / Financial District',
        turnType: 'merge',
      },
      {
        dist: '1.2 km',
        text: 'Arriving at Destination on left',
        sub: 'Gachibowli Central Junction',
        turnType: 'straight',
      },
    ];
  } else if (destLower.includes('bhavani') || destLower.includes('vijayawada')) {
    distance = '12.4 km';
    duration = '26m';
    speedLimit = 60;
    instructions = [
      {
        dist: '750 m',
        text: 'Take left under the flyover',
        sub: 'NH16 Elevated Corridor Vijayawada Bypass',
        turnType: 'left',
      },
      {
        dist: '300 m',
        text: 'Towards State Bank Rd Then ↱',
        sub: 'Keep left and take the service road',
        turnType: 'right',
      },
      {
        dist: '4.8 km',
        text: 'Follow Prakasam Barrage Road along Krishna River',
        sub: 'Scenic coastal river drive to Bhavani Ghat',
        turnType: 'straight',
      },
      {
        dist: '500 m',
        text: 'Turn right at Ferry Terminal Road',
        sub: 'Destination gate in 300m',
        turnType: 'right',
      },
    ];
  } else {
    // Dynamic offline route for any user-entered location
    distance = '18.5 km';
    duration = '35m';
    speedLimit = 70;
    instructions = [
      {
        dist: '500 m',
        text: `Head toward main arterial road towards ${dest}`,
        sub: 'GPS Offline Guidance Active',
        turnType: 'straight',
      },
      {
        dist: '1.2 km',
        text: 'Take exit ramp onto regional highway',
        sub: 'Keep in right lane for uninterrupted transit',
        turnType: 'right',
      },
      {
        dist: '14.5 km',
        text: `Continue straight on mainline to ${dest}`,
        sub: 'Follow compass heading & offline waypoints',
        turnType: 'straight',
      },
      {
        dist: '800 m',
        text: `Turn into destination access lane for ${dest}`,
        sub: 'Arrival in under 3 minutes',
        turnType: 'left',
      },
    ];
  }

  const plan: OfflineRoutePlan = {
    destination: dest,
    distance,
    duration,
    speedLimit,
    instructions,
    checkpoints: [
      { name: 'Start (Current GPS)', distance: '0 km', note: 'Benz Circle' },
      { name: 'NH16 Bypass Flyover', distance: '750 m', note: 'Keep left under pillars' },
      { name: 'Midpoint Transit Waypoint', distance: 'Halfway', note: 'Rest area & petrol' },
      { name: dest, distance: distance, note: 'Target terminal' },
    ],
    cachedAt: Date.now(),
  };

  // Cache it for subsequent offline visits
  try {
    const rawRoutes = localStorage.getItem(KEY_OFFLINE_ROUTES);
    const routes: Record<string, OfflineRoutePlan> = rawRoutes ? JSON.parse(rawRoutes) : {};
    routes[destLower] = plan;
    localStorage.setItem(KEY_OFFLINE_ROUTES, JSON.stringify(routes));
  } catch {}

  return plan;
};

// ── Cache Diagnostics ──

export const getOfflineCacheStatus = (): {
  tripsCount: number;
  placesCount: number;
  lastSyncFormatted: string;
  storageBytes: number;
} => {
  let tripsCount = 0;
  let placesCount = 0;
  let lastSync = 'Just now';
  let storageBytes = 0;

  try {
    const trips = loadCachedTrips();
    tripsCount = trips.length;

    const places = loadCachedSavedPlaces();
    placesCount = places.length;

    const syncTime = localStorage.getItem(KEY_OFFLINE_LAST_SYNC);
    if (syncTime) {
      lastSync = new Date(Number(syncTime)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Rough storage estimation
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('routemitra_')) {
        storageBytes += (localStorage.getItem(k) || '').length * 2;
      }
    }
  } catch {}

  return {
    tripsCount,
    placesCount,
    lastSyncFormatted: lastSync,
    storageBytes,
  };
};

export const clearOfflineCache = (): void => {
  try {
    localStorage.removeItem(KEY_TRIPS_HISTORY);
    localStorage.removeItem(KEY_ACTIVE_TRIP);
    localStorage.removeItem(KEY_OFFLINE_ROUTES);
    localStorage.removeItem(KEY_OFFLINE_LAST_SYNC);
    // Re-seed essential defaults
    saveCachedTrips(DEFAULT_OFFLINE_TRIPS);
  } catch (e) {
    console.error('Error clearing offline cache:', e);
  }
};
