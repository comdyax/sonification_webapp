import PropTypes from "prop-types";
import { Button, Collapse } from "react-bootstrap";
import { useState } from "react";

const MIDICCTable = ({ ccData }) => {
  const [open, setOpen] = useState(false);

  const longestDuration =
    totalNotes > 0 ? Math.max(...ccData.map((data) => data.duration)) : 0;

  return (
    <div className="container mt-4">
      <h2 className="text-center">MIDI Data</h2>
      <div className="mb-4">
        <p>
          Total Notes: <strong>{totalNotes}</strong>
        </p>
        <p>
          Average Velocity: <strong>{averageVelocity}</strong>
        </p>
        <p>
          Longest Duration: <strong>{longestDuration}</strong> seconds
        </p>
      </div>
      <Button
        onClick={() => setOpen(!open)}
        aria-controls="midi-data-table"
        aria-expanded={open}
        className="mb-2"
        variant="dark"
      >
        {open ? "Hide Table" : "Show Table"}
      </Button>
      <Collapse in={open}>
        <table className="table table-striped table-bordered">
          <thead className="thead-dark">
            <tr>
              <th>{ccData[0].chord ? "Chord" : "Note"}</th>
              <th>Velocity</th>
              <th>Duration (seconds)</th>
            </tr>
          </thead>
          <tbody>
            {ccData.map((data, index) => (
              <tr key={index}>
                <td>
                  {data.chord ? "[" + data.chord.join(", ") + "]" : data.note}
                </td>
                <td>{data.velocity}</td>
                <td>{data.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Collapse>
    </div>
  );
};

ccDataTable.propTypes = {
  ccData: PropTypes.arrayOf(
    PropTypes.shape({
      note: PropTypes.number,
      chord: PropTypes.array,
      velocity: PropTypes.number.isRequired,
      duration: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default ccDataTable;
