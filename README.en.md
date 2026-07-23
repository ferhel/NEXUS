<p align="right"><a href="README.md">🇪🇸 Versión en español</a></p>

# 🧠 Nexus

**A cognitive academic support platform.** It combines a learning-style psychometric test with a study room that uses the device's own camera to measure presence and focus in real time — all processed in the browser, with no backend and no data ever sent to an external server.

> Personal project built end to end (product, metric design, and code) to dig into browser-based computer vision and on-device machine learning applied to a real problem: why it's so hard to stay focused while studying.

<p align="center">
  <img src="docs/screenshots/01-inicio.png" width="49%" alt="Nexus home screen" />
  <img src="docs/screenshots/06-sala-estudio.png" width="49%" alt="Study room with Pomodoro timer and presence tracking" />
</p>

---

## What it does

### 1. Cognitive test (36 items)
A custom psychometric questionnaire measuring 5 dimensions of learning style — **Structural, Reactive, Applied, Strategic, and Metacognitive** — with reverse-scored items, validity questions (to flag unreliable answers), and a bipolar block to determine a *top-down / bottom-up* tendency. The result maps to a **learning archetype** (Architect, Sprinter, Engineer, Strategist, Adaptive…) with recommended study techniques and their scientific grounding (Rumelhart, Kolb, Zimmerman, Flavell).

<p align="center">
  <img src="docs/screenshots/02-test-pregunta.png" width="49%" alt="Cognitive test question with Likert scale" />
  <img src="docs/screenshots/03-test-resultados.png" width="49%" alt="Test results with radar chart and archetype" />
</p>

### 2. Study room with presence tracking
With the user's permission, the camera analyzes a frame every 2 seconds using **face-api.js** (TinyFaceDetector + facial landmarks) and extracts a normalized 6-feature vector (yaw, pitch, brightness, relative face size, facial symmetry, hand presence). That vector is classified with a custom **KNN** model — calibrated per user in an initial ~30-second session, not a generic pre-trained model — and **K-Means** runs at the end of each session to detect new behavioral patterns the model hasn't seen yet.

From that, a **Visual Presence Index (IPV)** is computed per session and logged into a history view with a trend chart and a study-streak calendar.

<p align="center">
  <img src="docs/screenshots/04-calibracion.png" width="49%" alt="Personal calibration screen" />
  <img src="docs/screenshots/05-historial.png" width="49%" alt="Session history with IPV trend" />
</p>

> The Study Room screenshot uses a simulated camera device (Chromium's standard test pattern) so it could be captured without exposing a real face — the flow and UI are exactly what runs in production.

### 3. Study ambience
Sound modes to accompany a session: Lofi, water sounds, binaural beats (via Spotify), and **brown noise generated mathematically with the Web Audio API**, no audio files involved.

### 4. Extras
Quick notes during a session, post-session feedback, history filterable by subject, and a persistent light/dark theme.

---

## Privacy by design

Not a marketing tagline: **there is no backend**. Video never leaves the browser, is never recorded or uploaded anywhere — each frame is processed in memory and discarded. The only thing that persists is the 6-value numeric vector (not the image) and the KNN model, both stored in the device's own `localStorage`. This is an architectural decision, not just a data policy.

---

## Tech stack

| Area | Technology |
|---|---|
| Framework | React 19 + React Router 7 |
| Computer vision | face-api.js (TinyFaceDetector + 68-point landmarks), MediaPipe Hands |
| Machine learning | `ml-knn` (classification) + `ml-kmeans` (new-pattern detection), 100% client-side |
| Audio | Web Audio API (tone and noise synthesis, no external libraries) |
| Persistence | `localStorage` (no database, no server) |
| Build | Create React App / react-scripts |

---

## Running locally

```bash
npm install
npm start
```

Open `http://localhost:3000`. The app will ask for camera permission when entering the Study Room; without it, the rest of the platform (cognitive test, history, notes) still works fine.

```bash
npm test    # tests via react-scripts/Testing Library
npm run build
```

---

## Project status

This is a functional prototype, not a production product: no backend, no user accounts, no cross-device sync — everything lives in the browser's `localStorage`. The classification model is calibrated per person and per browser session, so its accuracy depends on that initial calibration and on lighting/camera conditions.

Things on my radar as next steps: persistence beyond the browser (so history survives a cache clear), automated tests for the ML/feature-extraction modules, and accessibility (keyboard navigation, screen readers) on the test and study-room screens.

---

## About this project

I built this as a concrete excuse to go deep on browser-based computer vision and on-device ML, with an explicit stance that sensitive data (video of someone's face while studying) shouldn't need to leave the device to be useful. If you'd like to talk about the project, the technical approach, or potential collaboration, reach out.
