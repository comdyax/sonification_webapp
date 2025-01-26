import { useContext, useState } from "react";
import { DataContext } from "../contexts/DataContext";
import { MIDIContext } from "../contexts/MidiContext";
import { DurationContext } from "../contexts/DurationContext";
import midiData from "../services/midiData";
import { dataTextMapping } from "../config";

const DataToCC = () => {
  const { getDataKeys, getDataValues } = useContext(DataContext);
  const { duration } = useContext(DurationContext);
  const { setCCData } = useContext(MIDIContext);
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
      const response = await midiData.getMidiToCC(
        duration,
        midiMin,
        midiMax,
        reverseMapping,
        ccDuration,
        getDataValues(dataCC),
        getDataValues(dataDuration)
      );
      response.ccNumber = ccNumber;
      setCCData(response);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  return (
    <>
      <label>
        minimum midi: &ensp;
        <input
          type="number"
          value={midiMin}
          onChange={(e) => setMidiMin(e.target.value)}
        />
      </label>
      <br />
      <label>
        maximum midi: &ensp;
        <input
          type="number"
          value={midiMax}
          onChange={(e) => setMidiMax(e.target.value)}
        />
      </label>
      <br />
      <label>
        CC Number of midi Controller: &ensp;
        <input
          type="number"
          value={ccNumber}
          onChange={(e) => setCCNumber(e.target.value)}
        />
      </label>
      <br />
      <label>
        reverse midi mapping: &ensp;
        <input
          type="checkbox"
          value={reverseMapping}
          onChange={(e) => setReverseMapping(e.target.value)}
        />
      </label>
      <br />
      <label>
        set custom duration in seconds: &ensp;
        <input
          type="number"
          value={ccDuration}
          onChange={(e) => setCCDuration(e.target.value)}
        />
      </label>
      <br />
      <label>
        <select onChange={(e) => setDataCC(e.target.value)}>
          <option value="">--select data for cc values--</option>
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
      <button style={{ margin: "20px" }} onClick={() => fetchData()}>
        Calculate CC Data
      </button>
    </>
  );
};

export default DataToCC;
