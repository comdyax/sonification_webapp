import { useState, useEffect, useContext, useRef } from "react";
import { MIDIContext } from "../contexts/MidiContext";
import { Container, Button, Modal, Row, Col } from "react-bootstrap";
import WeatherPlot from "./WeatherPlot";
import { DataContext } from "../contexts/DataContext";
import * as Tone from "tone";

const MidiPlayer = () => {
  const [open, setOpen] = useState(false);
  const { midiData, ccData } = useContext(MIDIContext);
  const { plotData } = useContext(DataContext);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);

  const synthRef = useRef(new Tone.PolySynth(Tone.Synth).toDestination());

  useEffect(() => {
    Tone.start();
  }, []);

  const midiToToneNote = (midiNote) => {
    return new Tone.Frequency(midiNote, "midi").toNote();
  };

  const playNotes = async (midi) => {
    const firstEntry = midi[0];
    const hasNote = "note" in firstEntry;
    const hasChord = "chord" in firstEntry;

    if (hasNote) {
      for (const { note, velocity, duration } of midi) {
        if (!isPlayingRef.current) break;
        const toneNote = midiToToneNote(note);
        synthRef.current.triggerAttackRelease(
          toneNote,
          duration,
          Tone.now(),
          velocity / 127
        );
        await new Promise((resolve) => setTimeout(resolve, duration * 1000));
      }
    } else if (hasChord) {
      for (const { chord, velocity, duration } of midi) {
        if (!isPlayingRef.current) break;
        for (const c of chord) {
          const toneNote = midiToToneNote(c);
          synthRef.current.triggerAttackRelease(
            toneNote,
            duration,
            Tone.now(),
            velocity / 127
          );
        }
        await new Promise((resolve) => setTimeout(resolve, duration * 1000));
      }
    }
  };

  const stopNotes = () => {
    synthRef.current.triggerRelease();
    console.log("Playback stopped");
  };

  const playCC = async (cc) => {
    console.log("Control Change data received", cc);
  };

  const togglePlayback = async () => {
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      stopNotes();
      console.log("Stopping playback");
    } else {
      isPlayingRef.current = true;
      setIsPlaying(true);
      const midiDataArray = Object.values(midiData);
      const ccDataArray = Object.values(ccData);
      console.log("Playing data");
      await Promise.all([
        ...midiDataArray.map(playNotes),
        ...ccDataArray.map(playCC),
      ]);
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (isPlayingRef.current) {
      togglePlayback();
    }
  };

  const handleShow = () => setOpen(true);

  return (
    <Container fluid className="m-5">
      <Button size="lg" onClick={handleShow} className="mb-2" variant="dark">
        {open ? "Close" : "Play Demo"}
      </Button>
      <div>
        <Modal
          show={open}
          onHide={handleClose}
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>Midi Controller</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Container fluid>
              <Row>
                <Col className="d-flex justify-content-center m-4">
                  <Button onClick={togglePlayback} size="lg" variant="dark">
                    {isPlaying ? "Stop" : "Play"}
                  </Button>
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <WeatherPlot plotData={plotData} plotName="weather data" />
            <Button variant="secondary" size="lg" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Container>
  );
};

export default MidiPlayer;
