import { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import statisticalData from "../services/statisticalData";
import { useContext } from "react";
import { DataContext } from "../contexts/DataContext";
import { DurationContext } from "../contexts/DurationContext";

const PlotDistances = () => {
  const {
    updateData,
    weatherData,
    getDataKeys,
    removeData,
    polyDegree,
    windowSize,
  } = useContext(DataContext);
  const { duration } = useContext(DurationContext);
  const [distanceNext, setDistanceNext] = useState(false);
  const [distanceBefore, setDistanceBefore] = useState(false);
  const [polyFitDev, setPolyFitDev] = useState(false);
  const [rollingAvgDev, setRollingAvgDev] = useState(false);
  const [minDev, setMinDev] = useState(false);
  const [meanDev, setMeanDev] = useState(false);
  const [medianDev, setMedianDev] = useState(false);
  const [maxDev, setMaxDev] = useState(false);
  const [plotData, setPlotData] = useState([]);

  const allKeys = getDataKeys();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weatherData, duration]);

  const fetchData = async () => {
    try {
      const newPlotData = [];
      if (distanceNext) {
        const response = await statisticalData.getDistanceToNext(
          duration,
          weatherData
        );
        updateData("distanceNext", response);
        newPlotData.push({
          x: response["time"],
          y: response["value"],
          type: "scatter",
          mode: "lines+markers",
          name: "distance to value next",
          marker: { color: "grey" },
        });
      } else {
        removeData("distanceNext");
      }
      if (distanceBefore) {
        const response = await statisticalData.getDistanceToBefore(
          duration,
          weatherData
        );
        updateData("distanceBefore", response);
        newPlotData.push({
          x: response["time"],
          y: response["value"],
          type: "scatter",
          mode: "lines+markers",
          name: "distance to value before",
          marker: { color: "blue" },
        });
      } else {
        removeData("distanceBefore");
      }
      if (polyFitDev) {
        const response = await statisticalData.getPolynomialFit(
          duration,
          polyDegree,
          true,
          weatherData
        );
        updateData("polyFitDev", response);
        newPlotData.push({
          x: response["time"],
          y: response["value"],
          type: "scatter",
          mode: "lines+markers",
          name: `polynomial fit resudial magnitude with degree: ${response["degree"]}`,
          marker: { color: "black" },
        });
      } else {
        removeData("polyFitDev");
      }
      if (rollingAvgDev) {
        const response = await statisticalData.getRollingAvg(
          duration,
          windowSize,
          true,
          weatherData
        );
        updateData("rollingAvgDev", response);
        newPlotData.push({
          x: response["time"],
          y: response["value"],
          type: "scatter",
          mode: "lines+markers",
          name: `deviation of rolling window avg size ${windowSize}`,
          marker: { color: "green" },
        });
      } else {
        removeData("rollingAvgDev");
      }
      if (minDev) {
        const response = await statisticalData.getSummaryStat(
          duration,
          "min",
          0,
          true,
          weatherData
        );
        updateData("minDev", response);
        newPlotData.push({
          x: response["time"],
          y: response["value"],
          type: "scatter",
          mode: "lines+markers",
          name: "absolute distance to minimum",
          marker: { color: "orange" },
        });
      } else {
        removeData("minDev");
      }

      if (meanDev) {
        const response = await statisticalData.getSummaryStat(
          duration,
          "mean",
          0,
          true,
          weatherData
        );
        updateData("meanDev", response);
        newPlotData.push({
          x: response["time"],
          y: response["value"],
          type: "scatter",
          mode: "lines+markers",
          name: "absolute distance to mean",
          marker: { color: "pink" },
        });
      } else {
        removeData("meanDev");
      }
      if (medianDev) {
        const response = await statisticalData.getSummaryStat(
          duration,
          "median",
          0,
          true,
          weatherData
        );
        updateData("medianDev", response);
        newPlotData.push({
          x: response["time"],
          y: response["value"],
          type: "scatter",
          mode: "lines+markers",
          name: "absolute distance to median",
          marker: { color: "yellow" },
        });
      } else {
        removeData("medianDev");
      }
      if (maxDev) {
        const response = await statisticalData.getSummaryStat(
          duration,
          "max",
          0,
          true,
          weatherData
        );
        updateData("maxDev", response);
        newPlotData.push({
          x: response["time"],
          y: response["value"],
          type: "scatter",
          mode: "lines+markers",
          name: "absolute distance to maximum",
          marker: { color: "red" },
        });
      } else {
        removeData("maxDev");
      }

      setPlotData(newPlotData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <>
      {allKeys.length > 0 ? (
        <div>
          <h2 style={{ textAlign: "center", padding: "4%" }}>
            3. Select Absolute distances
          </h2>
          <div style={{ marginBottom: "20px" }}>
            {allKeys.includes("weatherData") && (
              <label style={{ marginLeft: "20px" }}>
                <input
                  type="checkbox"
                  checked={distanceNext}
                  onChange={() => setDistanceNext(!distanceNext)}
                />
                absolute distance to value before
              </label>
            )}
            <br />
            {allKeys.includes("weatherData") && (
              <label style={{ marginLeft: "20px" }}>
                <input
                  type="checkbox"
                  checked={distanceBefore}
                  onChange={() => setDistanceBefore(!distanceBefore)}
                />
                absolute distance to next value
              </label>
            )}
            <br />
            {allKeys.includes("polyFit") && (
              <label style={{ marginLeft: "20px" }}>
                <input
                  type="checkbox"
                  checked={polyFitDev}
                  onChange={() => setPolyFitDev(!polyFitDev)}
                />
                polynomial fit residual magnitude
              </label>
            )}
            <br />
            {allKeys.includes("rollingAvg") && (
              <label style={{ marginLeft: "20px" }}>
                <input
                  type="checkbox"
                  checked={rollingAvgDev}
                  onChange={() => setRollingAvgDev(!rollingAvgDev)}
                />
                rolling window average deviation
              </label>
            )}
            <br />
            {allKeys.includes("summaryStatsMin") && (
              <label style={{ marginLeft: "20px" }}>
                <input
                  type="checkbox"
                  checked={minDev}
                  onChange={() => setMinDev(!minDev)}
                />
                absolute distance to minimum
              </label>
            )}
            <br />
            {allKeys.includes("summaryStatsMean") && (
              <label style={{ marginLeft: "20px" }}>
                <input
                  type="checkbox"
                  checked={meanDev}
                  onChange={() => setMeanDev(!meanDev)}
                />
                absolute distance to mean
              </label>
            )}
            <br />
            {allKeys.includes("summaryStatsMedian") && (
              <label style={{ marginLeft: "20px" }}>
                <input
                  type="checkbox"
                  checked={medianDev}
                  onChange={() => setMedianDev(!medianDev)}
                />
                absolute distance to median
              </label>
            )}
            <br />
            {allKeys.includes("summaryStatsMax") && (
              <label style={{ marginLeft: "20px" }}>
                <input
                  type="checkbox"
                  checked={maxDev}
                  onChange={() => setMaxDev(!maxDev)}
                />
                absolute distance to maximum
              </label>
            )}
            <br />
            <button style={{ margin: "20px" }} onClick={() => fetchData()}>
              Calculate Data
            </button>
          </div>
          <Plot
            data={plotData}
            layout={{
              title: "Data Over Time",
              xaxis: { title: "Time in seconds" },
              yaxis: { title: "Value" },
              legend: {
                orientation: "h",
                x: 0.5,
                xanchor: "center",
                y: -0.2,
                yanchor: "top",
              },
            }}
            style={{ width: "100%", height: "600px" }}
          />
        </div>
      ) : (
        <h2 style={{ textAlign: "center", padding: "4%" }}>
          please select statistical data first
        </h2>
      )}
    </>
  );
};

export default PlotDistances;
