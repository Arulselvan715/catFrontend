from time import time

import requests

from app.core.config import settings

PUSHOVER_ENDPOINT = 'https://api.pushover.net/1/messages.json'
_last_push_by_type: dict[str, float] = {}


def _cooldown_active(alert_type: str) -> bool:
    last_sent_at = _last_push_by_type.get(alert_type, 0)
    return time() - last_sent_at < settings.alert_cooldown_seconds


def _configured() -> bool:
    return bool(settings.pushover_app_token and settings.pushover_user_key)


async def send_pushover_alert(alert_type: str, title: str, message: str) -> dict:
    if _cooldown_active(alert_type):
        return {
            'attempted': False,
            'sent': False,
            'skipped_reason': 'Pushover cooldown active',
            'recipients': [],
            'provider_message_ids': [],
        }

    if not _configured():
        return {
            'attempted': False,
            'sent': False,
            'skipped_reason': 'Pushover token/user key are not configured',
            'recipients': [],
            'provider_message_ids': [],
        }

    payload = {
        'token': settings.pushover_app_token,
        'user': settings.pushover_user_key,
        'title': title,
        'message': message,
        'priority': settings.pushover_priority,
        'sound': settings.pushover_sound,
    }
    response = requests.post(PUSHOVER_ENDPOINT, data=payload, timeout=20)
    response.raise_for_status()
    body = response.json()
    request_id = body.get('request')
    _last_push_by_type[alert_type] = time()

    return {
        'attempted': True,
        'sent': True,
        'recipients': [settings.pushover_user_key],
        'provider_message_ids': [request_id] if request_id else [],
    }
