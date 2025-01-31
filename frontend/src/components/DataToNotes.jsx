import Form from "react-bootstrap/Form";
import { Button, Container, Row, Col } from "react-bootstrap";
import InputGroup from "react-bootstrap/InputGroup";
import PropTypes from "prop-types";

import { useContext, useState, useRef } from "react";
import { DataContext } from "../contexts/DataContext";
import { MIDIContext } from "../contexts/MidiContext";
import midiDataService from "../services/midiDataService";
import { dataTextMapping } from "../config";

import MIDIDataTable from "./MidiDataTable";
import MIDIDataPlot from "./MidiDataPlot";

const DataToNotes = ({ index, onRemove }) => {
  const { getDataKeys, getDataValues } = useContext(DataContext);
  const { appendMidiData, removeMidiData } = useContext(MIDIContext);

  const [duration, setDuration] = useState(300);
  const [startMidi, setStartMidi] = useState(36);
  const [velocityMin, setVelocityMin] = useState(50);
  const [velocityMax, setVelocityMax] = useState(127);
  const [reverseVelocity, setReverseVelocity] = useState(false);

  const dataTypes = getDataKeys();
  const tableData = useRef(null);

  const [dataNotes, setDataNotes] = useState(dataTypes[0]);
  const [dataDuration, setDataDuration] = useState(dataTypes[1]);
  const [dataVelocity, setDataVelocity] = useState(dataTypes[2]);

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
      tableData.current = response;
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
      <h2>{index + 1}. MIDI Notes Data</h2>
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
      </Row>
      <Row>
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
        <Col>
          <InputGroup className="mb-3">
            <InputGroup.Text id="duration">
              Duration of Sonification in Seconds:
            </InputGroup.Text>
            <Form.Control
              type="number"
              placeholder={duration}
              onChange={(e) => setDuration(e.target.value)}
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
          <Button variant="dark" size="lg" onClick={() => fetchData()}>
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

export default DataToNotes;

DataToNotes.propTypes = {
  index: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired,
};
