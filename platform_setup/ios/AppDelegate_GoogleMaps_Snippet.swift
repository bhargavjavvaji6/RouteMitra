// For the Google Maps Flutter plugin, merge the GoogleMaps import and API-key
// call into the generated ios/Runner/AppDelegate.swift on a Mac with Xcode.
// Do not replace the entire AppDelegate with this snippet.

import GoogleMaps

// Inside application(_:didFinishLaunchingWithOptions:), before registering plugins:
GMSServices.provideAPIKey("YOUR_GOOGLE_MAPS_API_KEY")
