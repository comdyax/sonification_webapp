import { useState } from "react";
import { useContext } from "react";
import { DataContext } from "../contexts/DataContext";
import environmentData from "../services/environmentData";
import { weatherDataMapping, intervalMapping } from "../config";

import statisticalData from "../services/statisticalData";
import {
  Container,
  Row,
  Col,
  InputGroup,
  Form,
  Button,
  ProgressBar,
  Modal,
} from "react-bootstrap";
import WeatherPlot from "./WeatherPlot";
import WeatherTable from "./WeatherTable";

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

  const duration = 300;

  const [polyFit, setPolyFit] = useState(false);
  const [rollingWindow, setRollingWindow] = useState(false);
  const [summaryStatsMin, setSummaryStatsMin] = useState(false);
  const [summaryStatsMean, setSummaryStatsMean] = useState(false);
  const [summaryStatsMedian, setSummaryStatsMedian] = useState(false);
  const [summaryStatsMax, setSummaryStatsMax] = useState(false);

  const [select, setSelect] = useState(true);
  const [isFetching, setIsFetching] = useState(null);

  const fetchData = async () => {
    try {
      setIsFetching(5);
      const newPlotData = [];
      let envData = [];
      const response = await environmentData.getWeatherData(
        startDate,
        endDate,
        latitude,
        longitude,
        dataType,
        interval
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
      setIsFetching(15);
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
      setIsFetching(30);
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
      setIsFetching(45);
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
      setIsFetching(60);
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
      setIsFetching(75);
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
      setIsFetching(90);
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
      setIsFetching(100);
      setPlotData(newPlotData);
      setWeatherData(envData);
      setSelect(false);
      setTimeout(() => setIsFetching(null), 800);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <Container style={{ maxWidth: "915px" }}>
      <Row>
        <Col>
          <InputGroup className="mb-3">
            <InputGroup.Text id="start_date">Start Date:</InputGroup.Text>
            <Form.Control
              type="date"
              value={startDate}
              aria-label="start-date"
              onChange={(e) => {
                setStartDate(e.target.value);
                setSelect(true);
              }}
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
              onChange={(e) => {
                setEndDate(e.target.value);
                setSelect(true);
              }}
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
              onChange={(e) => {
                setLatitude(e.target.value);
                setSelect(true);
              }}
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
              onChange={(e) => {
                setLongitude(e.target.value);
                setSelect(true);
              }}
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
              onChange={(e) => {
                setInterval(e.target.value);
                setSelect(true);
              }}
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
              onChange={(e) => {
                setDataType(e.target.value);
                setSelect(true);
              }}
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
      <h3>Add Statistix</h3>
      <Row>
        <Col>
          <InputGroup className="mb-3">
            <InputGroup.Text id="poly-fit">Polynomial Fit:</InputGroup.Text>
            <InputGroup.Checkbox
              onChange={() => {
                setPolyFit(!polyFit);
                setSelect(true);
              }}
            />
            <InputGroup.Text>Degree (Default Best Fit):</InputGroup.Text>
            <Form.Control
              placeholder={polyDegree}
              onChange={(e) => {
                setPolyDegree(e.target.value);
                setSelect(true);
              }}
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
              onChange={() => {
                setRollingWindow(!rollingWindow);
                setSelect(true);
              }}
            />
            <InputGroup.Text>Window Size:</InputGroup.Text>
            <Form.Control
              placeholder={windowSize}
              onChange={(e) => {
                setWindowSize(e.target.value);
                setSelect(true);
              }}
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
                onChange={() => {
                  setSummaryStatsMin(!summaryStatsMin);
                  setSelect(true);
                }}
              />
              <Form.Check
                className="mx-auto"
                inline
                type="checkbox"
                id="mean"
                label="Mean"
                onChange={() => {
                  setSummaryStatsMean(!summaryStatsMean);
                  setSelect(true);
                }}
              />
              <Form.Check
                className="mx-auto"
                inline
                type="checkbox"
                id="median"
                label="Median"
                onChange={() => {
                  setSummaryStatsMedian(!summaryStatsMedian);
                  setSelect(true);
                }}
              />
              <Form.Check
                className="mx-auto"
                inline
                type="checkbox"
                id="max"
                label="Max"
                onChange={() => {
                  setSummaryStatsMax(!summaryStatsMax);
                  setSelect(true);
                }}
              />
            </InputGroup.Text>
          </InputGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button
            className="m-3"
            size="lg"
            variant={select ? "secondary" : "dark"}
            onClick={() => fetchData()}
          >
            {plotData.length === 0 ? "Fetch Data" : "Update Data"}
          </Button>
        </Col>
        {weatherData.length > 0 && (
          <>
            <Col>
              <WeatherTable data={plotData} />
            </Col>
            <Col>
              <WeatherPlot
                plotData={plotData}
                plotName={weatherDataMapping[dataType]}
              />
            </Col>
          </>
        )}
      </Row>
      <Modal show={isFetching} centered backdrop="static">
        <Modal.Body>
          <ProgressBar now={isFetching} />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default PlotWeather;
