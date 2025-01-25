import { useState } from "react";
import PropTypes from "prop-types";
import { MIDIContext } from "./MidiContext";

export const MIDIProvider = ({ children }) => {
  const [midiData, setMidiData] = useState({});

  return (
    <MIDIContext.Provider value={{ midiData, setMidiData }}>
      {children}
    </MIDIContext.Provider>
  );
};

MIDIProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
