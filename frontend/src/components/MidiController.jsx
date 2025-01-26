import { useState, useEffect, useContext } from "react";
import { MIDIContext } from "../contexts/MidiContext";

const MidiController = () => {
  const [outputDevices, setOutputDevices] = useState([]);
  const [selectedOutput, setSelectedOutput] = useState(null);
  const { midiData } = useContext(MIDIContext);

  useEffect(() => {
    navigator
      .requestMIDIAccess()
      .then((access) => {
        setOutputDevices(Array.from(access.outputs.values()));
      })
      .catch((err) => console.error("MIDI access failed", err));
  }, []);

  const sendNoteOn = (device, note, velocity = 64) => {
    if (device) {
      device.send([0x90, note, velocity]); // 0x90 = note_on message
      console.log(`Note On: ${note}, Velocity: ${velocity}`);
    }
  };

  const sendNoteOff = (device, note) => {
    if (device) {
      device.send([0x80, note, 0]); // 0x80 = note_off message
      console.log(`Note Off: ${note}`);
    }
  };

  const playNotes = async () => {
    const firstEntry = midiData[0];
    const hasNote = "note" in firstEntry;
    const hasChord = "chord" in firstEntry;

    if (selectedOutput) {
      if (hasNote) {
        for (const { note, velocity, duration } of midiData) {
          sendNoteOn(selectedOutput, note, velocity);
          await new Promise((resolve) => setTimeout(resolve, duration * 1000));
          sendNoteOff(selectedOutput, note);
        }
      } else if (hasChord) {
        for (const { chord, velocity, duration } of midiData) {
          for (const c of chord) {
            sendNoteOn(selectedOutput, c, velocity);
          }
          await new Promise((resolve) => setTimeout(resolve, duration * 1000));
          for (const c of chord) {
            sendNoteOff(selectedOutput, c);
          }
        }
      }
    } else {
      console.error("No MIDI device selected");
    }
  };

  const handleDeviceSelect = (id) => {
    const device = outputDevices.find((output) => output.id === id);
    setSelectedOutput(device);
  };

  return (
    <div>
      <h1>MIDI Controller</h1>
      <select onChange={(e) => handleDeviceSelect(e.target.value)}>
        <option value="">--Select MIDI Device--</option>
        {outputDevices.map((device) => (
          <option key={device.id} value={device.id}>
            {device.name}
          </option>
        ))}
      </select>
      <button onClick={playNotes}>Play Note</button>
    </div>
  );
};

export default MidiController;
