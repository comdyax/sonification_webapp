"""
FastAPI application for processing weather data and converting it to MIDI data.
Includes endpoints for statistical analysis and MIDI mappings.
"""

import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import numpy as np
import pandas as pd

from config import settings
from api_service import get_historical_data
from data_analysis_tools import (
    add_distance_to_before,
    add_distance_to_next,
    add_polynomial_fit,
    find_best_polynomial_fit,
    add_rolling_average,
    add_summary_statistic,
    add_deviation,
)
from data_to_midi_tools import (
    interpolate_for_custom_interval,
    permutate_chords,
    set_notes,
    set_durations,
    set_velocities,
    set_triads,
    set_tetras,
    set_notes_to_drone,
    set_cc_values,
)
from schemas import (
    Data,
    DataFields,
    AggregationTypes,
    DataRequest,
    MidiCC,
    MidiCCRequest,
    MidiDrone,
    StatisticData,
    MidiNote,
    MidiChord,
    MidiChordsRequest,
    MidiNotesRequest,
    MidiChordTypes,
    MidiDroneRequest,
    MidiDroneBuildOptions,
    StatisticDataPoly,
)

app = FastAPI(root_path="/api")

tag_base = "base"
tag_stat = "statistical data"
tag_midi = "midi data"

origins = ["http://localhost:8000", "http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/get_data", status_code=200, response_model=Data, tags=[tag_base])
async def get_weather_data(
    lon: Optional[float] = settings.LONGITUDE,
    lat: Optional[float] = settings.LATITUDE,
    start_date: Optional[datetime.date] = settings.START_DATE,
    end_date: Optional[datetime.date] = settings.END_DATE,
    data_field: DataFields = Query(DataFields.temperature_2m),
    interval: str = "h",
):
    """
    Fetch historical weather data for a specified location and date range.

    Args:
        lon (float, optional): Longitude of the location. Defaults to settings.LONGITUDE.
        lat (float, optional): Latitude of the location. Defaults to settings.LATITUDE.
        start_date (datetime.date, optional): Start date for the data range. Defaults to settings.START_DATE.
        end_date (datetime.date, optional): End date for the data range. Defaults to settings.END_DATE.
        data_field (DataFields): The type of weather data to fetch.
        interval (str): of aggregation

    Returns:
        Data: A dictionary with lists of weather data.
    """
    df = get_historical_data(
        lon=lon,
        lat=lat,
        data_field=data_field,
        start_date=start_date,
        end_date=end_date,
        interval=interval,
    )
    df = df.round(1)
    return df.to_dict(orient="list")


@app.post(
    "/get_distance_to_before",
    status_code=200,
    response_model=StatisticData,
    tags=[tag_stat],
)
async def get_distance_to_before_data(
    request: DataRequest,
    duration_s: int = settings.DURATION,
):
    """
    Calculate the distance between consecutive data points (to the previous point).

    Args:
        request (DataRequest): The input data request containing the data list.
        duration_s (int): The total duration of the data series in seconds.

    Returns:
        StatisticData: A dictionary with the distance-to-before calculations.
    """
    data = request.data
    if len(data) > 1000:
        raise HTTPException(
            status_code=400, detail="List too large, maximum size is 1000."
        )
    df = pd.DataFrame({"time": np.linspace(0, duration_s, len(data)), "value": data})
    df = add_distance_to_before(df=df, on_column="value", to_column="value")
    df = df.round(1)
    return df.to_dict(orient="list")


@app.post(
    "/get_distance_to_next",
    status_code=200,
    response_model=StatisticData,
    tags=[tag_stat],
)
async def get_distance_to_next_data(
    request: DataRequest,
    duration_s: int = settings.DURATION,
):
    """
    Calculate the distance between consecutive data points (to the next point).

    Args:
        request (DataRequest): The input data request containing the data list.
        duration_s (int): The total duration of the data series in seconds.

    Returns:
        StatisticData: A dictionary with the distance-to-next calculations.
    """
    data = request.data
    if len(data) > 1000:
        raise HTTPException(
            status_code=400, detail="List too large, maximum size is 1000."
        )
    df = pd.DataFrame({"time": np.linspace(0, duration_s, len(data)), "value": data})
    df = add_distance_to_next(df=df, on_column="value", to_column="value")
    df = df.round(1)
    return df.to_dict(orient="list")


