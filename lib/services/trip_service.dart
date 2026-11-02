import 'dart:math';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/trip_model.dart';
class TripService {
  TripService({FirebaseFirestore? firestore}) : _db = firestore ?? FirebaseFirestore.instance;
  final FirebaseFirestore _db;
  CollectionReference<Map<String, dynamic>> get _trips => _db.collection('trips');
  String _code() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; final r = Random.secure();
    return List.generate(6, (_) => chars[r.nextInt(chars.length)]).join();
  }
  Future<TripModel> createTrip({required String name, required String ownerId, required String ownerName, String destination = ''}) async {
    var code = _code();
    for (var i=0; i<5 && (await _trips.doc(code).get()).exists; i++) { code = _code(); }
    final trip = TripModel(id: code, name: name.trim(), ownerId: ownerId, ownerName: ownerName, isActive: true, memberIds: [ownerId], destination: destination.trim());
    await _trips.doc(code).set({...trip.toMap(), 'memberIds': [ownerId], 'members': {ownerId: {'name': ownerName, 'latitude': null, 'longitude': null, 'updatedAt': FieldValue.serverTimestamp()}}});
    return trip;
  }
  Future<TripModel> joinTrip({required String tripId, required String userId, required String userName}) async {
    final ref = _trips.doc(tripId.trim().toUpperCase()); final snap = await ref.get();
    if (!snap.exists) throw Exception('Trip code not found.');
    final data = snap.data()!;
    if (data['isActive'] != true) throw Exception('This trip is closed.');
    await ref.update({'memberIds': FieldValue.arrayUnion([userId]), 'members.$userId': {'name': userName, 'latitude': null, 'longitude': null, 'updatedAt': FieldValue.serverTimestamp()}});
    return TripModel.fromMap(snap.id, data);
  }
  Stream<TripModel?> watchTrip(String id) => _trips.doc(id).snapshots().map((s) => s.exists ? TripModel.fromMap(s.id, s.data()!) : null);
  Stream<DocumentSnapshot<Map<String, dynamic>>> watchTripDocument(String id) => _trips.doc(id).snapshots();
  Future<void> updateMemberLocation({required String tripId, required String userId, required String userName, required double latitude, required double longitude}) =>
    _trips.doc(tripId).update({'members.$userId': {'name': userName, 'latitude': latitude, 'longitude': longitude, 'updatedAt': FieldValue.serverTimestamp()}});
  Future<void> closeTrip(String id) => _trips.doc(id).update({'isActive': false});
}
