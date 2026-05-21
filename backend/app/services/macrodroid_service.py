import logging
import requests
from app.core.config import settings

logger = logging.getLogger(__name__)

async def trigger_macrodroid_webhook() -> dict:
    results = {}

    # Fire first webhook
    if settings.macrodroid_webhook_url:
        try:
            response = requests.get(settings.macrodroid_webhook_url, timeout=10)
            response.raise_for_status()
            results['webhook_1'] = {'attempted': True, 'sent': True}
        except requests.RequestException as exc:
            logger.error(f'Failed to trigger MacroDroid webhook 1: {exc}')
            results['webhook_1'] = {'attempted': True, 'sent': False, 'error': str(exc)}
    else:
        results['webhook_1'] = {'attempted': False, 'sent': False, 'skipped_reason': 'Not configured'}

    # Fire second webhook if configured
    if settings.macrodroid_webhook_url_2:
        try:
            response = requests.get(settings.macrodroid_webhook_url_2, timeout=10)
            response.raise_for_status()
            results['webhook_2'] = {'attempted': True, 'sent': True}
        except requests.RequestException as exc:
            logger.error(f'Failed to trigger MacroDroid webhook 2: {exc}')
            results['webhook_2'] = {'attempted': True, 'sent': False, 'error': str(exc)}
    else:
        results['webhook_2'] = {'attempted': False, 'sent': False, 'skipped_reason': 'Not configured'}

    return results
