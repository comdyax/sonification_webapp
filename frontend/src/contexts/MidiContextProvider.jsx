import { useState } from "react";
import PropTypes from "prop-types";
import { MIDIContext } from "./MidiContext";

export const MIDIProvider = ({ children }) => {
  const [midiData, setMidiData] = useState({});
  const [ccData, setCCData] = useState({});

  const appendMidiData = (key, data) => {
    setMidiData((prevData) => ({
      ...prevData,
      [key]: data,
    }));
  };

  const removeMidiData = (key) => {
    setMidiData((prev) => {
      // eslint-disable-next-line no-unused-vars
      const { [key]: _, ...newData } = prev;
      return newData;
    });
  };

  const appendCCData = (key, data) => {
    setCCData((prevData) => ({
      ...prevData,
      [key]: data,
    }));
  };

  const removeCCData = (key) => {
    setCCData((prev) => {
      // eslint-disable-next-line no-unused-vars
      const { [key]: _, ...newData } = prev;
      return newData;
    });
  };

  return (
    <MIDIContext.Provider
      value={{
        midiData,
        ccData,
        appendCCData,
        removeCCData,
        appendMidiData,
        removeMidiData,
      }}
    >
      {children}
    </MIDIContext.Provider>
  );
};

MIDIProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
