import 'package:flutter/material.dart';
import '../models/route_plan.dart';

class ArrivalScreen extends StatelessWidget {
  const ArrivalScreen({super.key, required this.plan, required this.onDone});
  final RoutePlan plan;
  final VoidCallback onDone;
  @override
  Widget build(BuildContext context) => Scaffold(
      body: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(28),
          decoration: const BoxDecoration(
              gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                Color(0xff06213b),
                Color(0xff123d5a),
                Color(0xff06172d)
              ])),
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            const Icon(Icons.celebration_rounded,
                size: 100, color: Color(0xff00e5d4)),
            const SizedBox(height: 24),
            const Text('You’ve arrived!',
                style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Text(plan.destinationName,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 20, color: Colors.white70)),
            const SizedBox(height: 18),
            Text('${plan.distanceText}  •  ${plan.durationText}',
                style: const TextStyle(color: Colors.white70)),
            const SizedBox(height: 36),
            SizedBox(
                width: double.infinity,
                child: FilledButton(
                    onPressed: onDone, child: const Text('Back to dashboard'))),
          ])));
}
