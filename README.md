# RouteMitra - Travel Together. Reach Together.

A modern, responsive React application rewritten from the Flutter RouteMitra project. RouteMitra helps convoys, groups of friends, and families coordinate road trips, share live GPS locations, track distance to each other, discover route places (fuel, EV charging, restaurants), listen to journey playlists, and receive flyover/junction guidance.

## Core Features

- **Splash Screen**: Animated logo, brand badge variants, and automatic session restoration.
- **Authentication**:
  - Full registration with validation and social login options (Google, Apple, Facebook).
  - Sign-in with profile persistence and fast demo sign-in.
- **Home Dashboard**:
  - User profile greeting with unique Mitra ID and avatar.
  - Active trip overview banner with 1-click resume.
  - Primary 6-card feature grid: Start Trip, My Trips, Live Map, Members, Nearby Places, Music.
  - Secondary grid: Favorites, History, Settings.
  - Quick Start options: Quick Trip & Planned Trip.
  - Bottom shortcuts (Map, New Trip, Music, Trips).
  - Safety and permissions banner.
  - 4-tab bottom navigation (Home, Radar Map, Journeys, Profile).
- **Trip Planning**:
  - Group size counter (1 to 6+ travelers).
  - Destination search with quick chips (Home, Office, Nearby).
  - Toggleable highway highlights (Fuel stations, EV charging, Convoy-approved restaurants).
- **Live Navigation & Radar**:
  - Interactive Leaflet map with dark theme CartoDB tiles.
  - Real-time GPS location tracking and recentering.
  - Floating member bubbles showing distances (e.g. "Sumanth: 10 m ahead", "Karthik: 20 m behind").
  - Digital animated circular speedometer widget (km/h).
  - Turn-by-turn instruction cards with step switching.
  - Bottom info panel with live ETA (`5h 12m`, `368 km`), trip completion trigger, and quick shortcuts.
- **Advanced Flyover Guidance**:
  - Under/Over flyover elevation indicator with 3D diagram.
  - Junction and service road lane instructions.
- **Convoy Member Management**:
  - Real-time member cards with live status indicators (`live`, `ahead`, `behind`, `arrived`).
  - Locate member on radar button.
  - Dynamic "Add Member" modal to expand trip convoy.
- **Nearby Places Along Route**:
  - Interactive highway route visualizer.
  - Category filters: All, Petrol, EV, Food.
  - Place cards with ratings, distances, open hours, call action, and route stop suggestions.
- **Group Notifications**:
  - Member stop requests and vote approvals (Approve / Deny).
- **Arrival Updates**:
  - Real-time check-in notifications when convoy members reach destinations.
- **Music for the Journey**:
  - Audio source selector: Spotify, YouTube, Device.
  - Searchable travel playlist with animated track equalizers.
  - Persistent bottom audio player with scrubber, favorites, and playback controls.
- **Trip Completion**:
  - Celebration checkmark animation.
  - Summary stats: arrived members count, total journey time, distance covered.
  - Interactive 5-emoji feedback rating.

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Maps**: Leaflet + OpenStreetMap / CartoDB
- **Icons**: Lucide React
