""" 
This module contains functions for DataFrame operations to add midi values
based on a column as a new column and return the DataFrame.
"""

import random
from typing import List
import numpy as np
import pandas as pd

from config import settings
from exceptions import validate_dataframe


START_MIDI_NOTE = settings.LOWEST_MIDI_NOTE
DURATION = settings.DURATION


def set_notes(
    df: pd.DataFrame,
    on_column: str = "value",
    to_column: str = "note",
    start_midi_value: int = START_MIDI_NOTE,
):
    """
    Sets MIDI note values based on unique values in the specified column and assigns them to the new column.

    Args:
        df (pd.DataFrame): Input DataFrame.
        on_column (str): Column name based on which MIDI values will be assigned.
        to_column (str): Name of the new column to store the MIDI note values.
        start_midi_value (int): Starting MIDI note value.

    Returns:
        pd.DataFrame: Updated DataFrame with the new column containing MIDI notes.
    """
    with validate_dataframe(df, on_column, to_column, expected_type=[float, int]):
        unique_values = sorted(df[on_column].unique())
        value_to_index = {val: idx for idx, val in enumerate(unique_values)}
        notes = [start_midi_value + i for i in range(len(unique_values))]

        df[to_column] = df[on_column].apply(lambda x: notes[value_to_index[x]])
        return df


def set_triads(
    df: pd.DataFrame,
    on_column: str = "value",
    to_column: str = "chord",
    start_midi_value: int = START_MIDI_NOTE,
) -> pd.DataFrame:
    """
    Sets MIDI triad chord values based on unique values in the specified column.

    Args:
        df (pd.DataFrame): Input DataFrame.
        on_column (str): Column name based on which triad chords will be assigned.
        to_column (str): Name of the new column to store the triad chord MIDI values.
        start_midi_value (int): Starting MIDI note value.

    Returns:
        pd.DataFrame: Updated DataFrame with the new column containing MIDI triads.
    """
    with validate_dataframe(df, on_column, to_column, expected_type=[float, int]):
        unique_values = sorted(df[on_column].unique())
        value_to_index = {val: idx for idx, val in enumerate(unique_values)}

        first_chord = [start_midi_value, start_midi_value + 3, start_midi_value + 7]
        chords = [first_chord]
        note_to_change = 2
        half_tone = True
        for _ in range(len(unique_values)):
            new_chord = chords[-1].copy()
            if half_tone:
                new_chord[note_to_change] += 1
            else:
                new_chord[note_to_change] += 2
            chords.append(new_chord)
            half_tone = not half_tone
            note_to_change = (note_to_change - 1) if note_to_change > 0 else 2

        df[to_column] = df[on_column].apply(lambda x: chords[value_to_index[x]])
        return df


def set_tetras(
    df: pd.DataFrame,
    on_column: str = "value",
    to_column: str = "chord",
    start_midi_value: int = START_MIDI_NOTE,
) -> pd.DataFrame:
    """
    Sets MIDI tetra chord values based on unique values in the specified column.

    Args:
        df (pd.DataFrame): Input DataFrame.
        on_column (str): Column name based on which tetra chords will be assigned.
        to_column (str): Name of the new column to store the tetra chord MIDI values.
        start_midi_value (int): Starting MIDI note value.

    Returns:
        pd.DataFrame: Updated DataFrame with the new column containing MIDI tetra chords.
    """
    with validate_dataframe(df, on_column, to_column, expected_type=[float, int]):
        unique_values = sorted(df[on_column].unique())
        value_to_index = {val: idx for idx, val in enumerate(unique_values)}

        first_chord = [
            start_midi_value,
            start_midi_value + 7,
            start_midi_value + 9,
            start_midi_value + 16,
        ]
        chords = [first_chord]
        note_to_change = 2
        for _ in range(len(unique_values)):
            new_chord = chords[-1].copy()
            new_chord[note_to_change] = new_chord[note_to_change] + 2
            chords.append(new_chord)
            note_to_change = (note_to_change - 1) if note_to_change > 0 else 3

        df[to_column] = df[on_column].apply(lambda x: chords[value_to_index[x]])
        return df


