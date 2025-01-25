""" 
This module contains functions for DataFrame operations to add statistical values
based on a column as a new column and return the DataFrame.
"""

from typing import List, Literal, Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import PolynomialFeatures

from exceptions import validate_dataframe


def add_distance_to_before(
    df: pd.DataFrame, on_column: str = "value", to_column: str = None
) -> pd.DataFrame:
    """
    Adds a column representing the distance to the previous value in the specified column.
    For the first row, the distance to the last row is calculated.

    Args:
        df (pd.DataFrame): Input DataFrame.
        on_column (str): Column to calculate distances from.
        to_column (str): Name of the new column.

    Returns:
        pd.DataFrame: Updated DataFrame with the new column.

    Raises:
        ValueError: If `on_column` does not exist or `to_column` already exists.
    """
    with validate_dataframe(df, on_column, to_column, expected_type=[float, int]):
        if to_column is None:
            to_column = f"{on_column}_distance_to_before"
        distances = df[on_column].diff().abs()
        distances.iloc[0] = abs(df[on_column].iloc[0] - df[on_column].iloc[-1])

        min_distance = np.nanmin(distances)
        distances = distances.fillna(min_distance)

        df[to_column] = distances
        return df


def add_distance_to_next(
    df: pd.DataFrame, on_column: str = "value", to_column: str = None
) -> pd.DataFrame:
    """
    Adds a column representing the distance to the next value in the specified column.
    For the last row the distance to the first row is calculated.

    Args:
        df (pd.DataFrame): Input DataFrame.
        on_column (str): Column to calculate distances from.
        to_column (str): Name of the new column.

    Returns:
        pd.DataFrame: Updated DataFrame with the new column.

    Raises:
        ValueError: If `on_column` does not exist or `to_column` already exists.
    """
    with validate_dataframe(df, on_column, to_column, expected_type=[float, int]):
        if to_column is None:
            to_column = f"{on_column}_distance_to_next"
        distances = abs(df[on_column].shift(-1) - df[on_column])
        distances.iloc[-1] = abs(df[on_column].iloc[0] - df[on_column].iloc[-1])

        min_distance = np.nanmin(distances)
        distances = distances.fillna(min_distance)

        df[to_column] = distances
        return df


def find_best_polynomial_fit(
    df: pd.DataFrame,
    on_column: str = "value",
    max_degree: int = 24,
    random_state: int = 42,
    test_size: float = 0.2,
) -> Tuple[List[float], List[float], int]:
    """
    Finds the best polynomial degree for fitting a regression model based on validation MSE.

    Args:
        df (pd.DataFrame): Input DataFrame containing the data.
        on_column (str): Column name to fit the polynomial regression on.
        max_degree (int): Maximum polynomial degree to test.
        random_state (int): Random seed for reproducibility.
        test_size (float): Fraction of data to use as the test set.

    Returns:
        Tuple[List[float], List[float], int]:
            - MSEs for training data (List[float]),
            - MSEs for validation data (List[float]),
            - Best polynomial degree (int).

    Raises:
        ValueError: If the DataFrame is empty or the `on_column` is invalid.
    """
    with validate_dataframe(df, on_column, expected_type=[float, int]):
        if max_degree > len(df) - 1:
            raise ValueError(
                f"the max_degree should not be higher than number of datapoints: '{max_degree} > {len(df)}'"
            )
        df = df.reset_index(drop=True)
        x = df.index.values.reshape(-1, 1)
        y = df[on_column].values

        x_train, x_test, y_train, y_test = train_test_split(
            x, y, test_size=test_size, random_state=random_state
        )

        mse_train, mse_val = [], []
        degrees = range(1, max_degree + 1)

        for degree in degrees:
            poly = PolynomialFeatures(degree=degree)
            x_poly_train = poly.fit_transform(x_train)
            x_poly_test = poly.transform(x_test)

            if not np.isfinite(x_poly_train).all():
                raise ValueError(
                    f"PolynomialFeatures produced invalid values at degree {degree}."
                )

            model = LinearRegression()
            model.fit(x_poly_train, y_train)

            y_train_pred = model.predict(x_poly_train)
            y_test_pred = model.predict(x_poly_test)

            mse_train.append(mean_squared_error(y_train, y_train_pred))
            mse_val.append(mean_squared_error(y_test, y_test_pred))

        best_degree = degrees[np.argmin(mse_val)]
        return mse_train, mse_val, best_degree


def add_polynomial_fit(
    df: pd.DataFrame,
    on_column: str = "value",
    to_column: str = "polynomial_fit",
    degree: int = 2,
) -> pd.DataFrame:
    """
    Adds a polynomial fit column to the DataFrame.

    Args:
        df (pd.DataFrame): Input DataFrame.
        on_column (str): Column to apply the polynomial fit on.
        to_column (str): Name of the new column for the polynomial fit values.
        degree (int): Degree of the polynomial.

    Returns:
        pd.DataFrame: DataFrame with the polynomial fit column added.

    Raises:
        ValueError: If `on_column` does not exist or `to_column` already exists.
    """
    with validate_dataframe(df, on_column, to_column, expected_type=[float, int]):
        df = df.reset_index(drop=True)
        x = df.index.values.reshape(-1, 1)
        y = df[on_column].values

        poly = PolynomialFeatures(degree=degree)
        x_poly = poly.fit_transform(x)

        model = LinearRegression()
        model.fit(x_poly, y)

        df[to_column] = model.predict(x_poly)
        return df


