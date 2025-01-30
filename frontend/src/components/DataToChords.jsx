import { useContext, useEffect, useState, useCallback, useRef } from "react";
import { DataContext } from "../contexts/DataContext";
import { MIDIContext } from "../contexts/MidiContext";
import { DurationContext } from "../contexts/DurationContext";
import midiDataService from "../services/midiDataService";
import { dataTextMapping, chordTypes } from "../config";
import { Container, Row, Col, Button } from "react-bootstrap";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";

const DataToChords = () => {
  const isFirstRender = useRef(0);

  const { getDataKeys, getDataValues } = useContext(DataContext);
  const { duration } = useContext(DurationContext);
  const { setMidiData } = useContext(MIDIContext);
  const [startMidi, setStartMidi] = useState(36);
  const [velocityMin, setVelocityMin] = useState(50);
  const [velocityMax, setVelocityMax] = useState(127);
  const [reverseVelocity, setReverseVelocity] = useState(false);
  const [chordType, setChordType] = useState(Object.keys(chordTypes)[0]);

  const dataTypes = getDataKeys();

  const [dataChords, setDataChords] = useState(dataTypes[0]);
  const [dataDuration, setDataDuration] = useState(dataTypes[0]);
  const [dataVelocity, setDataVelocity] = useState(dataTypes[0]);

  const fetchData = useCallback(async () => {
    try {
      const response = await midiDataService.getMidiToChords(
        duration,
        startMidi,
        velocityMin,
        velocityMax,
        reverseVelocity,
        chordType,
        getDataValues(dataChords),
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
    chordType,
    dataVelocity,
    dataDuration,
    dataChords,
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
            <InputGroup.Text>Chordtype:</InputGroup.Text>
            <Form.Select
              aria-label="data-notes"
              value={dataChords}
              onChange={(e) => setChordType(e.target.value)}
            >
              {Object.entries(chordTypes).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </Form.Select>
          </InputGroup>
        </Col>
        <Col>
          <InputGroup className="mb-3">
            <InputGroup.Text>Chords:</InputGroup.Text>
            <Form.Select
              aria-label="data-notes"
              value={dataChords}
              onChange={(e) => setDataChords(e.target.value)}
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
      <Row>
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

export default DataToChords;
