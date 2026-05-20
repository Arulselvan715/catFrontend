from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

client: AsyncIOMotorClient | None = None
database: AsyncIOMotorDatabase | None = None


async def connect_to_mongo() -> None:
    global client, database
    client = AsyncIOMotorClient(settings.mongodb_uri, serverSelectionTimeoutMS=1500)
    database = client[settings.mongodb_db]
    await client.admin.command('ping')
    await database.contacts.create_index('phone', unique=True, sparse=True)
    await database.contacts.create_index('email', unique=True, sparse=True)
    await database.alert_logs.create_index('created_at')
    await database.alert_logs.create_index('type')


async def close_mongo_connection() -> None:
    if client is not None:
        client.close()


def get_database() -> AsyncIOMotorDatabase:
    if database is None:
        raise RuntimeError('MongoDB is not connected')
    return database
