import Form from "react-bootstrap/Form";
import { Button, Container, Row, Col } from "react-bootstrap";
import InputGroup from "react-bootstrap/InputGroup";
import PropTypes from "prop-types";

import { useContext, useState } from "react";
import { DataContext } from "../contexts/DataContext";
import { MIDIContext } from "../contexts/MidiContext";
import midiDataService from "../services/midiDataService";
import { dataTextMapping } from "../config";

const DataToNotes = ({ index, onRemove }) => {
  const { getDataKeys, getDataValues } = useContext(DataContext);

  const { appendMidiData, removeMidiData } = useContext(MIDIContext);
  const [duration, setDuration] = useState(300);
  const [startMidi, setStartMidi] = useState(36);
  const [velocityMin, setVelocityMin] = useState(50);
  const [velocityMax, setVelocityMax] = useState(127);
  const [reverseVelocity, setReverseVelocity] = useState(false);
  const [dataNotes, setDataNotes] = useState("weatherData");
  const [dataDuration, setDataDuration] = useState("weatherData");
  const [dataVelocity, setDataVelocity] = useState("weatherData");

  const dataTypes = getDataKeys();

  const fetchData = async () => {
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
      appendMidiData(index, response);
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
      <h2>MIDI Notes Data {index + 1}</h2>
      <Row>
        <Col xs={4}>
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
              onChange={(e) => setStartMidi(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col>
          <InputGroup className="mb-3">
            <InputGroup.Text>Velocity Range:</InputGroup.Text>
            <Form.Control
              type="number"
              min={0}
              max={127}
              placeholder={velocityMin}
              aria-label="min-velocity"
              onChange={(e) => setVelocityMin(e.target.value)}
            />
            <Form.Control
              type="number"
              min={0}
              max={127}
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
      <Row>
        <InputGroup className="mb-3">
          <InputGroup.Text id="duration">
            Duration of Sonification in Seconds:
          </InputGroup.Text>
          <Form.Control
            type="number"
            placeholder={duration}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </InputGroup>
      </Row>
      <Row>
        <Col>
          <Button variant="secondary" size="lg" onClick={() => handleRemove()}>
            Remove
          </Button>
        </Col>
        <Col>
          <Button variant="dark" size="lg" onClick={() => fetchData()}>
            Calculate Midi Data
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default DataToNotes;

DataToNotes.propTypes = {
  index: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired,
};