@app.post(
    "/get_polynomial_fit",
    status_code=200,
    response_model=StatisticDataPoly,
    tags=[tag_stat],
)
async def get_polynomial_fit_data(
    request: DataRequest,
    duration_s: int = settings.DURATION,
    degree: int = None,
    deviation: bool = False,
):
    """
    Fit a polynomial to the data and optionally calculate deviations.

    Args:
        request (DataRequest): The input data request containing the data list.
        duration_s (int): The total duration of the data series in seconds.
        degree (int, optional): Degree of the polynomial to fit. Defaults to None, which auto-selects the best degree.
        deviation (bool): Whether to calculate deviations from the polynomial fit.

    Returns:
        StatisticData: A dictionary with polynomial fit values or their deviations.
    """
    data = request.data
    if len(data) > 1000:
        raise HTTPException(
            status_code=400, detail="List too large, maximum size is 1000."
        )
    df = pd.DataFrame({"time": np.linspace(0, duration_s, len(data)), "value": data})
    if (degree is None) or (degree >= len(df)):
        degree = find_best_polynomial_fit(df=df, on_column="value")[2]
    if not deviation:
        df = add_polynomial_fit(
            df=df, on_column="value", to_column="value", degree=degree
        )
    else:
        df = add_polynomial_fit(
            df=df, on_column="value", to_column="value_abs", degree=degree
        )
        df = add_deviation(
            df=df,
            reference_column="value_abs",
            on_column="value",
            to_column="value",
        )
    df = df.round(1)
    return StatisticDataPoly(time=df["time"], value=df["value"], degree=degree)


@app.post(
    "/get_rolling_average",
    status_code=200,
    response_model=StatisticData,
    tags=[tag_stat],
)
async def get_rolling_average_data(
    request: DataRequest,
    duration_s: int = settings.DURATION,
    window_size: int = settings.WINDOW_SIZE,
    deviation: bool = False,
):
    """
    Calculate a rolling average of the data and optionally deviations.

    Args:
        request (DataRequest): Request object containing the input data.
        duration_s (int): Duration of the dataset in seconds. Defaults to settings.DURATION.
        window_size (int): Window size for the rolling average. Defaults to settings.WINDOW_SIZE.
        deviation (bool): Whether to calculate deviations from the rolling average. Defaults to False.

    Returns:
        StatisticData: Data with rolling average or the deviation optionally.
    """
    data = request.data
    if len(data) > 1000:
        raise HTTPException(
            status_code=400, detail="List too large, maximum size is 1000."
        )
    df = pd.DataFrame({"time": np.linspace(0, duration_s, len(data)), "value": data})
    if not deviation:
        df = add_rolling_average(
            df=df, on_column="value", to_column="value", window_size=window_size
        )
    else:
        df = add_rolling_average(
            df=df,
            on_column="value",
            to_column="value_abs",
            window_size=window_size,
        )
        df = add_deviation(
            df=df,
            reference_column="value_abs",
            on_column="value",
            to_column="value",
        )
    df = df.round(1)
    return df.to_dict(orient="list")


@app.post(
    "/get_summary_statistic",
    status_code=200,
    response_model=StatisticData,
    tags=[tag_stat],
)
async def get_summary_statistic_data(
    request: DataRequest,
    duration_s: int = settings.DURATION,
    aggregation_type: AggregationTypes = Query(AggregationTypes.min),
    percentile: float = None,
    deviation: bool = False,
):
    """
    Calculate a summary statistic (e.g., min, max, mean) for the data.

    Args:
        request (DataRequest): Request object containing the input data.
        duration_s (int): Duration of the dataset in seconds. Defaults to settings.DURATION.
        aggregation_type (AggregationTypes): Type of aggregation to apply. Defaults to min.
        percentile (float): Percentile to calculate (if applicable). Defaults to None.
        deviation (bool): Whether to calculate deviations from the statistic. Defaults to False.

    Returns:
        StatisticData: Data with summary statistic or the deviation.
    """
    data = request.data
    if len(data) > 1000:
        raise HTTPException(
            status_code=400, detail="List too large, maximum size is 1000."
        )
    df = pd.DataFrame({"time": np.linspace(0, duration_s, len(data)), "value": data})
    if not deviation:
        df = add_summary_statistic(
            df=df,
            aggregation_type=aggregation_type,
            on_column="value",
            to_column="value",
            percentile=percentile,
        )
    else:
        df = add_summary_statistic(
            df=df,
            aggregation_type=aggregation_type,
            on_column="value",
            to_column="value_abs",
            percentile=percentile,
        )
        df = add_deviation(
            df=df,
            reference_column="value_abs",
            on_column="value",
            to_column="value",
        )
    df = df.round(1)
    return df.to_dict(orient="list")


