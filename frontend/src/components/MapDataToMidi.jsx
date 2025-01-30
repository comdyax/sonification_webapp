import { useContext, useState, useRef } from "react";
import * as Tone from "tone";
import { DataContext } from "../contexts/DataContext";
import { MIDIContext } from "../contexts/MidiContext";
import MidiController from "./MidiController";
import DataToChords from "./DataToChords";
import DataToNotes from "./DataToNotes";
import CCDataCreator from "./CCDataCreator";

const MidiPlayer = () => {
  const { midiData } = useContext(MIDIContext);
  const [isPlaying, setIsPlaying] = useState(false); // Track playback state
  const synthRef = useRef(null); // Use ref to persist the synth instance
  const timeoutIds = useRef([]); // Store timeouts to stop playback

  const playNotes = async () => {
    await Tone.start(); // Ensure Tone.js is started
    if (!synthRef.current) {
      synthRef.current = new Tone.Synth().toDestination(); // Initialize synth once
    }
    const synth = synthRef.current;

    let time = Tone.now();
    midiData.forEach(({ note, velocity, duration }) => {
      const tone = Tone.Frequency(note, "midi").toNote();
      const attackTimeout = setTimeout(
        () => synth.triggerAttack(tone, undefined, velocity),
        (time - Tone.now()) * 1000
      );
      const releaseTimeout = setTimeout(
        () => synth.triggerRelease(),
        (time + duration - Tone.now()) * 1000
      );

      timeoutIds.current.push(attackTimeout, releaseTimeout);
      time += duration;
    });
  };

  const stopNotes = () => {
    timeoutIds.current.forEach((id) => clearTimeout(id)); // Clear all scheduled timeouts
    timeoutIds.current = [];
    if (synthRef.current) {
      synthRef.current.triggerRelease(); // Ensure any playing note is stopped
    }
  };

  const handleButtonClick = () => {
    if (isPlaying) {
      stopNotes(); // Stop the playback
    } else {
      playNotes(); // Start the playback
    }
    setIsPlaying(!isPlaying); // Toggle the playback state
  };

  return (
    <div>
      <button onClick={handleButtonClick}>{isPlaying ? "Stop" : "Play"}</button>
    </div>
  );
};

const MapDataToMidi = () => {
  const { midiData } = useContext(MIDIContext);
  const { weatherData } = useContext(DataContext);

  const [midiStrategy, setMidiStrategy] = useState("notes");

  return (
    <>
      <div>
        <h2 style={{ textAlign: "center", padding: "4%" }}>
          4. Build Sonification
        </h2>
        <div style={{ textAlign: "center" }}>
          <label>
            select sonification strategy: &ensp;
            <select
              value={midiStrategy}
              onChange={(e) => setMidiStrategy(e.target.value)}
            >
              <option value="notes">data to notes</option>
              <option value="chords">data to chords</option>
              <option value="drone">data to drone</option>
            </select>
          </label>
          <br />
          {midiStrategy === "notes" && <DataToNotes />}
          <br />
          {midiStrategy === "chords" && <DataToChords />}
          <br />
          <CCDataCreator />
          <br />
          {midiData && <MidiPlayer />}
          <br />
          {midiData && <MidiController />}
        </div>
      </div>
    </>
  );
};

export default MapDataToMidi;
