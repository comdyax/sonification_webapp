import { useContext, useState, useRef } from "react";
import { DataContext } from "../contexts/DataContext";
import { MIDIContext } from "../contexts/MidiContext";
import midiDataService from "../services/midiDataService";
import { dataTextMapping } from "../config";
import PropTypes from "prop-types";
import { Container, Row, Col, Button } from "react-bootstrap";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import MIDIDataPlot from "./MidiDataPlot";
import MIDIDataTable from "./MidiDataTable";

const DataToCC = ({ index, onRemove }) => {
  const { getDataKeys, getDataValues } = useContext(DataContext);
  const { appendCCData, removeCCData } = useContext(MIDIContext);

  const tableData = useRef(null);
  const dataTypes = getDataKeys();

  const [duration, setDuration] = useState(300);
  const [midiMin, setMidiMin] = useState(0);
  const [midiMax, setMidiMax] = useState(127);
  const [ccNumber, setCCNumber] = useState(null);
  const [ccDuration, setCCDuration] = useState(null);
  const [reverseMapping, setReverseMapping] = useState(false);
  const [dataCC, setDataCC] = useState(dataTypes[0]);
  const [dataDuration, setDataDuration] = useState(dataTypes[0]);

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
      tableData.current = response;
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
      <h2>{index + 1}. MIDI Control Change Data</h2>
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
              type="number"
              min={0}
              max={127}
              onChange={(e) => setMidiMin(e.target.value)}
            />
            <Form.Control
              placeholder={midiMax}
              aria-label="midi-max"
              type="number"
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
              onChange={(e) => setDataDuration(e.target.value)}
            >
              <option value={dataTypes[0]}>--opt. add data--</option>
              {dataTypes.map((t) => (
                <option key={t} value={t}>
                  {dataTextMapping[t]}
                </option>
              ))}
            </Form.Select>
            <InputGroup.Text>Fixed Duration:</InputGroup.Text>
            <Form.Control
              type="number"
              placeholder={ccDuration}
              onChange={(e) => setCCDuration(e.target.value)}
            />
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
            onChange={(e) => setDuration(e.target.value)}
          />
        </InputGroup>
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

export default DataToCC;

DataToCC.propTypes = {
  index: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired,
};
