from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = 'AI Driver Drowsiness Detection API'
    environment: str = 'development'
    mongodb_uri: str
    mongodb_db: str = 'driver_drowsiness'
    frontend_origin: str = 'http://localhost:5173'
    pushover_app_token: str | None = None
    pushover_user_key: str | None = None
    pushover_priority: int = 1
    pushover_sound: str = 'pushover'
    alert_cooldown_seconds: int = 300
    macrodroid_webhook_url: str | None = None
    macrodroid_webhook_url_2: str | None = None

    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8')


settings = Settings()
