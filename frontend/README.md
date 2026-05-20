# React Frontend

React + Tailwind monitoring dashboard. The browser runs webcam access and MediaPipe Face Landmarker locally for real-time response.

## Run Locally

```bash
npm install
copy .env.example .env
npm run dev
```

## Notes

- Camera permission is requested automatically when the dashboard mounts.
- MediaPipe model assets are loaded from official hosted model/CDN URLs.
- API base URL is configured with `VITE_API_BASE_URL`.