def add_rolling_average(
    df: pd.DataFrame,
    on_column: str = "value",
    to_column: str = "rolling_average",
    window_size: int = 5,
) -> pd.DataFrame:
    """
    Adds a rolling average column to the DataFrame.

    Args:
        df (pd.DataFrame): The input DataFrame.
        on_column (str): The column name to calculate the rolling average on.
        to_column (str): The name of the new column for the rolling average.
        window_size (int): The window size for the rolling average.

    Returns:
        pd.DataFrame: The DataFrame with the rolling average column added.

    Raises:
        ValueError: If `on_column` does not exist or `to_column` already exists.
    """
    with validate_dataframe(df, on_column, to_column, expected_type=[float, int]):
        if window_size > len(df):
            raise ValueError(
                f"the Dataframe is shorter than window size: '{len(df)} < {window_size}'"
            )
        df[to_column] = (
            df[on_column].rolling(window=window_size, center=True, min_periods=1).mean()
        )
        return df


def add_summary_statistic(
    df: pd.DataFrame,
    aggregation_type: Literal[
        "min",
        "mean",
        "median",
        "max",
        "std",
        "var",
        "sum",
        "count",
        "mode",
        "percentile",
    ],
    on_column: str = "value",
    to_column: Optional[str] = None,
    percentile: Optional[float] = None,
) -> pd.DataFrame:
    """
    Adds a new column to the DataFrame with a global summary statistic computed
    on a specified column using a chosen aggregation method.

    Parameters:
    ----------
    df : pd.DataFrame
        The input DataFrame containing the data.

    aggregation_type : Literal["min", "mean", "median", "max", "std", "var", "sum", "count", "mode", "percentile"]
        The type of aggregation to perform. Available options:
        - "min": Minimum value of the specified column.
        - "mean": Mean (average) of the specified column.
        - "median": Median of the specified column.
        - "max": Maximum value of the specified column.
        - "std": Standard deviation of the specified column.
        - "var": Variance of the specified column.
        - "sum": Sum of the specified column.
        - "count": Count of non-null values in the specified column.
        - "mode": Mode (most frequent value) of the specified column.
        - "percentile": Computes a specified percentile of the specified column.

    on_column : str, optional, default: "value"
        The name of the column in the DataFrame to perform the aggregation on.

    to_column : str, optional, default: None
        The name of the new column to store the result of the aggregation.
        If None, a default column name will be generated as "<on_column>_<aggregation_type>".

    percentile : float, optional, default: None
        If `aggregation_type` is "percentile", this value specifies the desired percentile
        (between 0 and 1). If not provided when `aggregation_type` is "percentile",
        a ValueError is raised.

    Returns:
    -------
    pd.DataFrame
        A DataFrame with the new column added, containing the global summary statistic.

    Raises:
    ------
    ValueError
        If the specified `on_column` doesn't exist in the DataFrame.
        If `to_column` already exists in the DataFrame.
        If `percentile` is not specified for the "percentile" aggregation type.
        If `percentile` is not between 0 and 1.
        If an unsupported `aggregation_type` is provided.

    Notes:
    -----
    - For the "mode" aggregation type, if there are multiple modes, the first mode
      (most frequent value) is used. If the column contains no mode, the result will be `None`.
    - For the "percentile" aggregation type, the `percentile` argument must be a float between 0 and 1
      (e.g., 0.9 for the 90th percentile).
    """
    with validate_dataframe(df, on_column, to_column, expected_type=[float, int]):
        if to_column is None:
            to_column = f"{on_column}_{aggregation_type}"

        if aggregation_type == "percentile":
            if percentile is None or not (0 <= percentile <= 1):
                raise ValueError("Percentile must be specified and between 0 and 1.")
            value = df[on_column].quantile(percentile)
        else:
            aggregation_map = {
                "min": df[on_column].min(),
                "mean": df[on_column].mean(),
                "median": df[on_column].median(),
                "max": df[on_column].max(),
                "std": df[on_column].std(),
                "var": df[on_column].var(),
                "sum": df[on_column].sum(),
                "count": df[on_column].count(),
                "mode": (
                    df[on_column].mode()[0] if not df[on_column].mode().empty else None
                ),
            }
            value = aggregation_map.get(aggregation_type)
            if value is None:
                raise ValueError(f"Unsupported aggregation type: '{aggregation_type}'")

        df[to_column] = value
        return df


def add_deviation(
    df: pd.DataFrame,
    reference_column: str,
    on_column: str = "value",
    to_column: str = None,
):
    """
    Adds a new column to the DataFrame that represents the absolute deviation
    between the values in `on_column` and the values in `reference_column`.

    Args:
        df (pd.DataFrame): The input DataFrame.
        reference_column (str): The column name containing the reference values
        on_column (str, optional): The column name containing the values Defaults to "value".
        to_column (str, optional): The name of the new column.

    Returns:
        pd.DataFrame: The DataFrame with the new column.

    Raises:
        ValueError: If `on_column` or `reference_column` does not exist in the
            DataFrame or if `to_column` already exists in the DataFrame.
        TypeError: If `on_column` or `reference_column` do not have numeric
            types (int or float).
    """
    with validate_dataframe(df, on_column, to_column, expected_type=[float, int]):
        if to_column is None:
            to_column = f"{on_column}_{reference_column}_deviation"
        df[to_column] = np.abs(df[on_column] - df[reference_column])
        return df