def _shuffle_chord(chord: List[int], shuffle_value: float):
    """
    Shuffles a list of MIDI notes in place using a provided shuffle value as a seed.

    Args:
        chord (List[int]): The list of MIDI notes to shuffle.
        shuffle_value (float): The value used to seed the random shuffle.

    Returns:
        List[int]: The shuffled list (same object as input, modified in place).
    """
    random.seed(shuffle_value)
    random.shuffle(chord)
    return chord


def permutate_chords(
    df: pd.DataFrame, seed_column: str, chord_column: str = "chord"
) -> pd.DataFrame:
    """
    This function modifies the chords in the specified column directly. Each chord is shuffled
    deterministically based on the value in the `seed_column`, ensuring reproducible permutations
    for the same seed value.

    Args:
        df (pd.DataFrame): The input DataFrame containing the chord data and seed values.
        seed_column (str): The column name containing the seed values to control the shuffle.
        chord_column (str): The column name containing the chords as lists of MIDI notes
                            (default is "chord").

    Returns:
        pd.DataFrame: The input DataFrame with the chords shuffled in place.
    """
    df[chord_column] = df.apply(
        lambda row: _shuffle_chord(
            chord=row[chord_column], shuffle_value=row[seed_column]
        ),
        axis=1,
    )
    return df


def set_cc_values(
    df: pd.DataFrame,
    on_column: str,
    to_column: str,
    midi_min: int = 0,
    midi_max: int = 127,
    reverse: bool = False,
) -> pd.DataFrame:
    """
    Maps a column's values to MIDI CC values in a specified range.

    Args:
        df (pd.DataFrame): Input DataFrame.
        on_column (str): Column to map values from.
        to_column (str): Column to store mapped MIDI CC values.
        midi_min (int): Minimum MIDI CC value (default: 0).
        midi_max (int): Maximum MIDI CC value (default: 127).
        reverse (bool): If True, reverses the mapping direction (default: False).

    Returns:
        pd.DataFrame: Updated DataFrame with the mapped MIDI CC values.
    """
    with validate_dataframe(df, on_column, to_column, expected_type=[float, int]):
        from_min = df[on_column].min()
        from_max = df[on_column].max()
        if from_min == from_max:
            df[to_column] = midi_min
        else:
            if reverse:
                df[to_column] = (
                    (from_max - df[on_column])
                    / (from_max - from_min)
                    * (midi_max - midi_min)
                    + midi_min
                ).astype(int)
            else:
                df[to_column] = (
                    (df[on_column] - from_min)
                    / (from_max - from_min)
                    * (midi_max - midi_min)
                    + midi_min
                ).astype(int)
        return df


def set_durations(
    df: pd.DataFrame, on_column: str, to_column: str = "duration"
) -> pd.DataFrame:
    """
    sets duration for each value proportional to complete duration defined at startup.

    Args:
        df (pd.DataFrame): Input dataframe containing MIDI data.
        on_column (str): The column containing the MIDI event data.
        to_column (str): The column for durations.

    Returns:
        pd.DataFrame: Dataframe with duration per row (MIDI event)
    """
    with validate_dataframe(df, on_column, to_column, expected_type=[float, int]):
        proportions = df[on_column] / df[on_column].sum()
        df[to_column] = proportions * DURATION
        return df


