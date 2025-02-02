import Form from "react-bootstrap/Form";
import { Button, Container, Row, Col } from "react-bootstrap";
import InputGroup from "react-bootstrap/InputGroup";
import PropTypes from "prop-types";

import { useContext, useState, useRef } from "react";
import midiDataService from "../services/midiDataService";

import MIDIDataTable from "./MidiDataTable";
import MIDIDataPlot from "./MidiDataPlot";

import { DataContext } from "../contexts/DataContext";
import { MIDIContext } from "../contexts/MidiContext";
import { dataTextMapping } from "../config";

const DataToDrone = ({ index, onRemove }) => {
  const { getDataKeys, getDataValues } = useContext(DataContext);
  const { appendMidiData, removeMidiData } = useContext(MIDIContext);

  const dataTypes = getDataKeys();
  const tableData = useRef(null);

  const [select, setSelect] = useState(true);

  const [duration, setDuration] = useState(300);
  const [startMidi, setStartMidi] = useState(36);
  const [velocity, setVelocity] = useState(64);
  const [droneMin, setDroneMin] = useState(false);
  const [droneMean, setDroneMean] = useState(false);
  const [droneMedian, setDroneMedian] = useState(false);
  const [droneMax, setDroneMax] = useState(false);

  const buildDroneOptions = (min, mean, median, max) => {
    let droneBuildOptions = [];
    if (min) {
      droneBuildOptions.push("min");
    }
    if (mean) {
      droneBuildOptions.push("mean");
    }
    if (median) {
      droneBuildOptions.push("median");
    }
    if (max) {
      droneBuildOptions.push("max");
    }
    return droneBuildOptions;
  };

  const [dataDrone, setDataDrone] = useState(dataTypes[0]);

  const fetchData = async () => {
    try {
      const buildOptions = buildDroneOptions(
        droneMin,
        droneMean,
        droneMedian,
        droneMax
      );
      console.log(buildOptions);

      const response = await midiDataService.getMidiToDrone(
        duration,
        startMidi,
        buildOptions,
        getDataValues(dataDrone)
      );
      response.velocity = Number(velocity);
      response.duration = Number(duration);
      appendMidiData(index, [response]);
      tableData.current = [response];
      setSelect(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleRemove = () => {
    onRemove();
    removeMidiData(index);
  };

  return (
    <Container fluid>
      <h2>{index + 1}. MIDI Drone Data</h2>
      <Row>
        <Col>
          <InputGroup className="mb-3">
            <InputGroup.Text id="lowest-midi">
              Lowest Midi Note:
            </InputGroup.Text>
            <Form.Control
              type="number"
              min={0}
              max={127}
              placeholder={startMidi}
              aria-label="lowest-midi"
              onChange={(e) => {
                setStartMidi(e.target.value);
                setSelect(true);
              }}
            />
          </InputGroup>
        </Col>
        <Col>
          <InputGroup className="mb-3">
            <InputGroup.Text>Velocity:</InputGroup.Text>
            <Form.Control
              aria-label="velocity"
              type="number"
              min={0}
              max={127}
              placeholder={velocity}
              onChange={(e) => {
                setVelocity(e.target.value);
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
                  setDroneMin(!droneMin);
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
                  setDroneMean(!droneMean);
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
                  setDroneMedian(!droneMedian);
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
                  setDroneMax(!droneMax);
                  setSelect(true);
                }}
              />
            </InputGroup.Text>
          </InputGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <InputGroup className="mb-3">
            <InputGroup.Text>Drone:</InputGroup.Text>
            <Form.Select
              aria-label="data-notes"
              value={dataDrone}
              onChange={(e) => {
                setDataDrone(e.target.value);
                setSelect(true);
              }}
            >
              {dataTypes.map((t) => (
                <option key={t} value={t}>
                  {dataTextMapping[t]}
                </option>
              ))}
            </Form.Select>
          </InputGroup>
        </Col>
        <Col>
          <InputGroup className="mb-3">
            <InputGroup.Text id="duration">
              Duration of Sonification in Seconds:
            </InputGroup.Text>
            <Form.Control
              type="number"
              placeholder={duration}
              onChange={(e) => {
                setDuration(e.target.value);
                setSelect(true);
              }}
            />
          </InputGroup>
        </Col>
      </Row>
      <Row>
        <Col xs={3}>
          <Button variant="secondary" size="lg" onClick={() => handleRemove()}>
            Remove
          </Button>
        </Col>
        <Col xs={3}>
          <Button
            variant={select ? "secondary" : "dark"}
            size="lg"
            onClick={() => fetchData()}
          >
            Calculate
          </Button>
        </Col>
        <Col xs={3}>
          {tableData.current && <MIDIDataTable midiData={tableData.current} />}
        </Col>
        <Col xs={3}>
          {tableData.current && <MIDIDataPlot midiData={tableData.current} />}
        </Col>
      </Row>
    </Container>
  );
};

export default DataToDrone;

DataToDrone.propTypes = {
  index: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired,
};
