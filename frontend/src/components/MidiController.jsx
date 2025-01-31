import { useState, useEffect, useContext, useRef } from "react";
import { MIDIContext } from "../contexts/MidiContext";
import { Container, Button, Modal, Form, Row, Col } from "react-bootstrap";

const MidiController = () => {
  const [open, setOpen] = useState(false);

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

  const sendNoteOff = (device, note, log = true) => {
    if (device) {
      device.send([0x80, note, 0]); // 0x80 = note_off message
      if (log) {
        console.log(`Note Off: ${note}`);
      }
    }
  };

  const sendCC = (device, controller, value) => {
    if (device) {
      device.send([0xb0, controller, value]); // 0xB0 = control change message
      console.log(`CC: ${controller}, Value: ${value}`);
    }
  };

  const playNotes = async (midi) => {
    const firstEntry = midi[0];
    const hasNote = "note" in firstEntry;
    const hasChord = "chord" in firstEntry;

    if (selectedOutput) {
      isPlayingRef.current = true;
      if (hasNote) {
        for (const { note, velocity, duration } of midi) {
          if (!isPlayingRef.current) break;
          sendNoteOn(selectedOutput, note, velocity);
          setLastNotes(note);
          await new Promise((resolve) => setTimeout(resolve, duration * 1000));
          if (!isPlayingRef.current) break;
          sendNoteOff(selectedOutput, note);
          await new Promise((resolve) => setTimeout(resolve, 1));
        }
      } else if (hasChord) {
        for (const { chord, velocity, duration } of midi) {
          if (!isPlayingRef.current) break;
          for (const c of chord) {
            sendNoteOn(selectedOutput, c, velocity);
          }
          setLastNotes(chord);
          await new Promise((resolve) => setTimeout(resolve, duration * 1000));
          if (!isPlayingRef.current) break;
          for (const c of chord) {
            sendNoteOff(selectedOutput, c);
          }
          await new Promise((resolve) => setTimeout(resolve, 1));
        }
      }
      isPlayingRef.current = false;
    } else {
      console.error("No MIDI device selected");
    }
  };

  const stopNotes = () => {
    if (selectedOutput) {
      for (let m = 0; m < 128; m++) {
        sendNoteOff(selectedOutput, m, false);
      }
      isPlayingRef.current = false;
      console.log("Playback stopped");
    }
  };

  const playCC = async (cc) => {
    if (selectedOutput && Object.keys(cc).length > 0) {
      const ccNumber = cc.ccNumber;
      for (const { cc_message, duration } of cc) {
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
      console.log("stopping");
    } else {
      const ccDataArray = Object.values(ccData);
      const midiDataArray = Object.values(midiData);
      console.log("playing");
      await Promise.all([
        ...midiDataArray.map(playNotes),
        ...ccDataArray.map(playCC),
      ]);
    }
  };

  const handleDeviceSelect = (id) => {
    const device = outputDevices.find((output) => output.id === id);
    setSelectedOutput(device);
  };

  const handleClose = () => {
    setOpen(false);
    // isPlayingRef.current = false;
    // stopNotes();
    // console.log("stopping");
  };
  const handleShow = () => setOpen(true);

  return (
    <Container fluid className="m-5">
      <Button size="lg" onClick={handleShow} className="mb-2" variant="dark">
        {open ? "Close Midi Controller" : "Open Midi Controller"}
      </Button>
      <div>
        <Modal show={open} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Midi Controller</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Container fluid>
              <Row>
                <Col className="m-5">
                  <Form.Select
                    style={{
                      textAlign: "center",
                      margin: "auto",
                    }}
                    size="lg"
                    aria-label="Select Type"
                    onChange={(e) => handleDeviceSelect(e.target.value)}
                  >
                    <option value="">--Select MIDI Device--</option>
                    {outputDevices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
              <Row>
                <Col className="d-flex justify-content-center m-5">
                  <Button onClick={togglePlayback} size="lg" variant="dark">
                    {isPlayingRef.current ? "Stop" : "Play"}
                  </Button>
                </Col>
              </Row>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" size="lg" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </Container>
  );
};

export default MidiController;