@app.post(
    "/map_data_to_midi_notes",
    status_code=200,
    response_model=List[MidiNote],
    tags=[tag_midi],
)
async def get_midi_notes_data(
    request: MidiNotesRequest,
    duration_s: int = settings.DURATION,
    start_midi_notes: int = settings.LOWEST_MIDI_NOTE,
    velocity_midi_min: int = 0,
    velocity_midi_max: int = 127,
    velocity_mapping_reversed: bool = False,
):
    """
    Map data to MIDI notes, velocities, and durations.

    Args:
        request (MidiNotesRequest): Request object containing the input data.
        duration_s (int): Duration of the dataset in seconds. Defaults to settings.DURATION.
        start_midi_notes (int): Lowest MIDI note value. Defaults to settings.LOWEST_MIDI_NOTE.
        velocity_midi_min (int): Minimum MIDI velocity value. Defaults to 0.
        velocity_midi_max (int): Maximum MIDI velocity value. Defaults to 127.
        velocity_mapping_reversed (bool): Whether to reverse velocity mapping. Defaults to False.

    Returns:
        MidiNotes: MIDI note data with notes, velocities, and durations.
    """
    data_notes = request.data_for_notes
    data_velocities = request.data_for_velocity
    data_durations = request.data_for_duration
    if not (len(data_notes) == len(data_durations) == len(data_velocities)):
        raise HTTPException(
            status_code=422, detail="the three lists must have the same length."
        )
    df = pd.DataFrame(
        {
            "time": np.linspace(0, duration_s, len(data_notes)),
            "value_notes": data_notes,
            "value_velocities": data_velocities,
            "value_durations": data_durations,
        }
    )
    df = set_durations(
        df=df, on_column="value_durations", to_column="duration", duration=duration_s
    )
    df = set_velocities(
        df=df,
        on_column="value_velocities",
        to_column="velocity",
        midi_min=velocity_midi_min,
        midi_max=velocity_midi_max,
        reverse=velocity_mapping_reversed,
    )
    df = set_notes(
        df=df,
        on_column="value_notes",
        to_column="note",
        start_midi_value=start_midi_notes,
    )
    return df.to_dict(orient="records")


@app.post(
    "/map_data_to_midi_chords",
    status_code=200,
    response_model=List[MidiChord],
    tags=[tag_midi],
)
async def get_midi_chords_data(
    request: MidiChordsRequest,
    duration_s: int = settings.DURATION,
    start_midi_notes: int = settings.LOWEST_MIDI_NOTE,
    velocity_midi_min: int = 0,
    velocity_midi_max: int = 127,
    velocity_mapping_reversed: bool = False,
    chord_type: MidiChordTypes = Query(default=MidiChordTypes.tetrads),
):
    """
    Map data to MIDI chords.

    Args:
        request (MidiChordsRequest): Request object containing the input data.
        duration_s (int): Duration of the dataset in seconds. Defaults to settings.DURATION.
        start_midi_notes (int): Lowest MIDI note value. Defaults to settings.LOWEST_MIDI_NOTE.
        velocity_midi_min (int): Minimum MIDI velocity value. Defaults to 0.
        velocity_midi_max (int): Maximum MIDI velocity value. Defaults to 127.
        velocity_mapping_reversed (bool): Whether to reverse velocity mapping. Defaults to False.
        chord_type (MidiChordTypes): Type of chords to generate (triads or tetrads). Defaults to tetrads.

    Returns:
        MidiChords: MIDI chord data with chords, velocities, and durations.
    """
    data_chords = request.data_for_chords
    data_velocities = request.data_for_velocity
    data_durations = request.data_for_duration
    if not (len(data_chords) == len(data_durations) == len(data_velocities)):
        raise HTTPException(
            status_code=422, detail="the three lists must have the same length."
        )
    df = pd.DataFrame(
        {
            "time": np.linspace(0, duration_s, len(data_chords)),
            "value_chords": data_chords,
            "value_velocities": data_velocities,
            "value_durations": data_durations,
        }
    )
    df = set_durations(
        df=df, on_column="value_durations", to_column="duration", duration=duration_s
    )
    df = set_velocities(
        df=df,
        on_column="value_velocities",
        to_column="velocity",
        midi_min=velocity_midi_min,
        midi_max=velocity_midi_max,
        reverse=velocity_mapping_reversed,
    )
    if chord_type == MidiChordTypes.tetrads:
        df = set_tetras(
            df=df,
            on_column="value_chords",
            to_column="chord",
            start_midi_value=start_midi_notes,
        )
    elif chord_type == MidiChordTypes.triads:
        df = set_triads(
            df=df,
            on_column="value_chords",
            to_column="chord",
            start_midi_value=start_midi_notes,
        )
    else:
        raise HTTPException(status_code=422, detail="chord type invalid")
    df = permutate_chords(df=df, seed_column="value_chords", chord_column="chord")
    return df.to_dict(orient="records")


