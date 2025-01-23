import { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import statisticalData from "../services/statisticalData";
import { useContext } from "react";
import { DataContext } from "../contexts/DataContext";
import { DurationContext } from "../contexts/DurationContext";

const PlotDistances = () => {
  const { updateData, weatherData } = useContext(DataContext);
  const { duration } = useContext(DurationContext);
  const [distanceNext, setDistanceNext] = useState(false);
  const [distanceBefore, setDistanceBefore] = useState(false);
  const [plotData, setPlotData] = useState([]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weatherData, duration]);

  const fetchData = async () => {
    try {
      const newPlotData = [];
      if (distanceNext) {
        const responseBefore = await statisticalData.getDistanceToNext(
          duration,
          weatherData
        );
        updateData("distanceNext", responseBefore);
        newPlotData.push({
          x: responseBefore["time"],
          y: responseBefore["value"],
          type: "scatter",
          mode: "lines+markers",
          name: "distance to value before",
          marker: { color: "red" },
        });
      }
      if (distanceBefore) {
        const responseNext = await statisticalData.getDistanceToBefore(
          duration,
          weatherData
        );
        updateData("distanceBefore", responseNext);
        newPlotData.push({
          x: responseNext["time"],
          y: responseNext["value"],
          type: "scatter",
          mode: "lines+markers",
          name: "distance to next value",
          marker: { color: "blue" },
        });
      }

      setPlotData(newPlotData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleCheckdistanceNext = () => {
    setDistanceNext(!distanceNext);
  };

  const handleCheckdistanceBefore = () => {
    setDistanceBefore(!distanceBefore);
  };

  return (
    <div>
      <h2>Distance data</h2>
      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginLeft: "20px" }}>
          <input
            type="checkbox"
            checked={distanceNext}
            onChange={handleCheckdistanceNext}
          />
          distance to value before
        </label>
        <label style={{ marginLeft: "20px" }}>
          <input
            type="checkbox"
            checked={distanceBefore}
            onChange={handleCheckdistanceBefore}
          />
          distance to next value
        </label>
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
        }}
        style={{ width: "100%", height: "600px" }}
      />
    </div>
  );
};

export default PlotDistances;
