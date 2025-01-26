import { useState } from "react";
import PropTypes from "prop-types";
import { MIDIContext } from "./MidiContext";

export const MIDIProvider = ({ children }) => {
  const [midiData, setMidiData] = useState({});
  const [ccData, setCCData] = useState({});

  return (
    <MIDIContext.Provider value={{ midiData, setMidiData, ccData, setCCData }}>
      {children}
    </MIDIContext.Provider>
  );
};

MIDIProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
