import 'dart:math';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/trip_model.dart';

class TripService {
  final _db = FirebaseFirestore.instance;
  final _auth = FirebaseAuth.instance;

  String get _uid => _auth.currentUser!.uid;

  String _newCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    final r = Random.secure();
    return List.generate(6, (_) => chars[r.nextInt(chars.length)]).join();
  }

  Future<String> createTrip(String name) async {
    final user = _auth.currentUser!;
    final ref = _db.collection('trips').doc();
    final code = _newCode();
    final batch = _db.batch();
    batch.set(ref, {
      'code': code,
      'name': name.trim().isEmpty ? 'My convoy' : name.trim(),
      'createdBy': user.uid,
      'createdByName': user.displayName ?? user.email ?? 'Driver',
      'status': 'active',
      'destinationName': '',
      'createdAt': FieldValue.serverTimestamp(),
      'memberIds': [user.uid],
    });
    batch.set(ref.collection('members').doc(user.uid), {
      'uid': user.uid,
      'name': user.displayName ?? user.email ?? 'Driver',
      'email': user.email,
      'latitude': null,
      'longitude': null,
      'updatedAt': FieldValue.serverTimestamp(),
    });
    await batch.commit();
    return ref.id;
  }

  Future<String> joinTrip(String code) async {
    final query = await _db
        .collection('trips')
        .where('code', isEqualTo: code.trim().toUpperCase())
        .where('status', isEqualTo: 'active')
        .limit(1)
        .get();
    if (query.docs.isEmpty)
      throw Exception('No active trip found for that code.');
    final trip = query.docs.first;
    final user = _auth.currentUser!;
    await trip.reference.collection('members').doc(_uid).set({
      'uid': _uid,
      'name': user.displayName ?? user.email ?? 'Member',
      'email': user.email,
      'latitude': null,
      'longitude': null,
      'updatedAt': FieldValue.serverTimestamp(),
    });
    await trip.reference.update({
      'memberIds': FieldValue.arrayUnion([_uid]),
    });
    return trip.id;
  }

  Stream<List<TripModel>> myActiveTrips() {
    return _db
        .collection('trips')
        .where('memberIds', arrayContains: _uid)
        .where('status', isEqualTo: 'active')
        .snapshots()
        .map((s) => s.docs.map(TripModel.fromDoc).toList());
  }

  Stream<QuerySnapshot<Map<String, dynamic>>> members(String tripId) =>
      _db.collection('trips').doc(tripId).collection('members').snapshots();

  Future<void> updateMyLocation(String tripId, double lat, double lng) async {
    await _db
        .collection('trips')
        .doc(tripId)
        .collection('members')
        .doc(_uid)
        .set({
      'uid': _uid,
      'name': _auth.currentUser?.displayName ?? 'Member',
      'email': _auth.currentUser?.email,
      'latitude': lat,
      'longitude': lng,
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  Future<void> endTrip(String tripId) async {
    await _db.collection('trips').doc(tripId).update({
      'status': 'completed',
      'endedAt': FieldValue.serverTimestamp(),
    });
  }
}
