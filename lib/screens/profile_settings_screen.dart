import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/auth_service.dart';

class ProfileSettingsScreen extends StatefulWidget {
  const ProfileSettingsScreen({super.key});
  @override
  State<ProfileSettingsScreen> createState() => _ProfileSettingsScreenState();
}

class _ProfileSettingsScreenState extends State<ProfileSettingsScreen> {
  bool _voice = true, _arrival = true, _dark = true;
  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final p = await SharedPreferences.getInstance();
    if (!mounted) return;
    setState(() {
      _voice = p.getBool('pref_voice') ?? true;
      _arrival = p.getBool('pref_arrival') ?? true;
      _dark = p.getBool('pref_dark') ?? true;
    });
  }

  Future<void> _save(String key, bool value) async {
    final p = await SharedPreferences.getInstance();
    await p.setBool(key, value);
  }

  @override
  Widget build(BuildContext context) {
    final user = AuthService().currentUser;
    return Scaffold(
        appBar: AppBar(title: const Text('Your Profile')),
        body: ListView(padding: const EdgeInsets.all(18), children: [
          Card(
              child: ListTile(
            leading: CircleAvatar(
                child: Text((user?.displayName ?? user?.email ?? 'R')
                    .substring(0, 1)
                    .toUpperCase())),
            title: Text(user?.displayName ?? 'RouteMitra traveller'),
            subtitle: Text(user?.email ?? ''),
          )),
          const SizedBox(height: 12),
          SwitchListTile(
              title: const Text('Voice navigation'),
              subtitle: const Text('Speak turn instructions'),
              value: _voice,
              onChanged: (v) {
                setState(() => _voice = v);
                _save('pref_voice', v);
              }),
          SwitchListTile(
              title: const Text('Arrival alerts'),
              subtitle: const Text('Notify when near destination'),
              value: _arrival,
              onChanged: (v) {
                setState(() => _arrival = v);
                _save('pref_arrival', v);
              }),
          SwitchListTile(
              title: const Text('Dark appearance'),
              value: _dark,
              onChanged: (v) {
                setState(() => _dark = v);
                _save('pref_dark', v);
              }),
          ListTile(
              leading: const Icon(Icons.offline_pin),
              title: const Text('Offline route snapshot'),
              subtitle: const Text(
                  'Saves route instructions locally; map tiles are not downloaded.')),
          ListTile(
              leading: const Icon(Icons.privacy_tip_outlined),
              title: const Text('Privacy & location'),
              subtitle: const Text(
                  'Location is shared with members of your active trip.')),
          const SizedBox(height: 18),
          FilledButton.tonalIcon(
              onPressed: () => AuthService().signOut(),
              icon: const Icon(Icons.logout),
              label: const Text('Sign out')),
        ]));
  }
}
