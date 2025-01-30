import { useContext, useEffect, useState } from "react";
import { DataContext } from "../contexts/DataContext";
import { MIDIContext } from "../contexts/MidiContext";
import { DurationContext } from "../contexts/DurationContext";
import midiDataService from "../services/midiDataService";
import { dataTextMapping } from "../config";

const DataToNotes = () => {
  const { getDataKeys, getDataValues } = useContext(DataContext);
  const { duration } = useContext(DurationContext);
  const { setMidiData } = useContext(MIDIContext);
  const [startMidi, setStartMidi] = useState(36);
  const [velocityMin, setVelocityMin] = useState(50);
  const [velocityMax, setVelocityMax] = useState(127);
  const [reverseVelocity, setReverseVelocity] = useState(false);
  const [dataNotes, setDataNotes] = useState("weatherData");
  const [dataDuration, setDataDuration] = useState("weatherData");
  const [dataVelocity, setDataVelocity] = useState("weatherData");

  const dataTypes = getDataKeys();

  useEffect(() => {
    if (dataTypes.length > 0) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

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
        select data for notes: &ensp;
        <select
          value={dataNotes}
          onChange={(e) => setDataNotes(e.target.value)}
        >
          {dataTypes.map((t) => (
            <option key={t} value={t}>
              {dataTextMapping[t]}
            </option>
          ))}
        </select>
      </label>
      <br />
      <label>
        select data for duration: &ensp;
        <select
          value={dataDuration}
          onChange={(e) => setDataDuration(e.target.value)}
        >
          {dataTypes.map((t) => (
            <option key={t} value={t}>
              {dataTextMapping[t]}
            </option>
          ))}
        </select>
      </label>
      <br />
      <label>
        select data for velocity: &ensp;
        <select
          value={dataVelocity}
          onChange={(e) => setDataVelocity(e.target.value)}
        >
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

export default DataToNotes;
