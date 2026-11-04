# RouteMitra Flutter mobile app — deployment pack

This package is the **Flutter Android/iOS application source overlay** for the existing `C:\Projects\routemitra` project. The screens are styled to follow the supplied RouteMitra reference: deep navy surfaces, cyan/blue gradients, logo-led splash/onboarding, account screens, dashboard tiles, trip cards, profile, and a Google Maps convoy screen.

The supplied RouteMitra logo has been prepared as a transparent PNG at `assets/images/route_mitra_logo.png` and is used by the Flutter UI and launcher-icon configuration.

## Repository review and scope

The GitHub repository `bhargavjavvaji6/RouteMitra` currently contains both a React/Vite web project at the repository root and a Flutter application under `lib/` with Android project files. The existing README describes the React web app. **This deployment pack targets the Flutter mobile app** because the requested deliverables are Android and iOS applications.

The current GitHub Android Gradle source uses `com.routemitra.routemitra` for both `namespace` and `applicationId`; the repository's `google-services.json` includes a matching Firebase Android client (and an additional `com.example.routemitra` client). Keep the native `applicationId`, `google-services.json`, and generated `firebase_options.dart` in sync. Do not type a package ID as a PowerShell command.

The existing Flutter sources were reviewed. Important gaps in the earlier implementation included:

- the splash/auth flow could show Home even when no user was signed in;
- signup/login had minimal validation and limited Firebase error handling;
- the home screen was only a small create/join list and did not match the supplied UI reference;
- My Trips and Profile screens were missing;
- the live map uploaded locations but did not maintain a continuously updated user marker or show a computed route;
- route calculation and turn instructions were not implemented.

This pack replaces the Flutter `lib/` source with a fuller native Flutter UI and app flow. It keeps the existing Firebase configuration file untouched during installation.

## Install into the existing Windows project

