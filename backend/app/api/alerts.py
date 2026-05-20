from fastapi import APIRouter, Query, status

from app.db.mongodb import get_database
from app.models.common import now_utc, serialize_document
from app.schemas.alert import AlertCreate, AlertOut, AlertStats, AlertType
from app.services.pushover_service import send_pushover_alert
from app.services.macrodroid_service import trigger_macrodroid_webhook

router = APIRouter()

EMERGENCY_MESSAGES = {
    AlertType.eyes_closed_emergency: 'DRIVER IS UNSAFE',
    AlertType.face_missing_emergency: 'DRIVER IS UNSAFE',
}


@router.get('/', response_model=list[AlertOut])
async def list_alerts(limit: int = Query(default=50, ge=1, le=200)) -> list[dict]:
    try:
        db = get_database()
        alerts = await db.alert_logs.find().sort('created_at', -1).limit(limit).to_list(length=limit)
        return [serialize_document(alert) for alert in alerts]
    except Exception:
        return []


@router.get('/stats', response_model=AlertStats)
async def alert_stats() -> dict:
    try:
        db = get_database()
        total = await db.alert_logs.count_documents({})
        warnings = await db.alert_logs.count_documents({'severity': 'warning'})
        critical = await db.alert_logs.count_documents({'severity': 'critical'})
        return {'total': total, 'warnings': warnings, 'critical': critical}
    except Exception:
        return {'total': 0, 'warnings': 0, 'critical': 0}


@router.post('/', response_model=AlertOut, status_code=status.HTTP_201_CREATED)
async def create_alert(payload: AlertCreate) -> dict:
    notification = {'attempted': False, 'sent': False, 'recipients': [], 'provider_message_ids': []}
    macrodroid = {'attempted': False, 'sent': False}
    if payload.type in EMERGENCY_MESSAGES:
        notification = await send_pushover_alert(
            payload.type.value,
            'Emergency Driver Drowsiness Alert',
            EMERGENCY_MESSAGES[payload.type],
        )
        macrodroid = await trigger_macrodroid_webhook()

    document = payload.model_dump(mode='json')
    document.update({'notification': notification, 'sms': notification, 'macrodroid': macrodroid, 'created_at': now_utc()})
    try:
        db = get_database()
        result = await db.alert_logs.insert_one(document)
        alert = await db.alert_logs.find_one({'_id': result.inserted_id})
        return serialize_document(alert)
    except Exception:
        return {'id': 'database-disabled', **document}
