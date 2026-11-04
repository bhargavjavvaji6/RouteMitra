import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

/// Add assets/video/route_mitra_intro.mp4 and declare it in pubspec.yaml.
/// Until the asset is supplied, the widget displays a branded hero fallback.
class PromotionalVideoHeader extends StatefulWidget {
  const PromotionalVideoHeader({super.key});
  @override
  State<PromotionalVideoHeader> createState() => _PromotionalVideoHeaderState();
}

class _PromotionalVideoHeaderState extends State<PromotionalVideoHeader> {
  VideoPlayerController? _controller;
  bool _failed = false;
  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    try {
      final c =
          VideoPlayerController.asset('assets/video/route_mitra_intro.mp4');
      await c.initialize();
      await c.setLooping(true);
      await c.setVolume(0);
      await c.play();
      if (mounted)
        setState(() => _controller = c);
      else
        c.dispose();
    } catch (_) {
      if (mounted) setState(() => _failed = true);
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = _controller;
    return ClipRRect(
        borderRadius: BorderRadius.circular(22),
        child: AspectRatio(
            aspectRatio: 16 / 9,
            child: Stack(fit: StackFit.expand, children: [
              if (c != null && c.value.isInitialized)
                FittedBox(
                    fit: BoxFit.cover,
                    child: SizedBox(
                        width: c.value.size.width,
                        height: c.value.size.height,
                        child: VideoPlayer(c)))
              else
                Container(
                    decoration: const BoxDecoration(
                        gradient: LinearGradient(colors: [
                      Color(0xff073d61),
                      Color(0xff153e74),
                      Color(0xff4a238a)
                    ])),
                    child: const Center(
                        child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                          Icon(Icons.route, size: 58, color: Color(0xff00e5e5)),
                          SizedBox(height: 8),
                          Text('Your journey starts here',
                              style: TextStyle(
                                  fontSize: 20, fontWeight: FontWeight.bold)),
                          Text('Plan • Navigate • Stay connected',
                              style: TextStyle(color: Colors.white70))
                        ]))),
              if (c != null && c.value.isInitialized)
                const Positioned(
                    left: 12,
                    bottom: 10,
                    child: Text('RouteMitra • Travel together',
                        style: TextStyle(fontWeight: FontWeight.bold, shadows: [
                          Shadow(blurRadius: 8, color: Colors.black)
                        ]))),
            ])));
  }
}
