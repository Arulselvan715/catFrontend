import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { audioAlerts } from '../services/audioAlerts';
import { calculateEyeMetrics, smoothValue } from '../utils/eyeAspectRatio';

const EAR_THRESHOLD = 0.2;
const DROWSY_WARNING_MS = 5_000;
const EMERGENCY_MS = 10_000;
const FRAME_INTERVAL_MS = 90;

const initialStatus = {
  camera: 'requesting',
  faceDetected: false,
  eyesClosed: false,
  eyeClosedDurationMs: 0,
  faceMissingDurationMs: 0,
  confidence: 0,
  leftEAR: 0,
  rightEAR: 0,
  averageEAR: 0,
  warningActive: false,
  emergencyActive: false,
  message: 'Requesting camera permission'
};

export function useDriverMonitor(videoRef) {
  const [status, setStatus] = useState(initialStatus);
  const [modelReady, setModelReady] = useState(false);
  const [alertsCount, setAlertsCount] = useState(0);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const lastFrameRef = useRef(0);
  const closedSinceRef = useRef(null);
  const faceMissingSinceRef = useRef(null);
  const smoothedEarRef = useRef(null);
  const loggedRef = useRef({ drowsy: false, eyeEmergency: false, faceEmergency: false, cameraOff: false });

  const loadAlerts = useCallback(async () => {
    try {
      const [stats, alerts] = await Promise.all([api.alertStats(), api.listAlerts()]);
      setAlertsCount(stats.total);
      setRecentAlerts(alerts);
    } catch {
      // Monitoring should continue even if the API is temporarily unavailable.
    }
  }, []);

  const logAlert = useCallback(async (payload) => {
    try {
      await api.createAlert(payload);
      await loadAlerts();
    } catch (err) {
      console.error('Unable to log alert', err);
    }
  }, [loadAlerts]);

  const startCamera = useCallback(async () => {
    try {
      setStatus((prev) => ({ ...prev, camera: 'requesting', message: 'Requesting camera permission' }));
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      loggedRef.current.cameraOff = false;
      audioAlerts.stopLoop('camera');
      setStatus((prev) => ({ ...prev, camera: 'active', message: 'Monitoring active' }));
    } catch (err) {
      audioAlerts.startLoop('camera', 1040, 500);
      setStatus((prev) => ({ ...prev, camera: 'blocked', message: 'CAMERA IS REQUIRED FOR DRIVER SAFETY' }));
      if (!loggedRef.current.cameraOff) {
        loggedRef.current.cameraOff = true;
        logAlert({ type: 'CAMERA_OFF', severity: 'warning', message: 'Camera is blocked or unavailable' });
      }
    }
  }, [logAlert, videoRef]);

  useEffect(() => {
    let cancelled = false;
    async function initModel() {
      const resolver = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/wasm');
      const landmarker = await FaceLandmarker.createFromOptions(resolver, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
          delegate: 'GPU'
        },
        outputFaceBlendshapes: false,
        runningMode: 'VIDEO',
        numFaces: 1,
        minFaceDetectionConfidence: 0.55,
        minFacePresenceConfidence: 0.55,
        minTrackingConfidence: 0.55
      });
      if (!cancelled) {
        landmarkerRef.current = landmarker;
        setModelReady(true);
      }
    }
    initModel().catch((err) => {
      console.error('Unable to initialize face landmarker', err);
      setStatus((prev) => ({ ...prev, message: 'AI model failed to load' }));
    });
    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
    };
  }, []);

  useEffect(() => {
    startCamera();
    loadAlerts();
    return () => {
      cancelAnimationFrame(animationRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioAlerts.stopAll();
    };
  }, [loadAlerts, startCamera]);

  useEffect(() => {
    if (!modelReady) return;

    const analyze = (now) => {
      animationRef.current = requestAnimationFrame(analyze);
      if (now - lastFrameRef.current < FRAME_INTERVAL_MS) return;
      lastFrameRef.current = now;

      const video = videoRef.current;
      if (!video || video.readyState < 2 || !landmarkerRef.current) return;

      const tracks = streamRef.current?.getVideoTracks() || [];
      const cameraLive = tracks.some((track) => track.readyState === 'live' && track.enabled);
      if (!cameraLive) {
        audioAlerts.startLoop('camera', 1040, 500);
        setStatus((prev) => ({ ...prev, camera: 'blocked', message: 'CAMERA IS REQUIRED FOR DRIVER SAFETY' }));
        return;
      }

      const result = landmarkerRef.current.detectForVideo(video, performance.now());
      const faceLandmarks = result.faceLandmarks?.[0];
      const timestamp = Date.now();

      if (!faceLandmarks) {
        if (!faceMissingSinceRef.current) faceMissingSinceRef.current = timestamp;
        const faceMissingDurationMs = timestamp - faceMissingSinceRef.current;
        audioAlerts.stopLoop('warning');
        setStatus((prev) => ({
          ...prev,
          camera: 'active',
          faceDetected: false,
          eyesClosed: false,
          faceMissingDurationMs,
          confidence: 0,
          message: faceMissingDurationMs >= EMERGENCY_MS
            ? 'DRIVER IS UNSAFE'
            : 'Driver face not detected'
        }));

        if (faceMissingDurationMs >= EMERGENCY_MS && !loggedRef.current.faceEmergency) {
          loggedRef.current.faceEmergency = true;
          audioAlerts.startLoop('emergency', 1320, 300);
          logAlert({
            type: 'FACE_MISSING_EMERGENCY',
            severity: 'critical',
            message: 'DRIVER IS UNSAFE',
            metrics: { face_missing_duration_ms: faceMissingDurationMs }
          });
        }
        return;
      }

      faceMissingSinceRef.current = null;
      loggedRef.current.faceEmergency = false;
      audioAlerts.stopLoop('camera');

      const { leftEAR, rightEAR, averageEAR } = calculateEyeMetrics(faceLandmarks);
      const smoothedEAR = smoothValue(smoothedEarRef.current, averageEAR);
      smoothedEarRef.current = smoothedEAR;
      const eyesClosed = smoothedEAR < EAR_THRESHOLD;

      if (eyesClosed) {
        if (!closedSinceRef.current) closedSinceRef.current = timestamp;
      } else {
        closedSinceRef.current = null;
        loggedRef.current.drowsy = false;
        loggedRef.current.eyeEmergency = false;
        audioAlerts.stopLoop('warning');
        audioAlerts.stopLoop('emergency');
      }

      const eyeClosedDurationMs = closedSinceRef.current ? timestamp - closedSinceRef.current : 0;
      const warningActive = eyeClosedDurationMs >= DROWSY_WARNING_MS;
      const emergencyActive = eyeClosedDurationMs >= EMERGENCY_MS;
      const confidence = Math.min(0.99, Math.max(0.55, 1 - Math.abs(smoothedEAR - EAR_THRESHOLD) * 2));

      if (warningActive) {
        audioAlerts.startLoop('warning', 980, 620);
        audioAlerts.speak('Driver is feeling sleepy, take a break');
        if (!loggedRef.current.drowsy) {
          loggedRef.current.drowsy = true;
          logAlert({
            type: 'DROWSINESS_WARNING',
            severity: 'warning',
            message: 'Driver is feeling sleepy, take a break',
            metrics: {
              eye_closed_duration_ms: eyeClosedDurationMs,
              confidence,
              left_ear: leftEAR,
              right_ear: rightEAR,
              average_ear: smoothedEAR
            }
          });
        }
      }

      if (emergencyActive) {
        audioAlerts.startLoop('emergency', 1320, 300);
        if (!loggedRef.current.eyeEmergency) {
          loggedRef.current.eyeEmergency = true;
          logAlert({
            type: 'EYES_CLOSED_EMERGENCY',
            severity: 'critical',
            message: 'DRIVER IS UNSAFE',
            metrics: {
              eye_closed_duration_ms: eyeClosedDurationMs,
              confidence,
              left_ear: leftEAR,
              right_ear: rightEAR,
              average_ear: smoothedEAR
            }
          });
        }
      }

      setStatus({
        camera: 'active',
        faceDetected: true,
        eyesClosed,
        eyeClosedDurationMs,
        faceMissingDurationMs: 0,
        confidence,
        leftEAR,
        rightEAR,
        averageEAR: smoothedEAR,
        warningActive,
        emergencyActive,
        message: emergencyActive ? 'DRIVER IS UNSAFE'
          : warningActive ? 'DRIVER IS FEELING SLEEPY, TAKE A BREAK'
            : eyesClosed ? 'Eyes closed' : 'Monitoring active'
      });
    };

    animationRef.current = requestAnimationFrame(analyze);
    return () => cancelAnimationFrame(animationRef.current);
  }, [logAlert, modelReady, videoRef]);

  return { status, modelReady, alertsCount, recentAlerts, restartCamera: startCamera, refreshAlerts: loadAlerts };
}
