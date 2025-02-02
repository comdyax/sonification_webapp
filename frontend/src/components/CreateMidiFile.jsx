import { useContext } from "react";
import { MIDIContext } from "../contexts/MidiContext";
import { Button } from "react-bootstrap";
import { Midi } from "@tonejs/midi";

const CreateMidiFile = () => {
  const { midiData, ccData } = useContext(MIDIContext);

  const createFile = () => {
    const midi = new Midi();

    for (const data of Object.values(midiData)) {
      const track = midi.addTrack();
      let time = 0;
      if ("note" in data[0]) {
        for (const { note, velocity, duration } of data) {
          track.addNote({
            midi: note,
            time: time,
            duration: duration,
            velocity: velocity,
          });
          time += duration;
        }
      }
      if ("chord" in data[0]) {
        for (const { chord, velocity, duration } of data) {
          for (const c of chord) {
            track.addNote({
              midi: c,
              time: time,
              duration: duration,
              velocity: velocity,
            });
          }
          time += duration;
        }
      }
    }
    for (const data in Object.values(ccData)) {
      const track = midi.addTrack();
      let time = 0;
      const cc = data.ccNumber;
      for (const { cc_message, duration } of data) {
        track.addCC({
          channel: 1,
          controller: cc,
          value: cc_message,
          time: time,
        });
        time += duration;
      }
    }

    const midiFile = new Blob([midi.toArray()], { type: "audio/midi" });
    const url = URL.createObjectURL(midiFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = "midi-o-mat-track.mid";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Button className="m-5" variant="dark" size="lg" onClick={createFile}>
      Create Midi File
    </Button>
  );
};

export default CreateMidiFile;
