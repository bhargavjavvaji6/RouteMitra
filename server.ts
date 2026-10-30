import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';

interface TripParticipant {
  userId: string;
  userName: string;
  isOrganizer: boolean;
  joinedAt: number;
  // Live location details only exist during an active trip
  lat?: number;
  lng?: number;
  locationName?: string;
  distance?: string;
  eta?: string;
}

interface SharedTrip {
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
  participants: TripParticipant[];
}

const app = express();
app.use(express.json());

// In-memory persistent trips store (keyed by Trip ID)
const tripsStore = new Map<string, SharedTrip>();

// Seed default active trip with RM-482913 for instant collaboration
const defaultTripId = 'RM-482913';
tripsStore.set(defaultTripId, {
  id: defaultTripId,
  title: 'Scenic NH16 Coastal Drive',
  destination: 'Bhavani Island, Vijayawada',
  organizerId: 'u-rohith',
  organizerName: 'Rohith',
  createdAt: Date.now() - 3600000,
  status: 'active',
  peopleCount: 3,
  participants: [
    {
      userId: 'u-rohith',
      userName: 'Rohith (You)',
      isOrganizer: true,
      joinedAt: Date.now() - 3600000,
      lat: 16.4952,
      lng: 80.6515,
      locationName: 'Benz Circle',
      distance: '0 km',
      eta: 'Leading',
    },
    {
      userId: 'u-sumanth',
      userName: 'Sumanth',
      isOrganizer: false,
      joinedAt: Date.now() - 3500000,
      lat: 16.505,
      lng: 80.648,
      locationName: '10m ahead (NH16)',
      distance: '10m ahead',
      eta: '4:48 PM',
    },
    {
      userId: 'u-karthik',
      userName: 'Karthik',
      isOrganizer: false,
      joinedAt: Date.now() - 3400000,
      lat: 16.488,
      lng: 80.655,
      locationName: '20m behind',
      distance: '20m behind',
      eta: '4:52 PM',
    },
  ],
});

// WebSocket rooms: tripId -> Set of client sockets
const tripRooms = new Map<string, Set<WebSocket>>();
// Socket to meta mapping
const socketMeta = new WeakMap<WebSocket, { tripId?: string; userId?: string }>();

