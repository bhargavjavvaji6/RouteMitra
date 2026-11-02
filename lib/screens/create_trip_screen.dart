import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import '../models/trip_model.dart';
import '../services/trip_service.dart';
import 'live_map_screen.dart';
class CreateTripScreen extends StatefulWidget { const CreateTripScreen({super.key}); @override State<CreateTripScreen> createState() => _CreateTripScreenState(); }
class _CreateTripScreenState extends State<CreateTripScreen> {
  final _name = TextEditingController(text: 'My group trip'); final _destination = TextEditingController(); bool _loading = false;
  @override void dispose() { _name.dispose(); _destination.dispose(); super.dispose(); }
  void _message(String s) => ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(s)));
  Future<void> _create() async {
    final user = FirebaseAuth.instance.currentUser; if (user == null) { _message('Please sign in first.'); return; }
    if (_name.text.trim().isEmpty) { _message('Enter a trip name.'); return; } setState(() => _loading = true);
    try { final TripModel trip = await TripService().createTrip(name: _name.text, ownerId: user.uid, ownerName: user.displayName ?? user.email ?? 'Trip owner', destination: _destination.text);
      if (!mounted) return; await Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => LiveMapScreen(trip: trip)));
    } catch (e) { _message('Could not create trip: $e'); } finally { if (mounted) setState(() => _loading = false); }
  }
  @override Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Create trip')), body: ListView(padding: const EdgeInsets.all(20), children: [
    TextField(controller: _name, decoration: const InputDecoration(labelText: 'Trip name')), const SizedBox(height: 14),
    TextField(controller: _destination, decoration: const InputDecoration(labelText: 'Destination (optional)')), const SizedBox(height: 22),
    FilledButton.icon(onPressed: _loading ? null : _create, icon: const Icon(Icons.add_location_alt), label: Text(_loading ? 'Creating...' : 'Create trip and open map'))
  ]));
}
