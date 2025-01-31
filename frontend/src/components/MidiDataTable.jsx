import PropTypes from "prop-types";
import { Button, Container, Modal, Table } from "react-bootstrap";
import { useState } from "react";

const MidiTable = ({ midiData }) => {
  const totalNotes = midiData.length;
  const averageVelocity =
    totalNotes > 0
      ? (
          midiData.reduce((sum, data) => sum + data.velocity, 0) / totalNotes
        ).toFixed(2)
      : 0;
  const longestDuration =
    totalNotes > 0 ? Math.max(...midiData.map((data) => data.duration)) : 0;
  return (
    <div style={{ textAlign: "center", margin: "auto" }}>
      <p>
        {midiData[0].chord ? "Total chords:" : "Total Notes:"}{" "}
        <strong>{totalNotes}</strong>
      </p>
      <p>
        Average Velocity: <strong>{averageVelocity}</strong>
      </p>
      <p>
        Longest Duration: <strong>{longestDuration}</strong> seconds
      </p>
      <Table
        striped
        bordered
        hover
        className="rounded-3 overflow-hidden"
        variant="dark"
      >
        <thead className="thead-dark">
          <tr>
            <th>{midiData[0].chord ? "Chord" : "Note"}</th>
            <th>Velocity</th>
            <th>Duration (seconds)</th>
          </tr>
        </thead>
        <tbody>
          {midiData.map((data, index) => (
            <tr key={index}>
              <td>
                {data.chord ? "[" + data.chord.join(", ") + "]" : data.note}
              </td>
              <td>{data.velocity}</td>
              <td>{data.duration}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

MidiTable.propTypes = {
  midiData: PropTypes.arrayOf(
    PropTypes.shape({
      note: PropTypes.number,
      chord: PropTypes.array,
      velocity: PropTypes.number.isRequired,
      duration: PropTypes.number.isRequired,
    })
  ).isRequired,
};


const CCTable = ({ midiData }) => {
  return (
    <div style={{ textAlign: "center", margin: "auto" }}>
      <h2>CC Number: {midiData.ccNumber}</h2>
      <Table
        striped
        bordered
        hover
        className="rounded-3 overflow-hidden"
        variant="dark"
      >
        <thead className="thead-dark">
          <tr>
            <th>CC Value</th>
            <th>Duration (seconds)</th>
          </tr>
        </thead>
        <tbody>
          {midiData.map((data, index) => (
            <tr key={index}>
              <td>{data.cc_message}</td>
              <td>{data.duration}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

CCTable.propTypes = {
  midiData: PropTypes.arrayOf(
    PropTypes.shape({
      cc_message: PropTypes.number,
      duration: PropTypes.number.isRequired,
    })
  ).isRequired,
};

const MIDIDataTable = ({ midiData }) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);
  const handleShow = () => setOpen(true);

  return (
    <Container fluid className="mb-4">
      <Button size="lg" onClick={handleShow} className="mb-2" variant="dark">
        {open ? "Hide Table" : "Show Table"}
      </Button>
      <div className="modal-90w">
        <Modal show={open} onHide={handleClose} dialogClassName="modal-90w">
          <Modal.Header closeButton>
            <Modal.Title>Midi Data Table</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {(midiData[0].chord || midiData[0].note )? (
              <MidiTable midiData={midiData} />
            ) : (
              <CCTable midiData={midiData} />
            )}
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

MIDIDataTable.propTypes = {
  midiData: PropTypes.arrayOf(
    PropTypes.shape({
      note: PropTypes.number,
      chord: PropTypes.array,
      velocity: PropTypes.number,
      duration: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default MIDIDataTable;
