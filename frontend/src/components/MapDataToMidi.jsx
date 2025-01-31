import { useContext, useState } from "react";
import { DataContext } from "../contexts/DataContext";
import DataToChords from "./DataToChords";
import DataToNotes from "./DataToNotes";
import DataToCC from "./DataToCC";

import Form from "react-bootstrap/Form";
import { noteMappingStrategies } from "../config";
import { Container, Button, Row, Col } from "react-bootstrap";
import MidiController from "./MidiController";

const MapDataToMidi = () => {
  const { weatherData } = useContext(DataContext);
  const [midiComponents, setMidiComponents] = useState({});
  const [nextId, setNextId] = useState(0);

  const addComponent = (item) => {
    const newId = nextId;
    setMidiComponents((prev) => ({
      ...prev,
      [newId]: { id: newId, strategy: item },
    }));
    setNextId((prev) => prev + 1);
  };

  const removeMidiComponent = (id) => {
    if (Object.keys(midiComponents).length === 1) {
      setNextId(0);
    }
    setMidiComponents((prev) => {
      // eslint-disable-next-line no-unused-vars
      const { [id]: _, ...newComponents } = prev;
      return newComponents;
    });
  };

  const midiMappingComponents = {
    notes: DataToNotes,
    chords: DataToChords,
    cc: DataToCC,
  };

  return (
    <>
      {weatherData.length > 0 && (
        <Container fluid className="mb-5">
          <h1>Build Sonification</h1>
          <Row>
            <Form.Select
              style={{ textAlign: "center", maxWidth: "560px", margin: "auto" }}
              size="lg"
              aria-label="Select Note Mapping Strategy"
              value="Select Mapping Strategy"
              onChange={(e) => addComponent(e.target.value)}
            >
              <option>-- Select/Add Mapping Strategy --</option>
              {Object.entries(noteMappingStrategies).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </Form.Select>
          </Row>
          <Row>
            {Object.entries(midiComponents).map(([id, component]) => {
              const ComponentType = midiMappingComponents[component.strategy];
              return ComponentType ? (
                <ComponentType
                  key={id}
                  index={component.id}
                  onRemove={() => removeMidiComponent(id)}
                />
              ) : null;
            })}
          </Row>
          <Row>
            {Object.keys(midiComponents).length > 0 && (
              <Col>
                <MidiController />
              </Col>
            )}
            <Col>
              <Button
                className="m-5"
                variant="dark"
                size="lg"
                onClick={() => window.location.reload()}
              >
                Reset All
              </Button>
            </Col>
          </Row>
        </Container>
      )}
    </>
  );
};

export default MapDataToMidi;
