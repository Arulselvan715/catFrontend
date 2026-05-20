import logging
import requests
from app.core.config import settings

logger = logging.getLogger(__name__)

async def trigger_macrodroid_webhook() -> dict:
    if not settings.macrodroid_webhook_url:
        return {'attempted': False, 'sent': False, 'skipped_reason': 'MacroDroid Webhook URL not configured'}

    try:
        response = requests.get(settings.macrodroid_webhook_url, timeout=10)
        response.raise_for_status()
        return {'attempted': True, 'sent': True}
    except requests.RequestException as exc:
        logger.error(f'Failed to trigger MacroDroid webhook: {exc}')
        return {'attempted': True, 'sent': False, 'error': str(exc)}
