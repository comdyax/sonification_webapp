import { useContext, useState } from "react";
import { DataContext } from "../contexts/DataContext";
import { MIDIContext } from "../contexts/MidiContext";
import { DurationContext } from "../contexts/DurationContext";
import midiData from "../services/midiData";
import { dataTextMapping, chordTypes } from "../config";

const DataToChords = () => {
  const { getDataKeys, getDataValues } = useContext(DataContext);
  const { duration } = useContext(DurationContext);
  const { setMidiData } = useContext(MIDIContext);
  const [startMidi, setStartMidi] = useState(36);
  const [velocityMin, setVelocityMin] = useState(50);
  const [velocityMax, setVelocityMax] = useState(127);
  const [reverseVelocity, setReverseVelocity] = useState(false);
  const [chordType, setChordType] = useState(null);
  const [dataChords, setDataChords] = useState(null);
  const [dataDuration, setDataDuration] = useState(null);
  const [dataVelocity, setDataVelocity] = useState(null);

  const dataTypes = getDataKeys();

  const fetchData = async () => {
    try {
      console.log(dataChords);

      const response = await midiData.getMidiToChords(
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
  };
  return (
    <>
      <label>
        set lowest midi note: &ensp;
        <input
          type="number"
          value={startMidi}
          onChange={(e) => setStartMidi(e.target.value)}
        />
      </label>
      <br />
      <label>
        set minimum velocity: &ensp;
        <input
          type="number"
          value={velocityMin}
          onChange={(e) => setVelocityMin(e.target.value)}
        />
      </label>
      <br />
      <label>
        set maximum velocity: &ensp;
        <input
          type="number"
          value={velocityMax}
          onChange={(e) => setVelocityMax(e.target.value)}
        />
      </label>
      <br />
      <label>
        <input
          type="checkbox"
          value={reverseVelocity}
          onChange={(e) => setReverseVelocity(e.target.value)}
        />
        reverse velocity mapping
      </label>
      <br />
      <label>
        <select onChange={(e) => setChordType(e.target.value)}>
          <option value="">--select chord type--</option>
          {Object.entries(chordTypes).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
      </label>

      <br />
      <label>
        <select onChange={(e) => setDataChords(e.target.value)}>
          <option value="">--select data for chords--</option>
          {dataTypes.map((t) => (
            <option key={t} value={t}>
              {dataTextMapping[t]}
            </option>
          ))}
        </select>
      </label>
      <br />
      <label>
        <select onChange={(e) => setDataDuration(e.target.value)}>
          <option value="">--select data for duration--</option>
          {dataTypes.map((t) => (
            <option key={t} value={t}>
              {dataTextMapping[t]}
            </option>
          ))}
        </select>
      </label>
      <br />
      <label>
        <select onChange={(e) => setDataVelocity(e.target.value)}>
          <option value="">--select data for velocity--</option>
          {dataTypes.map((t) => (
            <option key={t} value={t}>
              {dataTextMapping[t]}
            </option>
          ))}
        </select>
      </label>
      <br />
      <button style={{ margin: "20px" }} onClick={() => fetchData()}>
        Calculate Midi Data
      </button>
    </>
  );
};

export default DataToChords;
