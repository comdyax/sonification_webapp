import { useState, useEffect } from "react";

const MidiController = ({ apiUrl }) => {
  const [midiAccess, setMidiAccess] = useState(null);
  const [outputDevices, setOutputDevices] = useState([]);
  const [selectedOutput, setSelectedOutput] = useState(null);

  useEffect(() => {
    navigator.requestMIDIAccess()
      .then((access) => {
        setMidiAccess(access);
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
  
  const sendControlChange = (device, ccNumber, value) => {
    if (device) {
      device.send([0xB0, ccNumber, value]); // 0xB0 = control change message
      console.log(`CC Message: ${ccNumber} Value: ${value}`);
    }
  };

  const playNotes = async (device, notes, velocity = 64, duration = 500) => {
    for (const note of notes) {
      sendNoteOn(device, note, velocity);
      await new Promise((resolve) => setTimeout(resolve, duration)); // Simulate duration
      sendNoteOff(device, note);
    }
  };

  const playChord = async (device, chord, velocity = 64, duration = 1000) => {
    chord.forEach((note) => sendNoteOn(device, note, velocity));
    await new Promise((resolve) => setTimeout(resolve, duration));
    chord.forEach((note) => sendNoteOff(device, note));
  };

  const handleDeviceSelect = (id) => {
    const device = outputDevices.find((output) => output.id === id);
    setSelectedOutput(device);
  };

  const playNote = () => {
    if (selectedOutput) {
      sendNoteOn(selectedOutput, 60, 127); // Middle C, full velocity
      setTimeout(() => sendNoteOff(selectedOutput, 60), 500);
    }
  };

  const playFromApi = () => {
    if (selectedOutput) {
      fetchMidiDataAndPlay(selectedOutput, apiUrl);
    }
  };

  const fetchMidiDataAndPlay = async (device, apiUrl) => {
    try {
      const response = await fetch(apiUrl);
      const midiData = await response.json();
  
      // Assuming midiData = [{ note: 60, duration: 0.5, velocity: 64 }, ...]
      for (const { note, duration, velocity } of midiData) {
        sendNoteOn(device, note, velocity);
        await new Promise((resolve) => setTimeout(resolve, duration * 1000));
        sendNoteOff(device, note);
      }
    } catch (error) {
      console.error("Failed to fetch or play MIDI data:", error);
    }
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
      <button onClick={playNote}>Play Note</button>
      <button onClick={playFromApi}>Play from API</button>
    </div>
  );
};

export default MidiController;
