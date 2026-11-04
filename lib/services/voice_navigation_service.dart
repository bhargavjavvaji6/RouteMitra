import 'package:flutter_tts/flutter_tts.dart';

class VoiceNavigationService {
  final FlutterTts _tts = FlutterTts();
  Future<void> initialize() async {
    await _tts.setLanguage('en-IN');
    await _tts.setSpeechRate(0.48);
    await _tts.setPitch(1.0);
    await _tts.awaitSpeakCompletion(true);
  }

  Future<void> speak(String text) async {
    if (text.trim().isNotEmpty) await _tts.speak(text);
  }

  Future<void> stop() => _tts.stop();
  Future<void> dispose() => _tts.stop();
}
