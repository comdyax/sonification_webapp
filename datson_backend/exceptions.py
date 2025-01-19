""" Exceptions for handling the dataframes. """

from contextlib import contextmanager
from typing import List

import pandas as pd


@contextmanager
def validate_dataframe(
    df: pd.DataFrame,
    on_column: str,
    to_column: str = None,
    expected_type: List[type] = [float, int],
):
    """
    Context manager for validating DataFrame columns and their types before performing operations.

    Args:
        df (pd.DataFrame): The input DataFrame.
        on_column (str): The column that needs to exist.
        to_column (str, optional): The column that should not exist already.
        expected_type List[(type, optional)]: The expected data type of the `on_column`.

    Raises:
        ValueError: If df is empty.
        ValueError: If `on_column` does not exist in the DataFrame.
        ValueError: If `to_column` exists in the DataFrame.
        TypeError: If `on_column` does not contain the expected type.
    """
    if df.empty:
        raise ValueError("The input DataFrame is empty.")
    if on_column not in df.columns:
        raise ValueError(f"Column '{on_column}' does not exist in the DataFrame.")
    # if to_column and to_column in df.columns:
    #     raise ValueError(f"Column '{to_column}' already exists in the DataFrame.")
    if not any(
        pd.api.types.is_dtype_equal(df[on_column].dtype, t) for t in expected_type
    ):
        raise TypeError(
            f"Column '{on_column}' has type '{df[on_column].dtype}' but expected '{', '.join(t.__name__ for t in expected_type)}'. "
            f"First few entries: {df[on_column].head().values}."
        )

    yield df
