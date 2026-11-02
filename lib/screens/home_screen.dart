import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'create_trip_screen.dart';
import 'join_trip_screen.dart';
import 'login_screen.dart';
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});
  @override Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    final name = user?.displayName?.trim().isNotEmpty == true ? user!.displayName! : (user?.email ?? 'Traveller');
    return Scaffold(appBar: AppBar(title: const Text('RouteMitra'), actions: [IconButton(tooltip: 'Sign out', onPressed: () async { await FirebaseAuth.instance.signOut(); if (!context.mounted) return; Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const LoginScreen()), (_) => false); }, icon: const Icon(Icons.logout))]),
      body: ListView(padding: const EdgeInsets.all(20), children: [
        Container(padding: const EdgeInsets.all(22), decoration: BoxDecoration(color: const Color(0xFF176B87), borderRadius: BorderRadius.circular(22)), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Icon(Icons.route_rounded, color: Colors.white, size: 40), const SizedBox(height: 12),
          Text('Hello, $name', style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8), const Text('Travel together. Stay connected.', style: TextStyle(color: Colors.white))
        ])),
        const SizedBox(height: 22),
        _ActionCard(icon: Icons.add_location_alt_outlined, title: 'Create a trip', subtitle: 'Start a group trip and share its code.', onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CreateTripScreen()))),
        const SizedBox(height: 12),
        _ActionCard(icon: Icons.group_add_outlined, title: 'Join a trip', subtitle: 'Enter the code shared by your group.', onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const JoinTripScreen())))
      ]));
  }
}
class _ActionCard extends StatelessWidget {
  const _ActionCard({required this.icon, required this.title, required this.subtitle, required this.onTap});
  final IconData icon; final String title, subtitle; final VoidCallback onTap;
  @override Widget build(BuildContext context) => Card(child: ListTile(contentPadding: const EdgeInsets.all(16), leading: CircleAvatar(radius: 27, child: Icon(icon, size: 28)), title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)), subtitle: Padding(padding: const EdgeInsets.only(top: 5), child: Text(subtitle)), trailing: const Icon(Icons.chevron_right), onTap: onTap));
}
