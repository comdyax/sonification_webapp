import { useContext, useState } from "react";
import { DataContext } from "../contexts/DataContext";
import { MIDIContext } from "../contexts/MidiContext";
import { DurationContext } from "../contexts/DurationContext";
import midiDataService from "../services/midiDataService";
import { dataTextMapping } from "../config";
import PropTypes from "prop-types";
import { Container, Row, Col, Button } from "react-bootstrap";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";

const DataToCC = ({ index, onRemove }) => {
  const { getDataKeys, getDataValues } = useContext(DataContext);
  const { duration } = useContext(DurationContext);
  const { appendCCData, removeCCData } = useContext(MIDIContext);

  const [midiMin, setMidiMin] = useState(0);
  const [midiMax, setMidiMax] = useState(127);
  const [ccNumber, setCCNumber] = useState(null);
  const [ccDuration, setCCDuration] = useState(null);
  const [reverseMapping, setReverseMapping] = useState(false);
  const [dataCC, setDataCC] = useState(null);
  const [dataDuration, setDataDuration] = useState(null);

  const dataTypes = getDataKeys();

  const fetchData = async () => {
    try {
      const response = await midiDataService.getMidiToCC(
        duration,
        midiMin,
        midiMax,
        reverseMapping,
        ccDuration,
        getDataValues(dataCC),
        getDataValues(dataDuration)
      );
      response.ccNumber = ccNumber;
      appendCCData(index, response);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleRemove = () => {
    onRemove();
    removeCCData(index);
  };
  return (
    <Container fluid>
      <h2>MIDI Control Change Data {index + 1}</h2>
      <Row>
        <Col xs={4}>
          <InputGroup className="mb-3">
            <InputGroup.Text id="midi-cc">CC Number:</InputGroup.Text>
            <Form.Control
              type="number"
              placeholder={ccNumber}
              aria-label="midi-cc"
              onChange={(e) => setCCNumber(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col>
          <InputGroup className="mb-3">
            <InputGroup.Text id="midi-min">Midi Range:</InputGroup.Text>
            <Form.Control
              placeholder={midiMin}
              aria-label="midi-min"
              min={0}
              max={127}
              onChange={(e) => setMidiMin(e.target.value)}
            />
            <Form.Control
              placeholder={midiMax}
              aria-label="midi-max"
              min={0}
              max={127}
              onChange={(e) => setMidiMax(e.target.value)}
            />
            <InputGroup.Text>Reverse Mapping:</InputGroup.Text>
            <InputGroup.Checkbox
              aria-label="reverse-mapping"
              onChange={() => setReverseMapping(!reverseMapping)}
            />
          </InputGroup>
        </Col>
      </Row>
      <Row>
        <Col xs={4}>
          <InputGroup className="mb-3">
            <InputGroup.Text>CC Values:</InputGroup.Text>
            <Form.Select
              aria-label="data-cc"
              value={dataCC}
              onChange={(e) => setDataCC(e.target.value)}
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
            <InputGroup.Text>Duration:</InputGroup.Text>
            <Form.Select
              aria-label="duration-cc"
              value={dataDuration}
              onChange={(e) => setDataDuration(e.target.value)}
            >
              {dataTypes.map((t) => (
                <option key={t} value={t}>
                  {dataTextMapping[t]}
                </option>
              ))}
            </Form.Select>
            <InputGroup.Text>Custom</InputGroup.Text>
            <Form.Control
              type="number"
              value={dataCC}
              onChange={(e) => setCCDuration(e.target.value)}
            />
          </InputGroup>
        </Col>
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

export default DataToCC;

DataToCC.propTypes = {
  index: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired,
};
