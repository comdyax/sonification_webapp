import { useState, useEffect, useContext, useRef } from "react";
import { MIDIContext } from "../contexts/MidiContext";

const MidiController = () => {
  const [outputDevices, setOutputDevices] = useState([]);
  const [selectedOutput, setSelectedOutput] = useState(null);
  const { midiData, ccData } = useContext(MIDIContext);
  const [lastNotes, setLastNotes] = useState(null);
  const isPlayingRef = useRef(false);

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

  const sendCC = (device, controller, value) => {
    if (device) {
      device.send([0xb0, controller, value]); // 0xB0 = control change message
      console.log(`CC: ${controller}, Value: ${value}`);
    }
  };

  const playNotes = async () => {
    const firstEntry = midiData[0];
    const hasNote = "note" in firstEntry;
    const hasChord = "chord" in firstEntry;

    if (selectedOutput) {
      isPlayingRef.current = true;
      while (isPlayingRef.current) {
        if (hasNote) {
          for (const { note, velocity, duration } of midiData) {
            if (!isPlayingRef.current) break;
            sendNoteOn(selectedOutput, note, velocity);
            setLastNotes(note);
            await new Promise((resolve) =>
              setTimeout(resolve, duration * 1000)
            );
            if (!isPlayingRef.current) break;
            sendNoteOff(selectedOutput, note);
          }
        } else if (hasChord) {
          for (const { chord, velocity, duration } of midiData) {
            if (!isPlayingRef.current) break;
            for (const c of chord) {
              sendNoteOn(selectedOutput, c, velocity);
            }
            setLastNotes(chord);
            await new Promise((resolve) =>
              setTimeout(resolve, duration * 1000)
            );
            if (!isPlayingRef.current) break;
            for (const c of chord) {
              sendNoteOff(selectedOutput, c);
            }
          }
        }
      }
      isPlayingRef.current = false;
    } else {
      console.error("No MIDI device selected");
    }
  };

  const stopNotes = () => {
    if (selectedOutput) {
      if (typeof lastNotes === "number") {
        sendNoteOff(selectedOutput, lastNotes);
      } else if (Array.isArray(lastNotes)) {
        for (const n of lastNotes) {
          sendNoteOff(selectedOutput, n);
        }
      }
      isPlayingRef.current = false;
      console.log("Playback stopped");
    }
  };

  const playCC = async () => {
    if (selectedOutput && Object.keys(ccData).length > 0) {
      const ccNumber = ccData.ccNumber;
      for (const { cc_message, duration } of ccData) {
        if (!isPlayingRef.current) break;
        sendCC(selectedOutput, ccNumber, cc_message);
        await new Promise((resolve) => setTimeout(resolve, duration * 1000));
      }
    }
  };

  const togglePlayback = async () => {
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      stopNotes();
    } else {
      await Promise.all([playNotes(), playCC()]);
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
      <button onClick={togglePlayback}>
        {isPlayingRef.current ? "Stop" : "Play"}
      </button>
    </div>
  );
};

export default MidiController;
