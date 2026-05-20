from datetime import datetime, timezone

from fastapi import APIRouter

router = APIRouter()


@router.get('/')
async def health() -> dict:
    return {'ok': True, 'service': 'driver-drowsiness-api', 'timestamp': datetime.now(timezone.utc)}
