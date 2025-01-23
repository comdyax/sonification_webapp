import { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import statisticalData from "../services/statisticalData";
import { useContext } from "react";
import { DataContext } from "../contexts/DataContext";
import { DurationContext } from "../contexts/DurationContext";

const PlotStatistics = () => {
  const { weatherData, updateData } = useContext(DataContext);
  const { duration } = useContext(DurationContext);

  const [showWeatherdata, setShowWeatherData] = useState(false);
  const [polyFit, setPolyFit] = useState(false);
  const [degree, setDegree] = useState("");
  const [rollingWindow, setRollingWindow] = useState(false);
  const [windowSize, setWindowSize] = useState(5);
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
          name: "polynomial fit",
          marker: { color: "blue" },
        });
      }
      if (polyFit) {
        const response = await statisticalData.getPolynomialFit(
          duration,
          degree,
          false,
          weatherData
        );
        updateData("polyFit", response);
        newPlotData.push({
          x: response["time"],
          y: response["value"],
          type: "scatter",
          mode: "lines+markers",
          name: "polynomial fit",
          marker: { color: "black" },
        });
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
      }

      setPlotData(newPlotData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div>
      <h2>Statistical data</h2>
      <div style={{ marginBottom: "20px" }}>
        <fieldset>
          <label style={{ margin: "20px" }}>
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
          <label style={{ margin: "20px" }}>
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
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
            />
          </label>
        </fieldset>
        <br />
        <fieldset>
          <label style={{ margin: "20px" }}>
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
          <label style={{ margin: "20px" }}>
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
        <br/>
        <button style={{ margin: "px" }} onClick={() => fetchData()}>
          Update Plot
        </button>
      </div>
      <Plot
        data={plotData}
        layout={{
          title: "Data Over Time",
          xaxis: { title: "Time in seconds" },
          yaxis: { title: "Value" },
        }}
        style={{ width: "100%", height: "600px" }}
      />
    </div>
  );
};

export default PlotStatistics;
