import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
class TripInfoPanel extends StatelessWidget {
  const TripInfoPanel({super.key, required this.tripId, required this.memberCount, required this.destination});
  final String tripId; final int memberCount; final String destination;
  @override Widget build(BuildContext context) => Card(elevation: 4, child: Padding(padding: const EdgeInsets.all(12), child: Row(children: [
    const Icon(Icons.groups_2_outlined, size: 28), const SizedBox(width: 10),
    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
      Text('Trip code: $tripId', style: const TextStyle(fontWeight: FontWeight.bold)),
      Text('$memberCount member(s)${destination.isEmpty ? '' : ' • $destination'}')
    ])),
    IconButton(tooltip: 'Copy trip code', onPressed: () async { await Clipboard.setData(ClipboardData(text: tripId)); if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Trip code copied.'))); }, icon: const Icon(Icons.copy))
  ])));
}
