
# SmartAgri Android (Kotlin + Jetpack Compose)

This repository is a **Kotlin/Jetpack‑Compose rewrite** of your previous React/Node smart‑farming portal.  
It provides the **mobile client** while re‑using your existing REST APIs (FastAPI + Node) for ML predictions, user management and data storage.

## 👷‍♂️ Project Modules
```
SmartAgriApp/
 ├─ settings.gradle          # Gradle settings
 ├─ build.gradle             # Top‑level buildscript
 └─ app/                     # Android app module
     ├─ build.gradle         # Android, Kotlin, Compose, Retrofit deps
     ├─ src/main/
     │    ├─ AndroidManifest.xml
     │    ├─ java/com/example/smartagri/
     │    │     ├─ MainActivity.kt
     │    │     ├─ utils/Constants.kt
     │    │     ├─ data/
     │    │     │    ├─ remote/ApiService.kt  NetworkModule.kt
     │    │     │    └─ model/…               DTOs
     │    │     ├─ repository/…               Thin data layer
     │    │     ├─ viewmodel/…                Jetpack ViewModels
     │    │     └─ ui/screens/…               Compose UI
     │    └─ res/
     │         ├─ layout/… (if you add XML)
     │         └─ values/{colors,strings,themes}.xml
     └─ …
```

## 🚀 Quick‑Start (Linux / macOS / Windows)

1. **Prerequisites**
   * Android Studio **Hedgehog | Giraffe** or newer  
   * **JDK 17** (bundled with Studio)  
   * An Android device / emulator running **API 24** or later  
   * Your backend running at `https://your-backend-endpoint.com/api/` (edit `Constants.kt`).

2. **Clone & open in Android Studio**
   ```bash
   git clone https://github.com/your-user/SmartAgriApp.git
   cd SmartAgriApp
   ```

3. **Build → Run** (🟢▶) in Android Studio  
   Gradle will fetch:  
   * Jetpack Compose ‑ Material 3  
   * Retrofit 2 + OkHttp logging  
   * Kotlin Coroutines & Lifecycle  

4. **Login** with your existing credentials → explore:
   * Crop Recommendation  
   * Disease Detection (coming soon)  
   * Weather Analyzer  

## 🖼 Converting your UI/UX mock‑ups

The `ui/screens/` package shows one‑to‑one Compose rewrites of the wireframes you shared:

| React Web Section | Android Screen (Compose) |
|-------------------|--------------------------|
| Login page        | `LoginScreen.kt`         |
| Farmer Home       | `FarmerHomeScreen.kt`    |
| Crop Rec. form    | `CropRecommendation...`  |

You can extend each screen by:
```kotlin
@Composable
fun MyNewCard() {
    Card (modifier = Modifier.padding(8.dp)) {
        /* … */
    }
}
```
…and place it within the relevant `Column`.

## 🧪 Unit & UI tests
Add tests under:
```
app/src/test/java/…
app/src/androidTest/java/…
```

## 🔌 Extending networking
Point extra routes in `ApiService.kt`, then consume them from a repository + ViewModel.

## 🆘 FAQ
* **Error: Failed to resolve _compose‑bom_** → Check your internet/Gradle proxy.  
* **App shows blank screen** → Is your backend URL correct? Look at Logcat → `NetworkModule`.  
* **Need offline ML**? Ship `.tflite` models in `assets/` and load them with TensorFlow Lite.

---

Made with ❤️ & ☕ by migrating React → Kotlin.

