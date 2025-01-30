import PropTypes from "prop-types";

const MIDIDataTable = ({ midiData }) => {
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
      <table className="table table-striped table-bordered">
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
      </table>
    </div>
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
