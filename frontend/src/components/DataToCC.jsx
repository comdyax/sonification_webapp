import { useContext, useState } from "react";
import { DataContext } from "../contexts/DataContext";
import { MIDIContext } from "../contexts/MidiContext";
import { DurationContext } from "../contexts/DurationContext";
import midiDataService from "../services/midiDataService";
import { dataTextMapping } from "../config";
import PropTypes from "prop-types";

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
    <>
      <h2>MIDI Control Change Data {index + 1}</h2>
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
        <input type="number" onChange={(e) => setCCNumber(e.target.value)} />
      </label>
      <br />
      <label>
        reverse midi mapping: &ensp;
        <input
          type="checkbox"
          checked={reverseMapping}
          onChange={() => setReverseMapping(!reverseMapping)}
        />
      </label>
      <br />
      <label>
        set custom duration in seconds: &ensp;
        <input type="number" onChange={(e) => setCCDuration(e.target.value)} />
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
        Create CC Data
      </button>
      <button style={{ margin: "20px" }} onClick={() => handleRemove()}>
        Remove
      </button>
    </>
  );
};

export default DataToCC;

DataToCC.propTypes = {
  index: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired,
};
