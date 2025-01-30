import { useContext, useRef, useState } from "react";
import * as Tone from "tone";
import { MIDIContext } from "../contexts/MidiContext";

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

export default MidiPlayer;


// import * as Tone from "tone";
// const MidiPlayer = () => {
//   const { midiData } = useContext(MIDIContext);
//   const [isPlaying, setIsPlaying] = useState(false); // Track playback state
//   const synthRef = useRef(null); // Use ref to persist the synth instance
//   const timeoutIds = useRef([]); // Store timeouts to stop playback

//   const playNotes = async () => {
//     await Tone.start(); // Ensure Tone.js is started
//     if (!synthRef.current) {
//       synthRef.current = new Tone.Synth().toDestination(); // Initialize synth once
//     }
//     const synth = synthRef.current;

//     let time = Tone.now();
//     midiData.forEach(({ note, velocity, duration }) => {
//       const tone = Tone.Frequency(note, "midi").toNote();
//       const attackTimeout = setTimeout(
//         () => synth.triggerAttack(tone, undefined, velocity),
//         (time - Tone.now()) * 1000
//       );
//       const releaseTimeout = setTimeout(
//         () => synth.triggerRelease(),
//         (time + duration - Tone.now()) * 1000
//       );

//       timeoutIds.current.push(attackTimeout, releaseTimeout);
//       time += duration;
//     });
//   };

//   const stopNotes = () => {
//     timeoutIds.current.forEach((id) => clearTimeout(id)); // Clear all scheduled timeouts
//     timeoutIds.current = [];
//     if (synthRef.current) {
//       synthRef.current.triggerRelease(); // Ensure any playing note is stopped
//     }
//   };

//   const handleButtonClick = () => {
//     if (isPlaying) {
//       stopNotes(); // Stop the playback
//     } else {
//       playNotes(); // Start the playback
//     }
//     setIsPlaying(!isPlaying); // Toggle the playback state
//   };

//   return (
//     <div>
//       <button onClick={handleButtonClick}>{isPlaying ? "Stop" : "Play"}</button>
//     </div>
//   );
// };
