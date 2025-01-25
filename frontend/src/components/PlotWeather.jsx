import { useState } from "react";
import Plot from "react-plotly.js";
import { useContext } from "react";
import { DataContext } from "../contexts/DataContext";
import weatherData from "../services/weatherData";

const PlotWeather = () => {
  const now = new Date();
  const end = new Date();
  const start = new Date();
  end.setDate(now.getDate() - 1);
  start.setDate(now.getDate() - 2);

  const [plotData, setPlotData] = useState([]);
  const { setWeatherData } = useContext(DataContext);
  const [startDate, setStartDate] = useState(start.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(end.toISOString().split("T")[0]);
  const [latitude, setLatitude] = useState(50.1);
  const [longitude, setLongitude] = useState(8.2);
  const [dataType, setDataType] = useState("temperature_2m");

  const fetchData = async () => {
    try {
      const newPlotData = [];
      const responseData = await weatherData.getWeatherData(
        startDate,
        endDate,
        latitude,
        longitude,
        dataType
      );
      newPlotData.push({
        x: responseData["time"],
        y: responseData["value"],
        type: "scatter",
        mode: "lines+markers",
        name: dataType,
        marker: { color: "blue" },
      });
      setPlotData(newPlotData);
      setWeatherData(responseData["value"]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleUpdateClick = () => {
    fetchData();
  };

  return (
    <div>
      <h2 style={{ textAlign: "center", padding: "4%" }}>
        1. Select Weather data
      </h2>
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
            <option value="temperature_2m">Temperature</option>
            <option value="relative_humidity_2m">Humidity</option>
            <option value="wind_speed_10m">Wind Speed</option>
          </select>
        </label>
        <button style={{ margin: "20px" }} onClick={handleUpdateClick}>
          Update Plot
        </button>
      </div>
      <Plot
        data={plotData}
        layout={{
          title: "Data Over Time",
          xaxis: { title: "Time" },
          yaxis: { title: "Value" },
        }}
        style={{ width: "100%", height: "600px" }}
      />
    </div>
  );
};

export default PlotWeather;
