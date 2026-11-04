import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/route_plan.dart';

class RouteCacheService {
  static const _key = 'routemitra.last_route_snapshot';
  Future<void> save(RoutePlan plan) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, jsonEncode(plan.toJson()));
  }

  Future<RoutePlan?> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == null) return null;
    try {
      return RoutePlan.fromJson(jsonDecode(raw));
    } catch (_) {
      return null;
    }
  }

  Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_key);
  }
}
