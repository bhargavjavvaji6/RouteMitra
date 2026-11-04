# iOS setup checklist

The repository currently does not contain a complete, verified Firebase iOS registration. A valid `GoogleService-Info.plist` is project-specific and must be downloaded from the owner's Firebase Console; it cannot be generated from Android credentials.

1. On a Mac with Xcode installed, run `flutterfire configure --project=routemitra` and select iOS. This should generate the iOS options in `lib/firebase_options.dart`.
2. In Firebase Console, add/register the iOS app with the exact bundle identifier from `ios/Runner.xcodeproj` (or set one in Xcode), download `GoogleService-Info.plist`, drag it into `ios/Runner` in Xcode and tick **Copy items if needed** and Runner target membership.
3. Enable Email/Password in Firebase Authentication.
4. In Google Cloud, enable Maps SDK for iOS, Places API and Directions API. Restrict the iOS key by bundle ID and APIs.
5. Add the location permission descriptions from `Info.plist.template` to the existing `ios/Runner/Info.plist`.
6. In Xcode Runner target > Signing & Capabilities, set a Team and a unique Bundle Identifier.
7. Run `cd ios && pod install && cd ..`, then `flutter build ios --no-codesign --dart-define=GOOGLE_MAPS_API_KEY=...`.

Do not enable `UIBackgroundModes/location` until background location behavior, disclosure, battery impact and App Store review requirements are addressed. This patch currently tracks location only while the app is in use.
