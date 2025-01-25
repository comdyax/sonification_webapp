import { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import statisticalData from "../services/statisticalData";
import { useContext } from "react";
import { DataContext } from "../contexts/DataContext";
import { DurationContext } from "../contexts/DurationContext";

const PlotStatistics = () => {
  const { weatherData, updateData, removeData, polyDegree, setPolyDegree, windowSize, setWindowSize} =
    useContext(DataContext);
  const { duration } = useContext(DurationContext);

  const [showWeatherdata, setShowWeatherData] = useState(false);
  const [polyFit, setPolyFit] = useState(false);
  const [rollingWindow, setRollingWindow] = useState(false);
  const [summaryStatsMin, setSummaryStatsMin] = useState(false);
  const [summaryStatsMean, setSummaryStatsMean] = useState(false);
  const [summaryStatsMedian, setSummaryStatsMedian] = useState(false);
  const [summaryStatsMax, setSummaryStatsMax] = useState(false);

  const [plotData, setPlotData] = useState([]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weatherData, duration]);

  const fetchData = async () => {
    try {
      const newPlotData = [];
      if (showWeatherdata) {
        newPlotData.push({
          x: Array.from(
            { length: weatherData.length },
            (_, i) => (i / (weatherData.length - 1)) * duration
          ),
          y: weatherData,
          type: "scatter",
          mode: "lines+markers",
          name: "weather data",
          marker: { color: "blue" },
        });
        updateData("weatherData", weatherData);
      } else {
        removeData("weatherData");
      }
      if (polyFit) {
        const response = await statisticalData.getPolynomialFit(
          duration,
          polyDegree,
          false,
          weatherData
        );
        setPolyDegree(response["degree"]);
        updateData("polyFit", response);
        newPlotData.push({
          x: response["time"],
          y: response["value"],
          type: "scatter",
          mode: "lines+markers",
          name: `polynomial fit with degree: ${response["degree"]}`,
          marker: { color: "black" },
        });
      } else {
        setPolyDegree("");
        removeData("polyFit");
      }
      if (rollingWindow) {
        const response = await statisticalData.getRollingAvg(
          duration,
          windowSize,
          false,
          weatherData
        );
        updateData("rollingAvg", response);
        newPlotData.push({
          x: response["time"],
          y: response["value"],
          type: "scatter",
          mode: "lines+markers",
          name: `rolling window avg size ${windowSize}`,
          marker: { color: "green" },
        });
      } else {
        removeData("rollingAvg");
      }
      if (summaryStatsMin) {
        const response = await statisticalData.getSummaryStat(
          duration,
          "min",
          0,
          false,
          weatherData
        );
        updateData("summaryStatsMin", response);
        newPlotData.push({
          x: response["time"],
          y: response["value"],
          type: "scatter",
          mode: "lines+markers",
          name: "minimum",
          marker: { color: "orange" },
        });
      } else {
        removeData("summaryStatsMin");
      }

      if (summaryStatsMean) {
        const response = await statisticalData.getSummaryStat(
          duration,
          "mean",
          0,
          false,
          weatherData
        );
        updateData("summaryStatsMean", response);
        newPlotData.push({
          x: response["time"],
          y: response["value"],
          type: "scatter",
          mode: "lines+markers",
          name: "mean",
          marker: { color: "pink" },
        });
      } else {
        removeData("summaryStatsMean");
      }
      if (summaryStatsMedian) {
        const response = await statisticalData.getSummaryStat(
          duration,
          "median",
          0,
          false,
          weatherData
        );
        updateData("summaryStatsMedian", response);
        newPlotData.push({
          x: response["time"],
          y: response["value"],
          type: "scatter",
          mode: "lines+markers",
          name: "median",
          marker: { color: "yellow" },
        });
      } else {
        removeData("summaryStatsMedian");
      }
      if (summaryStatsMax) {
        const response = await statisticalData.getSummaryStat(
          duration,
          "max",
          0,
          false,
          weatherData
        );
        updateData("summaryStatsMax", response);
        newPlotData.push({
          x: response["time"],
          y: response["value"],
          type: "scatter",
          mode: "lines+markers",
          name: "maximum",
          marker: { color: "red" },
        });
      } else {
        removeData("summaryStatsMax");
      }

      setPlotData(newPlotData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <>
      {weatherData.length > 0 && (
        <div>
          <h2 style={{ textAlign: "center", padding: "4%" }}>
            2. Select statistical data
          </h2>
          <div style={{ margin: "auto" }}>
            <fieldset>
              <label>
                <input
                  type="checkbox"
                  checked={showWeatherdata}
                  onChange={() => setShowWeatherData(!showWeatherdata)}
                />
                weatherData &ensp;
              </label>
            </fieldset>
            <br />
            <fieldset>
              <label>
                <input
                  type="checkbox"
                  checked={polyFit}
                  onChange={() => setPolyFit(!polyFit)}
                />
                polynomial fit &ensp;
                <br />
                set degree (defaults to best fit): &ensp;
                <input
                  type="number"
                  value={polyDegree}
                  onChange={(e) => setPolyDegree(e.target.value)}
                />
              </label>
            </fieldset>
            <br />
            <fieldset>
              <label>
                <input
                  type="checkbox"
                  checked={summaryStatsMin}
                  onChange={() => setSummaryStatsMin(!summaryStatsMin)}
                />
                minimum
                <br />
                <input
                  type="checkbox"
                  checked={summaryStatsMean}
                  onChange={() => setSummaryStatsMean(!summaryStatsMean)}
                />
                mean
                <br />
                <input
                  type="checkbox"
                  checked={summaryStatsMedian}
                  onChange={() => setSummaryStatsMedian(!summaryStatsMedian)}
                />
                median
                <br />
                <input
                  type="checkbox"
                  checked={summaryStatsMax}
                  onChange={() => setSummaryStatsMax(!summaryStatsMax)}
                />
                maximum
              </label>
            </fieldset>
            <br />
            <fieldset>
              <label>
                <input
                  type="checkbox"
                  checked={rollingWindow}
                  onChange={() => setRollingWindow(!rollingWindow)}
                />
                rolling window average
                <br />
                window size: &ensp;
                <input
                  type="number"
                  value={windowSize}
                  onChange={(e) => setWindowSize(e.target.value)}
                />
              </label>
            </fieldset>
            <br />
            <button style={{ margin: "2%" }} onClick={() => fetchData()}>
              Update Plot
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
      )}
    </>
  );
};

export default PlotStatistics;
