// Add inside the existing android { defaultConfig { ... } } block
// in android/app/build.gradle.kts. Keep your existing namespace/applicationId.
manifestPlaceholders["MAPS_API_KEY"] =
    (project.findProperty("MAPS_API_KEY") as String?) ?: "YOUR_GOOGLE_MAPS_API_KEY"
