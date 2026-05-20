# Python Backend

FastAPI service for emergency contacts, alert logs, Twilio SMS, and cooldown protection.

## Run Locally

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 5000
```

## API

- `GET /api/health/` service health
- `GET /api/contacts/` list contacts
- `POST /api/contacts/` create contact
- `PATCH /api/contacts/{id}` update contact
- `DELETE /api/contacts/{id}` delete contact
- `GET /api/alerts/` list alert logs
- `GET /api/alerts/stats` alert totals
- `POST /api/alerts/` create alert log and send SMS for emergency alert types

Phone numbers must use E.164 format, for example `+14155552671`.
