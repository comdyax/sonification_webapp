import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class AggregationTypes(str, Enum):
    min = "min"
    mean = "mean"
    median = "median"
    max = "max"
    std = "std"
    var = "var"
    sum = "sum"
    count = "count"
    mode = "mode"
    percentile = "percentile"


class MidiChordTypes(str, Enum):
    triads = "triads"
    tetrads = "tetrads"


class MidiDroneBuildOptions(str, Enum):
    min = "min"
    mean = "mean"
    median = "median"
    max = "max"
    mode = "mode"


class DataRequest(BaseModel):
    data: List[float] = Field(..., max_items=1000)


class MidiNotesRequest(BaseModel):
    data_for_notes: List[float] = Field(..., max_items=1000)
    data_for_velocity: List[float] = Field(..., max_items=1000)
    data_for_duration: List[float] = Field(..., max_items=1000)


class MidiChordsRequest(BaseModel):
    data_for_chords: List[float] = Field(..., max_items=1000)
    data_for_velocity: List[float] = Field(..., max_items=1000)
    data_for_duration: List[float] = Field(..., max_items=1000)


class MidiDroneRequest(BaseModel):
    data_for_drone: List[float] = Field(..., max_items=1000)


class MidiCCRequest(BaseModel):
    data_for_cc: List[float] = Field(..., max_items=1000)
    data_for_durations: Optional[List[float]] = Field(default=None, max_items=1000)


class DataFields(str, Enum):
    temperature_2m = "temperature_2m"
    wind_speed_10m = "wind_speed_10m"
    relative_humidity_2m = "relative_humidity_2m"


class Data(BaseModel):
    time: List[datetime.datetime]
    value: List[float]


class StatisticData(BaseModel):
    time: List[float]
    value: List[float]


class MidiNotes(BaseModel):
    note: List[int]
    velocity: List[int]
    duration: List[float]


class MidiChords(BaseModel):
    chord: List[List[int]]
    velocity: List[int]
    duration: List[float]


class MidiDrone(BaseModel):
    chord: List[int]
    velocity: int
    duration: float


class MidiCC(BaseModel):
    cc_message: List[int]
    duration: List[float]
