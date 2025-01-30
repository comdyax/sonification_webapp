import { useContext, useEffect, useState } from "react";
import { DataContext } from "../contexts/DataContext";
import { MIDIContext } from "../contexts/MidiContext";
import { DurationContext } from "../contexts/DurationContext";
import midiDataService from "../services/midiDataService";
import { dataTextMapping, chordTypes } from "../config";

const DataToChords = () => {
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

  useEffect(() => {
    if (dataTypes.length > 0) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const fetchData = async () => {
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
