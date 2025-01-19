""" service functions to retrieve environment data from API """

import datetime
import functools
from typing import Optional
import pandas as pd
import requests

from config import settings

LON = settings.LONGITUDE
LAT = settings.LATITUDE

BASE_URL_CURRENT = settings.API_CURRENT_DATA_BASE_URL
BASE_URL_HIST = settings.API_HISTORICAL_DATA_BASE_URL


def get_current_data(
    base_url: Optional[str] = BASE_URL_CURRENT,
    lon: Optional[float] = LON,
    lat: Optional[float] = LAT,
    data_field: Optional[str] = "temperature_2m",
) -> float:
    """
    fetches the current value from API for given location and measurment type.

    Args:
        lon (Optional[float], optional): of location. Defaults to LON.
        lat (Optional[float], optional): of location. Defaults to LAT.
        data_field (Optional[str], optional): type of data. Defaults to "temperature_2m".

    Returns:
        float: current value
    """
    params = {"latitude": lat, "longitude": lon, "current": data_field}
    response = requests.get(url=base_url, params=params)
    assert response.status_code == 200, "no current data available"
    data = response.json()
    value = data["current"][data_field]
    return value


@functools.lru_cache(maxsize=512)
def get_historical_data(
    base_url: Optional[str] = BASE_URL_HIST,
    lon: Optional[float] = LON,
    lat: Optional[float] = LAT,
    data_field: Optional[str] = "temperature_2m",
    start_date: Optional[datetime.date] = settings.START_DATE,
    end_date: Optional[datetime.date] = settings.END_DATE,
    interval: Optional[str] = "hourly",
) -> pd.DataFrame:
    """
    fetches historical sensor data from API for given parameters and returns dataframe.

    Args:
        lon (Optional[float], optional): of location. Defaults to LON.
        lat (Optional[float], optional): of location. Defaults to LAT.
        data_field (Optional[str], optional): type of data. Defaults to "temperature_2m".
        start_date (Optional[datetime.date], optional): Defaults to settings.START_DATE.
        end_date (Optional[datetime.date], optional): Defaults to settings.END_DATE.
        interval (Optional[str], optional): Defaults to "hourly".

    Returns:
        pd.DataFrame: with columns time and value
    """
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        interval: data_field,
    }
    response = requests.get(url=base_url, params=params)
    assert response.status_code == 200
    data = response.json()
    data = data[interval]
    df = pd.DataFrame(data)
    df["time"] = pd.to_datetime(df["time"])
    df = df[df["time"] <= datetime.datetime.now()]
    df = df.dropna()
    df = df.rename(columns={data_field: "value"})
    return df
