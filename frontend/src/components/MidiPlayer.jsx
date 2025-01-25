import { useContext, useEffect } from 'react';
import * as Tone from 'tone';
import { MIDIContext } from '../contexts/MidiContext';


const MidiPlayer = () => {
  const { midiData } = useContext(MIDIContext)

  useEffect(() => {
    const synth = new Tone.Synth().toDestination();

    const playNotes = async () => {
      await Tone.start();

      // Loop through the midiData to trigger each note
      midiData.note.forEach((note, index) => {
        const velocity = midiData.velocity[index] || 127; // Default velocity if none is provided
        const duration = midiData.duration[index] || 500; // Default duration if none is provided

        const time = index * 0.6; // Space out the notes a bit (0.6 seconds)

        // Trigger the note with the velocity and duration
        synth.triggerAttackRelease(note, duration / 1000, `+${time}`);
      });
    };

    playNotes();
  }, [midiData]); // Re-run when midiData changes

  return <div>Playing MIDI Notes...</div>;
};

export default MidiPlayer;