const broadcastToTrip = (tripId: string, message: any, excludeWs?: WebSocket) => {
  const room = tripRooms.get(tripId);
  if (!room) return;
  const payload = JSON.stringify(message);
  for (const client of room) {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
};

/**
 * Strips all real-time GPS locations from trip object if trip is ended/completed.
 * CRITICAL PRIVACY REQUIREMENT:
 * "everytime user members don't shown once trip is over. like check an 3rd image if share the members details
 * don't show the user details once trip is over on next minute don't show another user details didn't show where his live now."
 */
const sanitizeTripForClient = (trip: SharedTrip): SharedTrip => {
  if (trip.status === 'ended' || trip.status === 'completed') {
    return {
      ...trip,
      participants: trip.participants.map((p) => ({
        userId: p.userId,
        userName: p.userName,
        isOrganizer: p.isOrganizer,
        joinedAt: p.joinedAt,
        // Live GPS, exact coordinates, and live distance tags are erased upon trip completion
        lat: undefined,
        lng: undefined,
        locationName: undefined,
        distance: undefined,
        eta: undefined,
      })),
    };
  }
  return trip;
};

// ── REST API ──

// Create Trip
app.post('/api/trips', (req, res) => {
  const { destination, peopleCount, isPlanned, organizerName, userId } = req.body;

  // Generate unique formatted Trip ID (e.g. RM-582931)
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const tripId = `RM-${randomSuffix}`;

  const newTrip: SharedTrip = {
    id: tripId,
    title: `${isPlanned ? 'Planned' : 'Quick'} Trip to ${destination || 'Destination'}`,
    destination: destination || 'Bhavani Island, Vijayawada',
    organizerId: userId || 'organizer-me',
    organizerName: organizerName || 'Organizer',
    createdAt: Date.now(),
    status: 'active',
    isPlanned: Boolean(isPlanned),
    peopleCount: Number(peopleCount) || 3,
    participants: [
      {
        userId: userId || 'organizer-me',
        userName: organizerName || 'You (Organizer)',
        isOrganizer: true,
        joinedAt: Date.now(),
        locationName: 'Benz Circle',
        distance: '0 km',
        eta: 'Leader',
      },
    ],
  };

  tripsStore.set(tripId, newTrip);
  res.status(201).json({ success: true, trip: sanitizeTripForClient(newTrip) });
});

// Get Trip by ID
app.get('/api/trips/:id', (req, res) => {
  const trip = tripsStore.get(req.params.id);
  if (!trip) {
    return res.status(404).json({ success: false, error: 'Trip not found or ID is invalid.' });
  }
  res.json({ success: true, trip: sanitizeTripForClient(trip) });
});

// Join Trip
app.post('/api/trips/:id/join', (req, res) => {
  const { id } = req.params;
  const { userId, userName } = req.body;

  const trip = tripsStore.get(id);
  if (!trip) {
    return res.status(404).json({ success: false, error: `Trip ID "${id}" was not found. Please check the ID.` });
  }

  if (trip.status === 'ended' || trip.status === 'completed') {
    return res.status(400).json({
      success: false,
      error: `This trip has already ended. Active live tracking and joining are disabled.`,
    });
  }

  // Idempotently check if user already joined
  let participant = trip.participants.find((p) => p.userId === userId || p.userName === userName);
  if (!participant) {
    participant = {
      userId: userId || `user-${Date.now()}`,
      userName: userName || 'Convoy Member',
      isOrganizer: false,
      joinedAt: Date.now(),
      locationName: 'Joined Convoy',
      distance: '50m behind',
      eta: 'En route',
    };
    trip.participants.push(participant);
  }

  // Broadcast to other participants
  broadcastToTrip(id, {
    type: 'member:joined',
    tripId: id,
    trip: sanitizeTripForClient(trip),
    member: participant,
  });

  res.json({ success: true, trip: sanitizeTripForClient(trip) });
});

// Update Destination (Real-time synchronization across Device X, Y, Z)
app.put('/api/trips/:id/destination', (req, res) => {
  const { id } = req.params;
  const { destination, updatedBy } = req.body;

  const trip = tripsStore.get(id);
  if (!trip) {
    return res.status(404).json({ success: false, error: 'Trip not found' });
  }

  if (trip.status === 'ended' || trip.status === 'completed') {
    return res.status(400).json({ success: false, error: 'Cannot update destination: Trip has ended.' });
  }

  trip.destination = destination;

  // Broadcast destination change to ALL devices
  broadcastToTrip(id, {
    type: 'destination:updated',
    tripId: id,
    destination,
    updatedBy: updatedBy || 'A convoy participant',
    timestamp: Date.now(),
    trip: sanitizeTripForClient(trip),
  });

  res.json({ success: true, trip: sanitizeTripForClient(trip) });
});

// End / Stop Shared Trip
app.post('/api/trips/:id/end', (req, res) => {
  const { id } = req.params;
  const { endedBy, reason } = req.body;

  const trip = tripsStore.get(id);
  if (!trip) {
    return res.status(404).json({ success: false, error: 'Trip not found' });
  }

  trip.status = 'ended';
  trip.endedBy = endedBy || 'Convoy Member';
  trip.endedReason = reason || 'Trip completed';
  trip.endedAt = Date.now();

  // WIPE all live coordinates for privacy
  const sanitized = sanitizeTripForClient(trip);

  // Broadcast trip ended to ALL connected devices
  broadcastToTrip(id, {
    type: 'trip:ended',
    tripId: id,
    endedBy: trip.endedBy,
    reason: trip.endedReason,
    endedAt: trip.endedAt,
    trip: sanitized,
    message: `Trip was ended by ${trip.endedBy}. Live location sharing has stopped.`,
  });

  res.json({ success: true, trip: sanitized });
});

// Update Participant Live Location (Only allowed while trip is active)
app.put('/api/trips/:id/location', (req, res) => {
  const { id } = req.params;
  const { userId, lat, lng, locationName, distance, eta } = req.body;

  const trip = tripsStore.get(id);
  if (!trip) {
    return res.status(404).json({ success: false, error: 'Trip not found' });
  }

  // Enforce privacy: reject location sharing if trip ended
  if (trip.status === 'ended' || trip.status === 'completed') {
    return res.status(403).json({
      success: false,
      error: 'Trip has ended. Live location updates are prohibited and stopped.',
    });
  }

  const participant = trip.participants.find((p) => p.userId === userId);
  if (participant) {
    participant.lat = lat;
    participant.lng = lng;
    if (locationName) participant.locationName = locationName;
    if (distance) participant.distance = distance;
    if (eta) participant.eta = eta;

    broadcastToTrip(id, {
      type: 'location:updated',
      tripId: id,
      userId,
      lat,
      lng,
      locationName: participant.locationName,
      distance: participant.distance,
      eta: participant.eta,
    });
  }

  res.json({ success: true });
});

// HTTP server instance
const server = http.createServer(app);

// WebSocket Server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === 'subscribe') {
        const { tripId, userId } = msg;
        if (!tripId) return;

        socketMeta.set(ws, { tripId, userId });

        if (!tripRooms.has(tripId)) {
          tripRooms.set(tripId, new Set());
        }
        tripRooms.get(tripId)!.add(ws);

        // Send current sanitized trip state
        const trip = tripsStore.get(tripId);
        if (trip) {
          ws.send(
            JSON.stringify({
              type: 'sync',
              trip: sanitizeTripForClient(trip),
            })
          );
        }
      } else if (msg.type === 'destination:update') {
        const { tripId, destination, updatedBy } = msg;
        const trip = tripsStore.get(tripId);
        if (trip && trip.status === 'active') {
          trip.destination = destination;
          broadcastToTrip(tripId, {
            type: 'destination:updated',
            tripId,
            destination,
            updatedBy: updatedBy || 'A convoy participant',
            timestamp: Date.now(),
            trip: sanitizeTripForClient(trip),
          });
        }
      } else if (msg.type === 'trip:end') {
        const { tripId, endedBy, reason } = msg;
        const trip = tripsStore.get(tripId);
        if (trip) {
          trip.status = 'ended';
          trip.endedBy = endedBy || 'Convoy Member';
          trip.endedReason = reason || 'Manual stop';
          trip.endedAt = Date.now();
          const sanitized = sanitizeTripForClient(trip);

          broadcastToTrip(tripId, {
            type: 'trip:ended',
            tripId,
            endedBy: trip.endedBy,
            reason: trip.endedReason,
            endedAt: trip.endedAt,
            trip: sanitized,
            message: `Trip was ended by ${trip.endedBy}. Live location sharing has stopped.`,
          });
        }
      }
    } catch (e) {
      console.error('WS parse error:', e);
    }
  });

  ws.on('close', () => {
    const meta = socketMeta.get(ws);
    if (meta && meta.tripId) {
      const room = tripRooms.get(meta.tripId);
      if (room) {
        room.delete(ws);
        if (room.size === 0) {
          tripRooms.delete(meta.tripId);
        }
      }
    }
  });
});

const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`RouteMitra server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