def set_velocities(
    df: pd.DataFrame,
    on_column: str,
    to_column: str = "velocity",
    midi_min: int = 0,
    midi_max: int = 127,
    reverse: bool = False,
) -> pd.DataFrame:
    """
    sets velocities for each vmidi note.

    Args:
        df (pd.DataFrame): Input dataframe containing MIDI data.
        on_column (str): The column containing the MIDI event data.
        to_column (str): The column for durations. Defaults to "velocity"

    Returns:
        pd.DataFrame: Dataframe with duration per row (MIDI event)
    """
    with validate_dataframe(df, on_column, to_column, expected_type=[float, int]):
        from_min = df[on_column].min()
        from_max = df[on_column].max()
        if from_min == from_max:
            df[to_column] = midi_min
        else:
            if reverse:
                df[to_column] = (
                    (from_max - df[on_column])
                    / (from_max - from_min)
                    * (midi_max - midi_min)
                    + midi_min
                ).astype(int)
            else:
                df[to_column] = (
                    (df[on_column] - from_min)
                    / (from_max - from_min)
                    * (midi_max - midi_min)
                    + midi_min
                ).astype(int)
        return df


def interpolate_for_custom_interval(
    df: pd.DataFrame, on_column: str, duration_column: str, custom_duration_s: int = 1
) -> pd.DataFrame:
    """
    Interpolates data for custom intervals (e.g., to fit MIDI events into a specific time frame).

    Args:
        df (pd.DataFrame): Input dataframe containing MIDI data.
        on_column (str): The column containing the MIDI event data.
        duration_column (str): The column for durations.
        custom_duration_s (int): The custom time interval for the new events (in seconds).
        DURATION (int): The total duration of the event sequence.

    Returns:
        pd.DataFrame: New Dataframe with interpolated MIDI events.
    """
    with validate_dataframe(df, on_column, duration_column, expected_type=[float, int]):
        df_custom = df.copy().reset_index(drop=True)
        df_custom["lin_time"] = np.linspace(start=0, stop=DURATION, num=len(df)).astype(
            int
        )
        custom_durations = pd.DataFrame(
            {"lin_time": np.arange(start=0, stop=DURATION, step=custom_duration_s)}
        )
        merge_type = "right" if len(custom_durations) <= len(df_custom) else "outer"
        df_custom = pd.merge(
            left=df_custom, right=custom_durations, on="lin_time", how=merge_type
        )
        df_custom[on_column] = (
            df_custom[on_column].interpolate(method="linear").astype(int)
        )
        df_custom[duration_column] = custom_duration_s
        return df_custom


def set_notes_to_drone(
    df: pd.DataFrame,
    note_column: str = "note",
    to_column: str = None,
    duration_column_name: str = "duration",
    aggregation_types: List[str] = [
        "min",
        "mean",
        "median",
        "max",
        "mode",
    ],
) -> pd.DataFrame:
    """
    Aggregates the notes in a column based on specified aggregation types and creates
    a DataFrame with the aggregated notes and uniform duration.

    Args:
        df (pd.DataFrame): The input DataFrame containing note values.
        note_column (str): Column containing note values to aggregate.
        to_column (str, optional): Column name for the output aggregated notes.
        duration_column (str): Column name for the output duration.
        aggregation_types (List[str]): List of aggregation types to compute.
                                       Supported types: 'min', 'mean', 'median', 'max', 'mode'.
        duration_value (int): The duration value to assign to the output.

    Returns:
        pd.DataFrame: A DataFrame with aggregated notes and uniform duration.
    """
    if to_column is None:
        to_column = f"{note_column}_drone"

    supported_aggregations = {"min", "mean", "median", "max", "mode"}
    invalid_aggregations = set(aggregation_types) - supported_aggregations
    if invalid_aggregations:
        raise ValueError(f"Unsupported aggregation types: {invalid_aggregations}")

    aggregation_map = {
        "min": df[note_column].min(),
        "mean": int(df[note_column].mean()),
        "median": int(df[note_column].median()),
        "max": df[note_column].max(),
        "mode": (
            int(df[note_column].mode().iloc[0])
            if not df[note_column].mode().empty
            else df[note_column].min()
        ),
    }

    aggregated_values = [aggregation_map[agg_type] for agg_type in aggregation_types]
    return pd.DataFrame(
        {to_column: [aggregated_values], duration_column_name: DURATION, "velocity": 64}
    )
