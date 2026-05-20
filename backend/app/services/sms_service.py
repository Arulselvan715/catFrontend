from time import time

from twilio.rest import Client

from app.core.config import settings
from app.db.mongodb import get_database

_last_sms_by_type: dict[str, float] = {}


def _twilio_client() -> Client | None:
    if not settings.twilio_account_sid or not settings.twilio_auth_token or not settings.twilio_phone_number:
        return None
    return Client(settings.twilio_account_sid, settings.twilio_auth_token)


def _cooldown_active(alert_type: str) -> bool:
    last_sent_at = _last_sms_by_type.get(alert_type, 0)
    return time() - last_sent_at < settings.sms_cooldown_seconds


async def send_emergency_sms(alert_type: str, message: str) -> dict:
    if _cooldown_active(alert_type):
        return {
            'attempted': False,
            'sent': False,
            'skipped_reason': 'SMS cooldown active',
            'recipients': [],
            'provider_message_ids': [],
        }

    db = get_database()
    contacts = await db.contacts.find({'active': True}).to_list(length=100)
    recipients = [contact['phone'] for contact in contacts]
    if not recipients:
        return {
            'attempted': False,
            'sent': False,
            'skipped_reason': 'No active emergency contacts',
            'recipients': [],
            'provider_message_ids': [],
        }

    client = _twilio_client()
    if client is None:
        return {
            'attempted': False,
            'sent': False,
            'skipped_reason': 'Twilio environment variables are not configured',
            'recipients': recipients,
            'provider_message_ids': [],
        }

    provider_ids: list[str] = []
    for recipient in recipients:
        response = client.messages.create(
            body=message,
            from_=settings.twilio_phone_number,
            to=recipient,
        )
        provider_ids.append(response.sid)

    _last_sms_by_type[alert_type] = time()
    return {
        'attempted': True,
        'sent': True,
        'recipients': recipients,
        'provider_message_ids': provider_ids,
    }
