import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../core/app_theme.dart';
import '../models/trip_models.dart';

class MusicScreen extends StatefulWidget {
  const MusicScreen({super.key});

  @override
  State<MusicScreen> createState() => _MusicScreenState();
}

class _MusicScreenState extends State<MusicScreen> {
  String _selectedSource = 'spotify'; // 'spotify', 'youtube', 'device'
  int _currentTrackIndex = 0;
  bool _isPlaying = true;
  bool _isFavorite = false;
  final _searchController = TextEditingController();

  final List<MusicTrack> _tracks = [
    MusicTrack(
      title: 'Highway',
      artist: 'A. R. Rahman',
      source: 'spotify',
      duration: const Duration(minutes: 4, seconds: 32),
    ),
    MusicTrack(
      title: 'Safar',
      artist: 'Jubin Nautiyal',
      source: 'spotify',
      duration: const Duration(minutes: 3, seconds: 45),
    ),
    MusicTrack(
      title: 'Kesariya',
      artist: 'Arijit Singh',
      source: 'spotify',
      duration: const Duration(minutes: 4, seconds: 28),
    ),
    MusicTrack(
      title: 'Top Hits 2024',
      artist: 'Playlist • Spotify',
      source: 'spotify',
      duration: const Duration(minutes: 3, seconds: 20),
    ),
    MusicTrack(
      title: 'Ilahi',
      artist: 'A. R. Rahman',
      source: 'spotify',
      duration: const Duration(minutes: 5, seconds: 15),
    ),
  ];

  MusicTrack get _currentTrack => _tracks[_currentTrackIndex];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.darkBg,
      appBar: AppBar(
        backgroundColor: AppTheme.darkBg,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Music for the Journey',
          style: TextStyle(fontWeight: FontWeight.w800, color: Colors.white),
        ),
      ),
      body: Column(
        children: [
          // ── Source selector ──
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                _sourceChip('Spotify', Icons.music_note_rounded,
                    AppTheme.spotify, 'spotify'),
                const SizedBox(width: 10),
                _sourceChip('YouTube', Icons.play_circle_fill_rounded,
                    AppTheme.youtube, 'youtube'),
                const SizedBox(width: 10),
                _sourceChip(
                    'Device', Icons.phone_android_rounded, Colors.white60, 'device'),
              ],
            ),
          ).animate().fadeIn(duration: 400.ms),

          const SizedBox(height: 16),

          // ── Search bar ──
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Container(
              decoration: BoxDecoration(
                color: AppTheme.darkSurface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF2D3D4F)),
              ),
              child: TextField(
                controller: _searchController,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  prefixIcon: Icon(
                    Icons.search,
                    color: Colors.white.withValues(alpha: 0.5),
                  ),
                  hintText: 'Search songs, artists...',
                  hintStyle: TextStyle(
                    color: Colors.white.withValues(alpha: 0.4),
                  ),
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                ),
              ),
            ),
          ),

          const SizedBox(height: 16),

          // ── Track list ──
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _tracks.length,
              itemBuilder: (context, index) {
                return _trackTile(index);
              },
            ),
          ),

          // ── Now Playing bar ──
          _nowPlayingBar(),
        ],
      ),
    );
  }

  Widget _sourceChip(
      String label, IconData icon, Color color, String key) {
    final selected = _selectedSource == key;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _selectedSource = key),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: selected
                ? color.withValues(alpha: 0.15)
                : AppTheme.darkSurface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: selected ? color : const Color(0xFF2D3D4F),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: selected ? color : Colors.white38, size: 18),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  color: selected ? color : Colors.white38,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _trackTile(int index) {
    final track = _tracks[index];
    final isCurrentTrack = index == _currentTrackIndex;

    return GestureDetector(
      onTap: () {
        setState(() {
          _currentTrackIndex = index;
          _isPlaying = true;
        });
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isCurrentTrack
              ? AppTheme.primary.withValues(alpha: 0.15)
              : AppTheme.darkCard,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isCurrentTrack
                ? AppTheme.primary.withValues(alpha: 0.4)
                : const Color(0xFF2D3D4F),
          ),
        ),
        child: Row(
          children: [
            // Album art placeholder
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    isCurrentTrack
                        ? AppTheme.primary
                        : const Color(0xFF3A4A5E),
                    isCurrentTrack
                        ? AppTheme.mint
                        : const Color(0xFF4A5A6E),
                  ],
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(
                isCurrentTrack
                    ? Icons.music_note_rounded
                    : Icons.album_rounded,
                color: Colors.white.withValues(alpha: 0.8),
                size: 22,
              ),
            ),
            const SizedBox(width: 14),

            // Track info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    track.title,
                    style: TextStyle(
                      color: isCurrentTrack ? AppTheme.mint : Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    track.artist,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.5),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),

            // Duration
            Text(
              '${track.duration.inMinutes}:${(track.duration.inSeconds % 60).toString().padLeft(2, '0')}',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.4),
                fontSize: 12,
              ),
            ),

            if (isCurrentTrack) ...[
              const SizedBox(width: 8),
              Icon(
                Icons.equalizer_rounded,
                color: AppTheme.mint,
                size: 20,
              ),
            ],
          ],
        ),
      ),
    ).animate(delay: Duration(milliseconds: 50 * index))
        .fadeIn(duration: 300.ms);
  }

  Widget _nowPlayingBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 32),
      decoration: BoxDecoration(
        color: AppTheme.darkCard,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 20,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // ── Progress bar ──
          ClipRRect(
            borderRadius: BorderRadius.circular(2),
            child: LinearProgressIndicator(
              value: 0.45,
              backgroundColor: Colors.white.withValues(alpha: 0.1),
              valueColor: const AlwaysStoppedAnimation(AppTheme.mint),
              minHeight: 3,
            ),
          ),

          const SizedBox(height: 12),

          Row(
            children: [
              // Track info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _currentTrack.title,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      _currentTrack.artist,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.5),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),

              // ── Controls ──
              IconButton(
                onPressed: () {
                  setState(() => _isFavorite = !_isFavorite);
                },
                icon: Icon(
                  _isFavorite ? Icons.favorite : Icons.favorite_border,
                  color: _isFavorite ? Colors.red : Colors.white54,
                ),
              ),
              IconButton(
                onPressed: () {
                  if (_currentTrackIndex > 0) {
                    setState(() => _currentTrackIndex--);
                  }
                },
                icon: const Icon(Icons.skip_previous_rounded, color: Colors.white),
              ),
              GestureDetector(
                onTap: () => setState(() => _isPlaying = !_isPlaying),
                child: Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: AppTheme.mint,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.mint.withValues(alpha: 0.4),
                        blurRadius: 16,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: Icon(
                    _isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded,
                    color: Colors.white,
                    size: 28,
                  ),
                ),
              ),
              IconButton(
                onPressed: () {
                  if (_currentTrackIndex < _tracks.length - 1) {
                    setState(() => _currentTrackIndex++);
                  }
                },
                icon: const Icon(Icons.skip_next_rounded, color: Colors.white),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
