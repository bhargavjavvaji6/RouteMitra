# RouteMitra Phase 2 – Flutter implementation

This patch adds a feature-complete **foreground navigation foundation** to the existing Flutter/Firebase app. It is designed to merge into the repository; it does not replace the existing `android/` or `ios/` folders wholesale.

## Features included
- Home dashboard with Quick Trip, Planned Trip, Joined Trips and a recent trips stream.
- Destination search via Google Places REST API (requires Places API enabled).
- Google Directions route geometry, maneuver steps, ETA and distance (requires Directions API enabled).
- Google Maps polylines and step-by-step foreground navigation.
- Firebase Realtime Firestore member-location stream (the existing trip service's members subcollection).
- Spoken turn instruction announcements using `flutter_tts`.
- Arrival detection using distance-to-destination threshold.
- Arrival celebration screen.
- Profile settings and persistent preferences.
- Offline trip snapshot: saves last route geometry and steps locally for reference when connectivity is lost. **Google Maps base-map tiles are not downloaded**; Google Maps SDK does not expose an offline tile-pack API. Full offline map tiles require a different map provider/SDK and licensing.
- iOS Runner configuration templates and setup checklist.

## Merge
Copy `lib/` into the project, merging folders. Update `pubspec.yaml` dependencies as shown below. Keep existing Firebase project IDs and Android/iOS native files unless explicitly directed.

```yaml
dependencies:
  flutter:
    sdk: flutter
  firebase_core: ^4.0.0
  firebase_auth: ^6.0.0
  cloud_firestore: ^6.0.0
  google_maps_flutter: ^2.12.0
  geolocator: ^14.0.0
  shared_preferences: ^2.5.3
  uuid: ^4.5.1
  http: ^1.4.0
  flutter_tts: ^4.2.3
  video_player: ^2.9.5
```

Do not blindly replace the whole `pubspec.yaml`; merge dependencies and preserve your existing asset declarations and app version.

## Required configuration
1. Set `GOOGLE_MAPS_API_KEY` as a Dart compile-time define when running/building:
   - PowerShell: `flutter run --dart-define=GOOGLE_MAPS_API_KEY=YOUR_KEY`
   - APK: `flutter build apk --release --dart-define=GOOGLE_MAPS_API_KEY=YOUR_KEY`
2. Enable **Maps SDK for Android**, **Maps SDK for iOS**, **Places API**, and **Directions API** in Google Cloud. Restrict keys by platform and API. For production, proxy Places/Directions requests through a secured backend; do not expose an unrestricted server key in the app.
3. iOS: add `GoogleService-Info.plist` from Firebase Console to `ios/Runner/` in Xcode; ensure it is included in Runner target. Run `flutterfire configure` on macOS with Xcode installed to generate a real `firebase_options.dart` for iOS. The template in this patch intentionally does not invent Firebase credentials.
4. iOS: add location usage descriptions from `ios/Runner/Info.plist.template` to the existing Info.plist; do not overwrite your existing plist wholesale.
5. Android: add `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `INTERNET` and the Maps API metadata to the existing `android/app/src/main/AndroidManifest.xml`.
6. Configure Firebase Authentication (Email/Password) and Firestore. Apply `firestore.rules` only after reviewing them against your data model. The patch's security notes are in `docs/FIREBASE_AND_SECURITY.md`.

## Important behavior/security notes
- This navigation implementation works while the app is open/in foreground. True background location tracking needs Android foreground-service configuration, iOS background location capability, permission flows, battery policy handling, and App Store/Play Store disclosures. Do not claim background tracking until that is implemented and tested.
- A client-side Firestore location stream is real-time while connected. Firestore rules must restrict a member to writing only their own member document.
- Invite codes must be unique. For production, generate codes in a trusted Cloud Function/transaction and maintain a unique `inviteCodes/{code}` lookup document. Do not rely on client-side random generation alone.
- Arrival threshold defaults to 80 metres and should be tuned/tested in the field.
- Promotional video: add your licensed MP4 at `assets/video/route_mitra_intro.mp4` and declare it in `pubspec.yaml` under `flutter: assets:`. The dashboard auto-plays it muted and loops; it displays a branded fallback until the file is added. A video file cannot be fabricated from the logo/reference screenshot.
- Offline snapshot stores route instructions and encoded polyline only; it is not an offline map tile pack.

## Validation
```powershell
flutter pub get
dart format lib
flutter analyze
flutter test
flutter build apk --debug --dart-define=GOOGLE_MAPS_API_KEY=YOUR_KEY
```
For iOS, run on macOS:
```bash
flutterfire configure
cd ios && pod install && cd ..
flutter build ios --no-codesign --dart-define=GOOGLE_MAPS_API_KEY=YOUR_KEY
```