1. Extract this ZIP.
2. Open PowerShell in the extracted folder.
3. Run the installer, providing your existing project path:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\install_to_existing_project.ps1 -ProjectPath "C:\Projects\routemitra"
```

The installer backs up the current `lib` folder and `pubspec.yaml`, copies the new Flutter source and logo asset, and does **not** replace your `android/`, `ios/`, `google-services.json`, or existing `lib/firebase_options.dart`.

Or copy these items manually into your existing project:

- `lib/`
- `assets/`
- `pubspec.yaml`
- `firestore.rules`

Keep your generated `lib/firebase_options.dart` and native platform folders.

## Firebase setup

The app uses Firebase Authentication (email/password) and Cloud Firestore.

1. In Firebase Console, open the existing `routemitra` project.
2. Enable **Authentication → Sign-in method → Email/Password**.
3. Create/enable a Cloud Firestore database.
4. Keep the existing Android `google-services.json` that matches your Android `applicationId`.
5. In PowerShell:

```powershell
cd C:\Projects\routemitra
flutterfire configure --project=routemitra --platforms=android
flutter pub get
```

6. Merge the `firestore` object from `platform_setup/firebase_firestore_config_snippet.json` into your existing `firebase.json` (do not delete the existing `flutter` configuration). Then deploy the starter rules from this package (review them for your production policy first):

```powershell
firebase deploy --only firestore:rules
```

**iOS:** On a Mac with Xcode, run:

```bash
cd /path/to/routemitra
flutterfire configure --project=routemitra --platforms=android,ios
```

This generates the iOS Firebase options. Keep the app's bundle identifier consistent with the iOS app registered in Firebase.

## Google Maps and navigation setup

The live map uses `google_maps_flutter`, `geolocator`, and the Google Directions API.

Enable the following APIs in the same Google Cloud project and attach billing as required by Google Maps Platform:

- Maps SDK for Android
- Maps SDK for iOS (for the iOS build)
- Directions API (the sample route provider currently calls the Directions API endpoint)

### Android

Merge the additions in `platform_setup/android/AndroidManifest_additions.xml` into `android/app/src/main/AndroidManifest.xml`.

Add the manifest placeholder from `platform_setup/android/Gradle_manifest_placeholder_snippet.kts` inside the existing `android { defaultConfig { ... } }` block in `android/app/build.gradle.kts`.

Put the key in your user-level Gradle properties file, `%USERPROFILE%\.gradle\gradle.properties` (create the `.gradle` folder/file if missing; do not commit a real key):

```properties
MAPS_API_KEY=YOUR_RESTRICTED_ANDROID_MAPS_KEY
```

Restrict the Android Maps key by Android package name and signing certificate SHA-1 in Google Cloud Console.

### iOS

On a Mac, merge `platform_setup/ios/InfoPlist_location_keys.xml` into `ios/Runner/Info.plist` and add the Google Maps SDK key as described in `platform_setup/ios/AppDelegate_GoogleMaps_Snippet.swift` to the generated `AppDelegate.swift`. Restrict the iOS key by bundle identifier.

### Directions API key for the Dart sample

For local testing, pass a separate key using `--dart-define`:

```powershell
flutter run --dart-define=GOOGLE_MAPS_API_KEY=YOUR_DIRECTIONS_API_KEY
```

The same define must be passed to APK/AAB builds:

```powershell
flutter build apk --release --dart-define=GOOGLE_MAPS_API_KEY=YOUR_DIRECTIONS_API_KEY
```

A key embedded in a mobile app can be extracted. **Do not use an unrestricted API key.** For production, proxy Directions API calls through a secured backend, apply API restrictions and quotas, and do not commit keys to Git.

## Run and build Android

Connect an Android phone with Developer options and USB debugging enabled, or start an Android emulator.

```powershell
flutter devices
flutter pub get
flutter analyze
flutter run --dart-define=GOOGLE_MAPS_API_KEY=YOUR_DIRECTIONS_API_KEY
```

Build a debug APK:

```powershell
flutter build apk --debug --dart-define=GOOGLE_MAPS_API_KEY=YOUR_DIRECTIONS_API_KEY
```

Build a release APK:

```powershell
flutter build apk --release --dart-define=GOOGLE_MAPS_API_KEY=YOUR_DIRECTIONS_API_KEY
```

Build an Android App Bundle for Play Console:

```powershell
flutter build appbundle --release --dart-define=GOOGLE_MAPS_API_KEY=YOUR_DIRECTIONS_API_KEY
```

The release build still requires your own Android signing configuration before publishing. The current local debug signing is not a production signing setup.

## iOS build

A native iOS build requires macOS and Xcode. From a Mac after configuring Firebase and Google Maps:

```bash
flutter pub get
flutter analyze
cd ios && pod install && cd ..
flutter run
flutter build ipa --release --dart-define=GOOGLE_MAPS_API_KEY=YOUR_DIRECTIONS_API_KEY
```

Set up Apple signing/team provisioning in Xcode before creating a distributable IPA.

## Implemented in this pack

- Splash/loading and first-run onboarding
- Firebase auth gate (signed-out users see Sign In; signed-in users see the app)
- Email/password registration, profile persistence, verification email, password reset, and sign out
- Home dashboard, create trip, join trip, My Trips, Profile
- Firestore trip documents and member list/location snapshots
- Google Maps screen with foreground GPS stream, convoy markers, route polyline, route summary, and turn-step card
- Automatic turn-step progress when the current location approaches the next step endpoint
- App logo asset and a launcher icon setup in `pubspec.yaml`

## Important limitations before public release

- This is a **working starter implementation**, not a completed commercial navigation product. Test every flow on real devices and with your own Firebase/Maps project.
- Directions currently use the Google Directions API response format. API entitlement, billing, quotas, traffic availability, and regional routing depend on your Google Cloud setup.
- Turn cards show route-step instructions and basic proximity-based step advancement; this is not a full voice-guided navigation engine.
- Location sharing is foreground-only in this starter. Background location, Android foreground services, iOS background modes, battery optimisation, safety notifications, and privacy consent need separate implementation and store-policy review.
- Firestore rules are a starter baseline. Have them reviewed and tightened for your threat model before production; do not allow public read/write access.
- Google/Apple social sign-in buttons are not wired in this build; enable the providers and add their native sign-in configuration before exposing them.
- The image collage is a visual target; screen layout adapts to mobile constraints rather than being a pixel-for-pixel clone.
- Tailwind CSS is not used in this Flutter app. Tailwind is for the React/Vite web project; Flutter's Material 3 theme/widgets provide the native Android/iOS styling.

## Project layout

```text
lib/
  core/                 theme and UI helpers
  models/               user and trip models
  screens/              onboarding, auth, home, trips, profile, map
  services/             Firebase auth, Firestore trips, GPS, directions
  widgets/              logo and gradient button
assets/images/          supplied RouteMitra logo
firestore.rules          starter Firestore security rules
platform_setup/          Android/iOS native configuration snippets
scripts/                 PowerShell overlay installer
```
