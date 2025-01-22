import { useState } from "react";
import Plot from "react-plotly.js";
import axios from "axios";

const LineGraph = () => {
  const [data, setData] = useState(null);
  const [startDate, setStartDate] = useState("2025-01-20");
  const [endDate, setEndDate] = useState("2025-01-21");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [dataType, setDataType] = useState("temperature_2m");

  const fetchData = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/get_data", {
        params: {
          start_date: startDate,
          end_date: endDate,
          lat: latitude,
          lon: longitude,
          data_field: dataType,
        },
      });
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleUpdateClick = () => {
    fetchData();
  };

  const plotData = data
    ? [
        {
          x: data.time,
          y: data.value,
          type: "scatter",
          mode: "lines+markers",
          marker: { color: "blue" },
        },
      ]
    : [];

  return (
    <div>
      <h2>Weather data</h2>
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
        <button style={{ marginLeft: "20px" }} onClick={handleUpdateClick}>
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
        style={{ width: "100%", height: "400px" }}
      />
    </div>
  );
};

export default LineGraph;
