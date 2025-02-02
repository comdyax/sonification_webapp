from datetime import date, datetime, timedelta
from pydantic_settings import BaseSettings
import pytz


class Settings(BaseSettings):

    # API_HISTORICAL_DATA_BASE_URL: str = "https://air-quality-api.open-meteo.com/v1/air-quality"
    API_HISTORICAL_DATA_BASE_URL: str = "https://archive-api.open-meteo.com/v1/archive"
    API_CURRENT_DATA_BASE_URL: str = "https://api.open-meteo.com/v1/forecast?"
    LONGITUDE: float = 8.01
    LATITUDE: float = 50.12
    TIMEZONE: str = "CET"
    END_DATE: date = datetime.now(tz=pytz.timezone(TIMEZONE)).date() - timedelta(days=1)
    START_DATE: date = END_DATE - timedelta(days=1)
    WINDOW_SIZE: int = 5
    DURATION: int = 300
    MIDI_DEVICE_NAME: str = "Arturia MicroFreak 1"
    LOWEST_MIDI_NOTE: int = 36


settings = Settings()
