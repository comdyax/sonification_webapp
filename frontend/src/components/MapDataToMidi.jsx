import { useContext, useState, useEffect } from "react";
import { DataContext } from "../contexts/DataContext";
import { MIDIContext } from "../contexts/MidiContext";
import MidiController from "./MidiController";
import DataToChords from "./DataToChords";
import DataToNotes from "./DataToNotes";
import CCDataCreator from "./CCDataCreator";
import MIDIDataTable from "./MidiDataTable";

import Form from "react-bootstrap/Form";
import { noteMappingStrategies } from "../config";
import { Container, Button } from "react-bootstrap";
import SelectDuration from "./SelectDuration";

const MapDataToMidi = () => {
  const { midiData, setMidiData } = useContext(MIDIContext);
  const { weatherData } = useContext(DataContext);
  const [midiStrategy, setMidiStrategy] = useState("");

  useEffect(() => {}, [weatherData]);

  const handleSelect = (item) => {
    setMidiStrategy(item);
    setMidiData({});
  };

  return (
    <>
      {weatherData.length > 0 && (
        <Container fluid className="mb-5">
          <h1>Build Sonification</h1>
          <SelectDuration />
          <Form.Select
            style={{ textAlign: "center", maxWidth: "400px", margin: "auto" }}
            size="lg"
            aria-label="Select Note Mapping Strategy"
            value={midiStrategy}
            onChange={(e) => handleSelect(e.target.value)}
          >
            <option value={""}>Select Mapping Strategy</option>
            {Object.entries(noteMappingStrategies).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </Form.Select>
          {midiStrategy && <h3>Map Data to Parameters</h3>}
          {midiStrategy === "notes" && <DataToNotes />}
          {midiStrategy === "chords" && <DataToChords />}
          {midiData.length > 0 && <MIDIDataTable midiData={midiData} />}
          {/* <CCDataCreator />
          <br />
          {midiData && <MidiController />}
          <br /> */}
          {weatherData.length > 0 && (
            <Button
              className="m-5"
              variant="dark"
              size="lg"
              onClick={() => window.location.reload()}
            >
              Reset
            </Button>
          )}
        </Container>
      )}
    </>
  );
};

export default MapDataToMidi;
