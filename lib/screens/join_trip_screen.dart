import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import '../models/trip_model.dart';
import '../services/trip_service.dart';
import 'live_map_screen.dart';
class JoinTripScreen extends StatefulWidget { const JoinTripScreen({super.key}); @override State<JoinTripScreen> createState() => _JoinTripScreenState(); }
class _JoinTripScreenState extends State<JoinTripScreen> {
  final _code = TextEditingController(); bool _loading = false;
  @override void dispose() { _code.dispose(); super.dispose(); }
  void _message(String s) => ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(s)));
  Future<void> _join() async {
    final user = FirebaseAuth.instance.currentUser; if (user == null) { _message('Please sign in first.'); return; }
    if (_code.text.trim().isEmpty) { _message('Enter a trip code.'); return; } setState(() => _loading = true);
    try { final TripModel trip = await TripService().joinTrip(tripId: _code.text, userId: user.uid, userName: user.displayName ?? user.email ?? 'Traveller');
      if (!mounted) return; await Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => LiveMapScreen(trip: trip)));
    } catch (e) { _message('Could not join trip: $e'); } finally { if (mounted) setState(() => _loading = false); }
  }
  @override Widget build(BuildContext context) => Scaffold(appBar: AppBar(title: const Text('Join trip')), body: Padding(padding: const EdgeInsets.all(20), child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
    const Text('Enter the 6-character code shared by the trip owner.'), const SizedBox(height: 18),
    TextField(controller: _code, textCapitalization: TextCapitalization.characters, maxLength: 6, decoration: const InputDecoration(labelText: 'Trip code')),
    const SizedBox(height: 14), FilledButton(onPressed: _loading ? null : _join, child: Text(_loading ? 'Joining...' : 'Join trip'))
  ])));
}
