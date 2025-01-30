import PropTypes from "prop-types";
import { Button, Collapse, Container, Table } from "react-bootstrap";
import { useState } from "react";

const MIDIDataTable = ({ midiData }) => {
  const [open, setOpen] = useState(false);

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
    <Container fluid className="mb-4">
      <Button
        size="lg"
        onClick={() => setOpen(!open)}
        aria-controls="midi-data-table"
        aria-expanded={open}
        className="mb-2"
        variant="dark"
      >
        {open ? "Hide Midi Data Table" : "Show Midi Data Table"}
      </Button>
      <Collapse in={open}>
        <div>
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
      </Collapse>
    </Container>
  );
};

MIDIDataTable.propTypes = {
  midiData: PropTypes.arrayOf(
    PropTypes.shape({
      note: PropTypes.number,
      chord: PropTypes.array,
      velocity: PropTypes.number.isRequired,
      duration: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default MIDIDataTable;
