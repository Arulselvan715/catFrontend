# Project Concepts

## Project Name

AI Driver Drowsiness Detection and Emergency Alert System

## Core Idea

The system continuously monitors the driver through the webcam. It uses AI face landmarks to detect whether the face is visible and whether the eyes are closed for a dangerous amount of time.

## Frontend Concepts

- **Webcam access:** Uses browser camera permission through `getUserMedia`.
- **Live video feed:** Shows the driver camera in real time.
- **MediaPipe Face Landmarker:** Detects face landmarks in the browser.
- **Eye Aspect Ratio:** Calculates eye openness using landmark distances.
- **Drowsiness detection:** Tracks how long eyes remain closed.
- **Voice alert:** Uses browser `SpeechSynthesis` to say: `Driver is feeling sleepy, take a break`.
- **Emergency UI:** Shows emergency status when the driver is unsafe.
- **Responsive dashboard:** Dark UI with camera, status, timers, confidence, and Pushover setup.

## Backend Concepts

- **FastAPI:** Python backend API framework.
- **Health endpoint:** Confirms backend is running.
- **Alert endpoint:** Receives camera, warning, and emergency events.
- **Pushover service:** Sends emergency push notification.
- **Cooldown:** Prevents duplicate emergency notification spam.
- **MongoDB optional logging:** Stores alert records when MongoDB is available.
- **No MongoDB fallback:** Backend can still run and send Pushover alerts even if MongoDB is off.

## AI Logic

```text
IF eyes_closed_duration > 10 seconds:
    speak "Driver is feeling sleepy, take a break"

IF eyes_closed_duration > 25 seconds:
    send Pushover notification "DRIVER IS UNSAFE"

IF face_missing_duration > 25 seconds:
    send Pushover notification "DRIVER IS UNSAFE"

IF camera_off:
    show camera required warning
```

## Notification Concept

The project uses **Pushover** for emergency notification.

Message sent:

```text
DRIVER IS UNSAFE
```

## Current Top-Level Files

```text
backend/          Python FastAPI backend
frontend/         React source version
frontend-static/  No-build frontend used for quick running
package.json      Root project scripts
README.md         Main setup guide
PROJECT_CONCEPTS.md Detailed concept explanation
```

