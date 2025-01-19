import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
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
    MidiNotes,
    MidiChords,
    MidiChordsRequest,
    MidiNotesRequest,
    MidiChordTypes,
    MidiDroneRequest,
    MidiDroneBuildOptions,
)

app = FastAPI()

tag_base = "base"
tag_stat = "statistical data"
tag_midi = "midi data"


@app.get("/get_data", status_code=200, response_model=Data, tags=[tag_base])
async def get_weather_data(
    lon: Optional[float] = settings.LONGITUDE,
    lat: Optional[float] = settings.LATITUDE,
    start_date: Optional[datetime.date] = settings.START_DATE,
    end_date: Optional[datetime.date] = settings.END_DATE,
    data_field: DataFields = Query(DataFields.temperature_2m),
):
    df = get_historical_data(
        lon=lon,
        lat=lat,
        data_field=data_field,
        start_date=start_date,
        end_date=end_date,
    )
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
    data = request.data
    if len(data) > 1000:
        raise HTTPException(
            status_code=400, detail="List too large, maximum size is 1000."
        )
    df = pd.DataFrame({"time": np.linspace(0, duration_s, len(data)), "value": data})
    df = add_distance_to_before(df=df, on_column="value", to_column="value")
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
    data = request.data
    if len(data) > 1000:
        raise HTTPException(
            status_code=400, detail="List too large, maximum size is 1000."
        )
    df = pd.DataFrame({"time": np.linspace(0, duration_s, len(data)), "value": data})
    df = add_distance_to_next(df=df, on_column="value", to_column="value")
    return df.to_dict(orient="list")


@app.post(
    "/get_polynomial_fit",
    status_code=200,
    response_model=StatisticData,
    tags=[tag_stat],
)
async def get_polynomial_fit_data(
    request: DataRequest,
    duration_s: int = settings.DURATION,
    degree: int = None,
    deviation: bool = False,
):
    data = request.data
    if len(data) > 1000:
        raise HTTPException(
            status_code=400, detail="List too large, maximum size is 1000."
        )
    df = pd.DataFrame({"time": np.linspace(0, duration_s, len(data)), "value": data})
    if degree is None:
        degree = find_best_polynomial_fit(
            df=df, on_column="value", max_degree=len(df) - 1
        )[2]
    elif degree >= len(df):
        raise HTTPException(
            status_code=422,
            detail="the degree must not be larger than number of datapoints - 1.",
        )
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
    return df.to_dict(orient="list")


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
    return df.to_dict(orient="list")


@app.post(
    "/map_data_to_midi_notes",
    status_code=200,
    response_model=MidiNotes,
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
    df = set_durations(df=df, on_column="value_durations", to_column="duration")
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
    return df.to_dict(orient="list")


@app.post(
    "/map_data_to_midi_chords",
    status_code=200,
    response_model=MidiChords,
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
    df = set_durations(df=df, on_column="value_durations", to_column="duration")
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
    return df.to_dict(orient="list")


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
    drone_build_options: List[MidiDroneBuildOptions] = Query(
        default=[
            MidiDroneBuildOptions.min,
            MidiDroneBuildOptions.median,
        ]
    ),
):
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
    response_model=MidiCC,
    tags=[tag_midi],
)
async def get_midi_chords_data(
    request: MidiCCRequest,
    duration_s: int = settings.DURATION,
    midi_min: int = 0,
    midi_max: int = 127,
    mapping_reversed: bool = False,
    duration_per_cc_value: int = None,
):
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

    if not duration_per_cc_value:
        df = set_durations(df=df, on_column="duration_cc", to_column="duration")
    else:
        df = interpolate_for_custom_interval(
            df=df,
            on_column="cc_message",
            duration_column="duration",
            custom_duration_s=duration_per_cc_value,
        )
        print(df)
    return df.to_dict(orient="list")
