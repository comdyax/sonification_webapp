import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { useContext } from "react";
import { DataContext } from "../contexts/DataContext";
import environmentData from "../services/environmentData";
import { weatherDataMapping, intervalMapping } from "../config";

import statisticalData from "../services/statisticalData";
import { DurationContext } from "../contexts/DurationContext";
import { Container, Row, Col, InputGroup, Form, Button } from "react-bootstrap";

const PlotWeather = () => {
  const now = new Date();
  const end = new Date();
  const start = new Date();
  end.setDate(now.getDate() - 1);
  start.setDate(now.getDate() - 2);

  const [initRender, setInitRender] = useState(true);
  const [startDate, setStartDate] = useState(start.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(end.toISOString().split("T")[0]);
  const [latitude, setLatitude] = useState(50.1);
  const [longitude, setLongitude] = useState(8.2);
  const [dataType, setDataType] = useState(Object.keys(weatherDataMapping)[0]);
  const [interval, setInterval] = useState(Object.keys(intervalMapping)[0]);

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
    if (initRender === false) {
      fetchData();
    } else {
      setInitRender(false);
    }
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
        name: weatherDataMapping[dataType],
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
    <div className="mb-5">
      <Container fluid className="d-flex justify-content-center">
        <Plot
          data={plotData}
          layout={{
            width: window.innerWidth * 0.9,
            height: window.innerHeight * 0.6,
            title: weatherDataMapping[dataType],
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
        />
      </Container>
      <Container fluid>
        <Row>
          <Col>
            <InputGroup className="mb-3">
              <InputGroup.Text id="start_date">Start Date:</InputGroup.Text>
              <Form.Control
                type="date"
                value={startDate}
                aria-label="start-date"
                onChange={(e) => setStartDate(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col>
            <InputGroup className="mb-3">
              <InputGroup.Text id="end_date">End Date:</InputGroup.Text>
              <Form.Control
                type="date"
                value={endDate}
                aria-label="start-date"
                onChange={(e) => setEndDate(e.target.value)}
              />
            </InputGroup>
          </Col>
        </Row>
        <Row>
          <Col>
            <InputGroup className="mb-3">
              <InputGroup.Text id="lat">Latitude:</InputGroup.Text>
              <Form.Control
                placeholder={latitude}
                value={latitude}
                step="0.1"
                type="number"
                onChange={(e) => setLatitude(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col>
            <InputGroup className="mb-3">
              <InputGroup.Text id="lon">Longitude:</InputGroup.Text>
              <Form.Control
                placeholder={longitude}
                value={longitude}
                step="0.1"
                type="number"
                onChange={(e) => setLongitude(e.target.value)}
              />
            </InputGroup>
          </Col>
        </Row>
        <Row>
          <Col>
            <InputGroup className="mb-3">
              <InputGroup.Text id="interval">Interval:</InputGroup.Text>
              <Form.Select
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
              >
                {Object.keys(intervalMapping).map((t) => (
                  <option key={t} value={t}>
                    {intervalMapping[t]}
                  </option>
                ))}
              </Form.Select>
            </InputGroup>
          </Col>
          <Col>
            <InputGroup className="mb-3">
              <InputGroup.Text id="data-type">Data Type:</InputGroup.Text>
              <Form.Select
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
              >
                {Object.keys(weatherDataMapping).map((t) => (
                  <option key={t} value={t}>
                    {weatherDataMapping[t]}
                  </option>
                ))}
              </Form.Select>
            </InputGroup>
          </Col>
        </Row>
      </Container>
      {weatherData.length > 0 && (
        <Container fluid>
          <h2>Add Statistix</h2>
          <Row>
            <Col>
              <InputGroup className="mb-3">
                <InputGroup.Text id="poly-fit">Polynomial Fit:</InputGroup.Text>
                <InputGroup.Checkbox onChange={() => setPolyFit(!polyFit)} />
                <InputGroup.Text>Degree (Default Best Fit):</InputGroup.Text>
                <Form.Control
                  placeholder={polyDegree}
                  onChange={(e) => setPolyDegree(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col>
              <InputGroup className="mb-3">
                <InputGroup.Text id="rolling-avg">
                  Rolling Window Avg:
                </InputGroup.Text>
                <InputGroup.Checkbox
                  onChange={() => setRollingWindow(!rollingWindow)}
                />
                <InputGroup.Text>Window Size:</InputGroup.Text>
                <Form.Control
                  placeholder={windowSize}
                  onChange={(e) => setWindowSize(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col>
              <InputGroup className="mb-3 d-flex flex-column">
                <InputGroup.Text>
                  <Form.Check
                    className="mx-auto"
                    inline
                    type="checkbox"
                    id="min"
                    label="Minimum"
                    onChange={() => setSummaryStatsMin(!summaryStatsMin)}
                  />
                  <Form.Check
                    className="mx-auto"
                    inline
                    type="checkbox"
                    id="mean"
                    label="Mean"
                    onChange={() => setSummaryStatsMean(!summaryStatsMean)}
                  />
                  <Form.Check
                    className="mx-auto"
                    inline
                    type="checkbox"
                    id="median"
                    label="Median"
                    onChange={() => setSummaryStatsMedian(!summaryStatsMedian)}
                  />
                  <Form.Check
                    className="mx-auto"
                    inline
                    type="checkbox"
                    id="max"
                    label="Max"
                    onChange={() => setSummaryStatsMax(!summaryStatsMax)}
                  />
                </InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>
        </Container>
      )}
      <Button
        className="md-3"
        size="lg"
        variant="dark"
        onClick={() => fetchData()}
      >
        {plotData.length === 0 ? "Fetch Data" : "Update Plot"}
      </Button>
    </div>
  );
};

export default PlotWeather;
