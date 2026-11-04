import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../services/trip_service.dart';
import '../models/trip_model.dart';
import 'live_map_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _tripName = TextEditingController();
  final _code = TextEditingController();
  bool _busy = false;

  Future<void> _run(Future<String> Function() action) async {
    setState(() {
      _busy = true;
    });

    try {
      final id = await action();

      if (!mounted) {
        return;
      }

      await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => LiveMapScreen(tripId: id),
        ),
      );
    } catch (e) {
      if (!mounted) {
        return;
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            e.toString().replaceFirst('Exception: ', ''),
          ),
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _busy = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _tripName.dispose();
    _code.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = AuthService().currentUser;
    return Scaffold(
      appBar: AppBar(
        title: const Text('RouteMitra',
            style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
              onPressed: () => AuthService().signOut(),
              icon: const Icon(Icons.logout))
        ],
      ),
      body: ListView(padding: const EdgeInsets.all(18), children: [
        Text('Hi, ${user?.displayName ?? user?.email ?? 'Traveller'} 👋',
            style: const TextStyle(fontSize: 23, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        const Text('Travel together. Stay connected.',
            style: TextStyle(color: Colors.white70)),
        const SizedBox(height: 24),
        _actionCard(Icons.route, 'Start a new trip',
            'Create a convoy and invite your friends.', () {
          showDialog(
              context: context,
              builder: (ctx) => AlertDialog(
                    title: const Text('Create trip'),
                    content: TextField(
                        controller: _tripName,
                        decoration:
                            const InputDecoration(labelText: 'Trip name')),
                    actions: [
                      TextButton(
                          onPressed: () => Navigator.pop(ctx),
                          child: const Text('Cancel')),
                      FilledButton(
                          onPressed: _busy
                              ? null
                              : () {
                                  Navigator.pop(ctx);
                                  _run(() =>
                                      TripService().createTrip(_tripName.text));
                                },
                          child: const Text('Create')),
                    ],
                  ));
        }),
        const SizedBox(height: 12),
        _actionCard(Icons.group_add, 'Join a trip',
            'Enter the 6-character invite code.', () {
          showDialog(
              context: context,
              builder: (ctx) => AlertDialog(
                    title: const Text('Join convoy'),
                    content: TextField(
                        controller: _code,
                        textCapitalization: TextCapitalization.characters,
                        decoration:
                            const InputDecoration(labelText: 'Trip code')),
                    actions: [
                      TextButton(
                          onPressed: () => Navigator.pop(ctx),
                          child: const Text('Cancel')),
                      FilledButton(
                          onPressed: _busy
                              ? null
                              : () {
                                  Navigator.pop(ctx);
                                  _run(
                                      () => TripService().joinTrip(_code.text));
                                },
                          child: const Text('Join')),
                    ],
                  ));
        }),
        const SizedBox(height: 26),
        const Text('Your active trips',
            style: TextStyle(fontSize: 19, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        StreamBuilder<List<TripModel>>(
          stream: TripService().myActiveTrips(),
          builder: (context, snap) {
            if (snap.hasError) {
              return Text('Could not load trips: ${snap.error}');
            }

            if (!snap.hasData) {
              return const Center(
                child: CircularProgressIndicator(),
              );
            }

            if (snap.data!.isEmpty) {
              return const Text(
                'No active trips yet. Create or join a trip to get started.',
                style: TextStyle(
                  color: Colors.white70,
                ),
              );
            }

            // Keep your existing trip-list implementation below this point.
            return Column(
                children: snap.data!
                    .map((t) => Card(
                          color: const Color(0xFF142B43),
                          child: ListTile(
                            leading: const CircleAvatar(child: Icon(Icons.map)),
                            title: Text(t.name),
                            subtitle: Text('Invite code: ${t.code}'),
                            trailing:
                                const Icon(Icons.arrow_forward_ios, size: 16),
                            onTap: () => Navigator.push(
                                context,
                                MaterialPageRoute(
                                    builder: (_) =>
                                        LiveMapScreen(tripId: t.id))),
                          ),
                        ))
                    .toList());
          },
        ),
      ]),
    );
  }

  Widget _actionCard(
          IconData icon, String title, String subtitle, VoidCallback onTap) =>
      Card(
          color: const Color(0xFF12334C),
          child: ListTile(
            contentPadding: const EdgeInsets.all(16),
            leading: Icon(icon, color: const Color(0xFF00DDEB), size: 32),
            title: Text(title,
                style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text(subtitle),
            trailing: const Icon(Icons.arrow_forward),
            onTap: onTap,
          ));
}
