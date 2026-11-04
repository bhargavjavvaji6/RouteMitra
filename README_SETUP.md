# RouteMitra Flutter starter

This starter provides the first working Android/iOS app flow:
- Email/password registration, sign-in and password reset (Firebase Authentication)
- Create a trip and generate a 6-character invite code
- Join an active trip with its invite code
- Live map and foreground GPS sharing to Firestore
- See the active trip and member count
- End a trip

## Important: preserve your existing native folders

Copy this package's `lib` folder and `assets` folder into `C:\Projects\routemitra`.
Do **not** replace or recreate your existing `android` or `ios` folders.
Keep your existing `lib/firebase_options.dart` initially; this package expects that file.

Replace/merge `pubspec.yaml` only after making a backup. Then run:
```powershell
cd C:\Projects\routemitra
flutter pub get
```

## Firebase setup

Your current Firebase options file shown in the chat only has Android configured. Android can use it, but iOS will throw `UnsupportedError` until you register/configure the iOS app.

1. In Firebase Console, open project `routemitra`.
2. Register the iOS app using the exact bundle identifier from `ios/Runner.xcodeproj` (or `ios/Runner/Info.plist`).
3. On a Mac with Xcode installed, run FlutterFire configure for both platforms:
   `flutterfire configure --project=routemitra --platforms=android,ios`
4. This regenerates `lib/firebase_options.dart` with Android and iOS options. Do not hand-write API keys into Dart source.
5. Enable Email/Password under Firebase Authentication > Sign-in method.
6. Create a Cloud Firestore database.

## Google Maps setup

- Enable **Maps SDK for Android** and **Maps SDK for iOS** in Google Cloud for the project.
- Add the Android API key to `android/app/src/main/AndroidManifest.xml` inside `<application>`:
  `<meta-data android:name="com.google.android.geo.API_KEY" android:value="YOUR_ANDROID_MAPS_KEY"/>`
- Add the iOS key to `ios/Runner/AppDelegate.swift` with `GMSServices.provideAPIKey("YOUR_IOS_MAPS_KEY")` before plugin registration.
- Restrict keys by Android package + SHA-1 / iOS bundle ID. Do not commit unrestricted production keys.
- iOS builds require macOS + Xcode. Windows can build/test Android only.

## Firestore security rules

Start with rules like the following, then tighten and test them before production:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() { return request.auth != null; }

    match /users/{uid} {
      allow read, write: if signedIn() && request.auth.uid == uid;
    }

    match /trips/{tripId} {
      allow read: if signedIn() &&
        request.auth.uid in resource.data.memberIds;
      allow create: if signedIn() &&
        request.auth.uid == request.resource.data.createdBy &&
        request.auth.uid in request.resource.data.memberIds;
      allow update: if signedIn() &&
        request.auth.uid in resource.data.memberIds;
      allow delete: if false;

      match /members/{uid} {
        allow read: if signedIn() &&
          request.auth.uid in get(/databases/$(database)/documents/trips/$(tripId)).data.memberIds;
        allow create, update: if signedIn() && request.auth.uid == uid &&
          request.auth.uid in get(/databases/$(database)/documents/trips/$(tripId)).data.memberIds;
        allow delete: if signedIn() && request.auth.uid == uid;
      }
    }
  }
}
```
These are starter rules, not a complete production security review. In particular, restrict who can end a trip and validate trip membership changes on a trusted backend before public release.

## Current scope / next development

This is a functional MVP foundation, not the entire polished reference design yet. It currently shares foreground location while the live-map screen is open. Background tracking, turn-by-turn navigation, route/destination search, route polylines, push notifications, social sign-in, profile/settings, trip history, and production-grade member marker rendering need additional implementation and testing. Background location needs platform-specific permissions and policy review.
