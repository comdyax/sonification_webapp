import Form from "react-bootstrap/Form";
import { Button, Container, Row, Col } from "react-bootstrap";
import InputGroup from "react-bootstrap/InputGroup";

import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { DataContext } from "../contexts/DataContext";
import { MIDIContext } from "../contexts/MidiContext";
import { DurationContext } from "../contexts/DurationContext";
import midiDataService from "../services/midiDataService";
import { dataTextMapping } from "../config";

const DataToNotes = () => {
  const isFirstRender = useRef(0);

  const { getDataKeys, getDataValues } = useContext(DataContext);
  const { duration } = useContext(DurationContext);
  const { setMidiData } = useContext(MIDIContext);
  const [startMidi, setStartMidi] = useState(36);
  const [velocityMin, setVelocityMin] = useState(50);
  const [velocityMax, setVelocityMax] = useState(127);
  const [reverseVelocity, setReverseVelocity] = useState(false);
  const [dataNotes, setDataNotes] = useState("weatherData");
  const [dataDuration, setDataDuration] = useState("weatherData");
  const [dataVelocity, setDataVelocity] = useState("weatherData");

  const dataTypes = getDataKeys();
  
  const fetchData = useCallback(async () => {
    try {
      const response = await midiDataService.getMidiToNotes(
        duration,
        startMidi,
        velocityMin,
        velocityMax,
        reverseVelocity,
        getDataValues(dataNotes),
        getDataValues(dataVelocity),
        getDataValues(dataDuration)
      );
      setMidiData(response);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [
    duration,
    startMidi,
    velocityMin,
    velocityMax,
    reverseVelocity,
    dataNotes,
    dataVelocity,
    dataDuration,
    getDataValues,
    setMidiData,
  ]);

  useEffect(() => {
    if (isFirstRender.current < 3) {
      isFirstRender.current += 1;
      return;
    }
    fetchData();
  }, [duration, fetchData]);

  return (
    <Container fluid>
      <Row>
        <Col xs={4}>
          <InputGroup className="mb-3">
            <InputGroup.Text id="lowest-midi">
              Lowest Midi Note:
            </InputGroup.Text>
            <Form.Control
              placeholder={startMidi}
              aria-label="lowest-midi"
              onChange={(e) => setStartMidi(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col>
          <InputGroup className="mb-3">
            <InputGroup.Text>Velocity Range:</InputGroup.Text>
            <Form.Control
              placeholder={velocityMin}
              aria-label="min-velocity"
              onChange={(e) => setVelocityMin(e.target.value)}
            />
            <Form.Control
              placeholder={velocityMax}
              aria-label="max-velocity"
              onChange={(e) => setVelocityMax(e.target.value)}
            />
            <InputGroup.Text>Reverse Mapping:</InputGroup.Text>
            <InputGroup.Checkbox
              aria-label="reverse-velocity-mapping"
              onChange={() => setReverseVelocity(!reverseVelocity)}
            />
          </InputGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <InputGroup className="mb-3">
            <InputGroup.Text>Notes:</InputGroup.Text>
            <Form.Select
              aria-label="data-notes"
              value={dataNotes}
              onChange={(e) => setDataNotes(e.target.value)}
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
            <InputGroup.Text>Durations:</InputGroup.Text>
            <Form.Select
              aria-label="data-durations"
              value={dataDuration}
              onChange={(e) => setDataDuration(e.target.value)}
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
            <InputGroup.Text>Velocity:</InputGroup.Text>
            <Form.Select
              aria-label="data-velocity"
              value={dataVelocity}
              onChange={(e) => setDataVelocity(e.target.value)}
            >
              {dataTypes.map((t) => (
                <option key={t} value={t}>
                  {dataTextMapping[t]}
                </option>
              ))}
            </Form.Select>
          </InputGroup>
        </Col>
      </Row>
      <Button variant="dark" size="lg" onClick={() => fetchData()}>
        Calculate Midi Data
      </Button>
    </Container>
  );
};

export default DataToNotes;
