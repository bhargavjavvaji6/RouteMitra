import 'dart:async';
import 'package:flutter/material.dart';
import '../services/directions_service.dart';

class DestinationSearchScreen extends StatefulWidget {
  const DestinationSearchScreen({super.key});
  @override
  State<DestinationSearchScreen> createState() =>
      _DestinationSearchScreenState();
}

class _DestinationSearchScreenState extends State<DestinationSearchScreen> {
  final _controller = TextEditingController();
  final _service = DirectionsService();
  Timer? _debounce;
  List<PlaceSuggestion> _items = [];
  bool _loading = false;
  String? _error;
  Future<void> _search(String q) async {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), () async {
      if (q.trim().length < 3) {
        if (mounted) setState(() => _items = []);
        return;
      }
      setState(() {
        _loading = true;
        _error = null;
      });
      try {
        final result = await _service.searchPlaces(q);
        if (mounted) setState(() => _items = result);
      } catch (e) {
        if (mounted) setState(() => _error = e.toString());
      } finally {
        if (mounted) setState(() => _loading = false);
      }
    });
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
      appBar: AppBar(title: const Text('Choose destination')),
      body: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(children: [
            TextField(
                controller: _controller,
                autofocus: true,
                onChanged: _search,
                decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.search),
                    hintText: 'Search city, place or address',
                    suffixIcon: _loading
                        ? const Padding(
                            padding: EdgeInsets.all(12),
                            child: SizedBox(
                                width: 18,
                                height: 18,
                                child:
                                    CircularProgressIndicator(strokeWidth: 2)))
                        : IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _controller.clear();
                              setState(() => _items = []);
                            }))),
            if (_error != null)
              Padding(
                  padding: const EdgeInsets.all(8),
                  child: Text(_error!,
                      style: const TextStyle(color: Colors.redAccent))),
            Expanded(
                child: ListView.builder(
                    itemCount: _items.length,
                    itemBuilder: (_, i) {
                      final item = _items[i];
                      return ListTile(
                          leading: const Icon(Icons.location_on_outlined),
                          title: Text(item.description),
                          onTap: () => Navigator.pop(context, item));
                    })),
          ])));
}
