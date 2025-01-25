import { useContext, useState } from "react";
import { DataContext } from "../contexts/DataContext";
import { MIDIContext } from "../contexts/MidiContext";
import { DurationContext } from "../contexts/DurationContext";
import midiData from "../services/midiData";

const DataToNotes = () => {
  const { getDataKeys, getDataValues, weatherData } = useContext(DataContext);
  const { duration } = useContext(DurationContext);
  const { setMidiData } = useContext(MIDIContext);
  const [starMidi, setStartMidi] = useState(36);
  const [velocityMin, setVelocityMin] = useState(50);
  const [velocityMax, setVelocityMax] = useState(127);
  const [reverseVelocity, setReverseVelocity] = useState(false);
  return (
    <>
      <label></label>
    </>
  );
};

const MapDataToMidi = () => {
  const { getDataKeys, getDataValues, weatherData } = useContext(DataContext);

  const [midiStrategy, setMidiStrategy] = useState("");

  console.log(midiStrategy);

  return (
    <>
      <h2 style={{ textAlign: "center", padding: "4%" }}>
        4. Build Sonification
      </h2>
      <div style={{ textAlign: "center" }}>
        <label>
          select sonification strategy: &ensp;
          <select
            value={midiStrategy}
            onChange={(e) => setMidiStrategy(e.target.value)}
          >
            <option value="notes">data to notes</option>
            <option value="chords">data to chords</option>
            <option value="drone">cdata to drone</option>
          </select>
        </label>
        <label></label>
      </div>
    </>
  );
};

export default MapDataToMidi;
