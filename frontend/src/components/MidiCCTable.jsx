import PropTypes from "prop-types";
import { Button, Collapse, Container, Table } from "react-bootstrap";
import { useState } from "react";

const MIDICCTable = ({ midiData }) => {
  const [open, setOpen] = useState(false);

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
            CC Number: <strong>{midiData.ccNumber}</strong>
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
      </Collapse>
    </Container>
  );
};

MIDICCTable.propTypes = {
  midiData: PropTypes.arrayOf(
    PropTypes.shape({
      cc_message: PropTypes.number.isRequired,
      duration: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default MIDICCTable;
