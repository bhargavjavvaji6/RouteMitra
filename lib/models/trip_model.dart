import 'package:cloud_firestore/cloud_firestore.dart';
class TripModel {
  const TripModel({required this.id, required this.name, required this.ownerId, required this.ownerName, required this.isActive, this.memberIds = const [], this.destination = '', this.createdAt});
  final String id, name, ownerId, ownerName, destination;
  final bool isActive;
  final List<String> memberIds;
  final DateTime? createdAt;
  factory TripModel.fromMap(String id, Map<String, dynamic> m) {
    final ts = m['createdAt'];
    return TripModel(id: id, name: m['name'] as String? ?? 'Group trip',
      ownerId: m['ownerId'] as String? ?? '', ownerName: m['ownerName'] as String? ?? '',
      isActive: m['isActive'] as bool? ?? true, memberIds: List<String>.from(m['memberIds'] as List? ?? const []),
      destination: m['destination'] as String? ?? '', createdAt: ts is Timestamp ? ts.toDate() : null);
  }
  Map<String, dynamic> toMap() => {'name': name, 'ownerId': ownerId, 'ownerName': ownerName,
    'isActive': isActive, 'memberIds': memberIds, 'destination': destination, 'createdAt': FieldValue.serverTimestamp()};
}
