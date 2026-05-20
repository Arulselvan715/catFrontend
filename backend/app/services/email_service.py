import smtplib
from email.message import EmailMessage
from time import time

from app.core.config import settings
from app.db.mongodb import get_database

_last_email_by_type: dict[str, float] = {}


def _cooldown_active(alert_type: str) -> bool:
    last_sent_at = _last_email_by_type.get(alert_type, 0)
    return time() - last_sent_at < settings.alert_cooldown_seconds


def _smtp_configured() -> bool:
    return bool(settings.smtp_host and settings.smtp_username and settings.smtp_password and settings.smtp_from_email)


async def send_emergency_email(alert_type: str, subject: str, message: str) -> dict:
    if _cooldown_active(alert_type):
        return {
            'attempted': False,
            'sent': False,
            'skipped_reason': 'Email cooldown active',
            'recipients': [],
            'provider_message_ids': [],
        }

    db = get_database()
    contacts = await db.contacts.find({'active': True, 'email': {'$exists': True, '$ne': ''}}).to_list(length=100)
    recipients = [contact['email'] for contact in contacts]
    if not recipients:
        return {
            'attempted': False,
            'sent': False,
            'skipped_reason': 'No active emergency email contacts',
            'recipients': [],
            'provider_message_ids': [],
        }

    if not _smtp_configured():
        return {
            'attempted': False,
            'sent': False,
            'skipped_reason': 'SMTP environment variables are not configured',
            'recipients': recipients,
            'provider_message_ids': [],
        }

    email = EmailMessage()
    email['Subject'] = subject
    email['From'] = settings.smtp_from_email
    email['To'] = ', '.join(recipients)
    email.set_content(message)

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=20) as smtp:
        if settings.smtp_use_tls:
            smtp.starttls()
        smtp.login(settings.smtp_username, settings.smtp_password)
        smtp.send_message(email)

    _last_email_by_type[alert_type] = time()
    return {
        'attempted': True,
        'sent': True,
        'recipients': recipients,
        'provider_message_ids': [],
    }
