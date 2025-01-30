import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { useContext } from "react";
import { DataContext } from "../contexts/DataContext";
import environmentData from "../services/environmentData";
import { weatherDataMapping } from "../config";

import statisticalData from "../services/statisticalData";
import { DurationContext } from "../contexts/DurationContext";

const PlotWeather = () => {
  const now = new Date();
  const end = new Date();
  const start = new Date();
  end.setDate(now.getDate() - 1);
  start.setDate(now.getDate() - 2);

  const [startDate, setStartDate] = useState(start.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(end.toISOString().split("T")[0]);
  const [latitude, setLatitude] = useState(50.1);
  const [longitude, setLongitude] = useState(8.2);
  const [dataType, setDataType] = useState(Object.keys(weatherDataMapping)[0]);

  const [plotData, setPlotData] = useState([]);

  const {
    weatherData,
    setWeatherData,
    updateData,
    removeData,
    polyDegree,
    setPolyDegree,
    windowSize,
    setWindowSize,
  } = useContext(DataContext);
  const { duration } = useContext(DurationContext);

  const [polyFit, setPolyFit] = useState(false);
  const [rollingWindow, setRollingWindow] = useState(false);
  const [summaryStatsMin, setSummaryStatsMin] = useState(false);
  const [summaryStatsMean, setSummaryStatsMean] = useState(false);
  const [summaryStatsMedian, setSummaryStatsMedian] = useState(false);
  const [summaryStatsMax, setSummaryStatsMax] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const fetchData = async () => {
    try {
      const newPlotData = [];
      let envData = [];
      const response = await environmentData.getWeatherData(
        startDate,
        endDate,
        latitude,
        longitude,
        dataType
      );
      const tmp = {
        time: Array.from(
          { length: response["time"].length },
          (_, i) => (i / (response["time"].length - 1)) * duration
        ),
        value: response["value"],
      };
      const xAxis = response["time"];
      newPlotData.push({
        x: xAxis,
        y: tmp["value"],
        type: "scatter",
        mode: "lines+markers",
        name: dataType,
        marker: { color: "blue" },
      });
      envData = tmp["value"];
      updateData("weatherData", tmp);

      updateData(
        "distanceNext",
        await statisticalData.getDistanceToNext(duration, envData)
      );

      updateData(
        "distanceBefore",
        await statisticalData.getDistanceToBefore(duration, envData)
      );

      if (polyFit) {
        const response = await statisticalData.getPolynomialFit(
          duration,
          polyDegree,
          false,
          envData
        );
        setPolyDegree(response["degree"]);
        updateData("polyFit", response);
        updateData(
          "polyFitDev",
          await statisticalData.getPolynomialFit(
            duration,
            polyDegree,
            true,
            envData
          )
        );
        newPlotData.push({
          x: xAxis,
          y: response["value"],
          type: "scatter",
          mode: "lines+markers",
          name: `polynomial fit with degree: ${response["degree"]}`,
          marker: { color: "black" },
        });
      } else {
        setPolyDegree("");
        removeData("polyFit");
        removeData("polyFitDev");
      }

      if (rollingWindow) {
        const response = await statisticalData.getRollingAvg(
          duration,
          windowSize,
          false,
          envData
        );
        updateData("rollingAvg", response);
        updateData(
          "rollingAvgDev",
          await statisticalData.getRollingAvg(
            duration,
            windowSize,
            true,
            envData
          )
        );
        newPlotData.push({
          x: xAxis,
          y: response["value"],
          type: "scatter",
          mode: "lines+markers",
          name: `rolling window avg size ${windowSize}`,
          marker: { color: "green" },
        });
      } else {
        removeData("rollingAvg");
        removeData("rollingAvgDev");
      }

      if (summaryStatsMin) {
        const response = await statisticalData.getSummaryStat(
          duration,
          "min",
          0,
          false,
          envData
        );
        updateData("summaryStatsMin", response);
        updateData(
          "minDev",
          await statisticalData.getSummaryStat(
            duration,
            "min",
            0,
            true,
            envData
          )
        );
        newPlotData.push({
          x: xAxis,
          y: response["value"],
          type: "scatter",
          mode: "lines+markers",
          name: "minimum",
          marker: { color: "orange" },
        });
      } else {
        removeData("summaryStatsMin");
        removeData("minDev");
      }

      if (summaryStatsMean) {
        const response = await statisticalData.getSummaryStat(
          duration,
          "mean",
          0,
          false,
          envData
        );
        updateData("summaryStatsMean", response);
        updateData(
          "meanDev",
          await statisticalData.getSummaryStat(
            duration,
            "mean",
            0,
            true,
            envData
          )
        );
        newPlotData.push({
          x: xAxis,
          y: response["value"],
          type: "scatter",
          mode: "lines+markers",
          name: "mean",
          marker: { color: "pink" },
        });
      } else {
        removeData("summaryStatsMean");
        removeData("meanDev");
      }
      if (summaryStatsMedian) {
        const response = await statisticalData.getSummaryStat(
          duration,
          "median",
          0,
          false,
          envData
        );
        updateData("summaryStatsMedian", response);
        updateData(
          "medianDev",
          await statisticalData.getSummaryStat(
            duration,
            "median",
            0,
            true,
            envData
          )
        );
        newPlotData.push({
          x: xAxis,
          y: response["value"],
          type: "scatter",
          mode: "lines+markers",
          name: "median",
          marker: { color: "yellow" },
        });
      } else {
        removeData("summaryStatsMedian");
        removeData("medianDev");
      }
      if (summaryStatsMax) {
        const response = await statisticalData.getSummaryStat(
          duration,
          "max",
          0,
          false,
          envData
        );
        updateData("summaryStatsMax", response);
        updateData(
          "maxDev",
          await statisticalData.getSummaryStat(
            duration,
            "max",
            0,
            true,
            envData
          )
        );
        newPlotData.push({
          x: xAxis,
          y: response["value"],
          type: "scatter",
          mode: "lines+markers",
          name: "maximum",
          marker: { color: "red" },
        });
      } else {
        removeData("summaryStatsMax");
        removeData("maxDev");
      }

      setPlotData(newPlotData);
      setWeatherData(envData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div>
      <Plot
        data={plotData}
        layout={{
          title: "Data Over Time",
          xaxis: { title: "Time" },
          yaxis: { title: "Value" },
          legend: {
            orientation: "h",
            x: 0.5,
            xanchor: "center",
            y: -0.2,
            yanchor: "top",
          },
        }}
        style={{
          width: "100%",
          height: "600px",
          paddingBottom: "4%",
          margin: "auto",
        }}
      />
      <div style={{ marginBottom: "20px" }}>
        <label>
          Start Date:&ensp;
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label style={{ marginLeft: "20px" }}>
          End Date:&ensp;
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
        <label style={{ marginLeft: "20px" }}>
          Latitude:&ensp;
          <input
            type="number"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
          />
        </label>
        <label style={{ marginLeft: "20px" }}>
          Longitude:&ensp;
          <input
            type="number"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
          />
        </label>
        <label style={{ marginLeft: "20px" }}>
          Data Type:&ensp;
          <select
            value={dataType}
            onChange={(e) => setDataType(e.target.value)}
          >
            {Object.keys(weatherDataMapping).map((t) => (
              <option key={t} value={t}>
                {weatherDataMapping[t]}
              </option>
            ))}
          </select>
        </label>
      </div>
      {weatherData.length > 0 && (
        <div>
          <div style={{ margin: "auto" }}>
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
          </div>
        </div>
      )}
      <br />
      <button style={{ margin: "20px" }} onClick={() => fetchData()}>
        Update Plot
      </button>
    </div>
  );
};

export default PlotWeather;
