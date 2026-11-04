import 'package:cloud_firestore/cloud_firestore.dart';

class TripModel {
  final String id;
  final String code;
  final String name;
  final String createdBy;
  final String status;
  final GeoPoint? destination;
  final String destinationName;

  const TripModel({
    required this.id,
    required this.code,
    required this.name,
    required this.createdBy,
    required this.status,
    required this.destinationName,
    this.destination,
  });

  factory TripModel.fromDoc(DocumentSnapshot<Map<String, dynamic>> doc) {
    final d = doc.data() ?? {};
    return TripModel(
      id: doc.id,
      code: (d['code'] ?? '') as String,
      name: (d['name'] ?? 'My convoy') as String,
      createdBy: (d['createdBy'] ?? '') as String,
      status: (d['status'] ?? 'active') as String,
      destinationName: (d['destinationName'] ?? '') as String,
      destination: d['destination'] as GeoPoint?,
    );
  }
}