@app.post(
    "/map_data_to_midi_drone",
    status_code=200,
    response_model=MidiDrone,
    tags=[tag_midi],
)
async def get_midi_drone_data(
    request: MidiDroneRequest,
    duration_s: int = settings.DURATION,
    start_midi_notes: int = settings.LOWEST_MIDI_NOTE,
):
    """
    Map data to a MIDI drone using specified aggregation options.

    Args:
        request (MidiDroneRequest): Request object containing the input data.
        duration_s (int): Duration of the dataset in seconds. Defaults to settings.DURATION.
        start_midi_notes (int): Lowest MIDI note value. Defaults to settings.LOWEST_MIDI_NOTE.

    Returns:
        MidiDrone: MIDI drone data with chords, velocity, and duration.
    """
    drone_build_options = request.drone_build_options
    data_drone = request.data_for_drone
    df = pd.DataFrame(
        {
            "time": np.linspace(0, duration_s, len(data_drone)),
            "value": data_drone,
        }
    )
    df = set_notes(
        df=df,
        on_column="value",
        to_column="value_notes",
        start_midi_value=start_midi_notes,
    )
    df = set_notes_to_drone(
        df=df,
        note_column="value_notes",
        to_column="chord",
        duration_column_name="duration",
        aggregation_types=drone_build_options,
    )
    result = {"chord": df.loc[0, "chord"], "velocity": 100, "duration": duration_s}
    return result


@app.post(
    "/map_data_to_midi_cc",
    status_code=200,
    response_model=List[MidiCC],
    tags=[tag_midi],
)
async def get_midi_cc_data(
    request: MidiCCRequest,
    duration_s: int = settings.DURATION,
    midi_min: int = 0,
    midi_max: int = 127,
    mapping_reversed: bool = False,
    duration_per_cc_value: int = None,
):
    """
    Map data to MIDI control change (CC) messages.

    Args:
        request (MidiCCRequest): Request object containing the input data.
        duration_s (int): Duration of the dataset in seconds. Defaults to settings.DURATION.
        midi_min (int): Minimum MIDI CC value. Defaults to 0.
        midi_max (int): Maximum MIDI CC value. Defaults to 127.
        mapping_reversed (bool): Whether to reverse mapping. Defaults to False.
        duration_per_cc_value (int): Duration per CC value (if provided). Defaults to None.

    Returns:
        MidiCC: MIDI CC data with control change messages and durations.
    """
    data_cc = request.data_for_cc
    data_durations = request.data_for_durations
    if data_durations and not (len(data_cc) == len(data_durations)):
        raise HTTPException(
            status_code=422, detail="the two lists must have the same length."
        )
    if not data_durations and not duration_per_cc_value:
        raise HTTPException(
            status_code=422,
            detail="must give data for duration per cc message or custom duration interval.",
        )
    df = pd.DataFrame(
        {
            "time": np.linspace(0, duration_s, len(data_cc)),
            "value_cc": data_cc,
            "duration_cc": data_durations,
        }
    )
    df = set_cc_values(
        df=df,
        on_column="value_cc",
        to_column="cc_message",
        midi_min=midi_min,
        midi_max=midi_max,
        reverse=mapping_reversed,
    )
    if duration_per_cc_value is None:
        df = set_durations(
            df=df, on_column="duration_cc", to_column="duration", duration=duration_s
        )
    else:
        df = interpolate_for_custom_interval(
            df=df,
            on_column="cc_message",
            duration_column="duration",
            custom_duration_s=duration_per_cc_value,
            duration_s=duration_s,
        )
    return df.to_dict(orient="records")


app.mount("/", StaticFiles(directory="dist/", html=True), name="dist")
