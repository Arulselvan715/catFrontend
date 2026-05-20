from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.alerts import router as alert_router
from app.api.contacts import router as contact_router
from app.api.health import router as health_router
from app.core.config import settings
from app.db.mongodb import close_mongo_connection, connect_to_mongo

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.frontend_origin.split(',')],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(health_router, prefix='/api/health', tags=['health'])
app.include_router(contact_router, prefix='/api/contacts', tags=['contacts'])
app.include_router(alert_router, prefix='/api/alerts', tags=['alerts'])


@app.on_event('startup')
async def startup_event() -> None:
    try:
        await connect_to_mongo()
    except Exception as exc:
        print(f'MongoDB unavailable; API will run without database logging: {exc}')


@app.on_event('shutdown')
async def shutdown_event() -> None:
    await close_mongo_connection()
