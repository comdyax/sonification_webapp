import PropTypes from "prop-types";
import { Button, Container, Modal, Table } from "react-bootstrap";
import { useState } from "react";

const WeatherTable = ({ data }) => {
  const timeColumn = data[0].x.map((d) => new Date(d).toLocaleString());
  const numOfRows = timeColumn.length;
  const columnNames = ["Timestamp"].concat(data.map((col) => col.name));
  const columnValues = [timeColumn].concat(data.map((col) => col.y));

  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);
  const handleShow = () => setOpen(true);

  return (
    <Container fluid>
      <Button size="lg" onClick={handleShow} className="m-3" variant="dark">
        {open ? "Hide Table" : "Show Table"}
      </Button>
      <div className="modal-90w">
        <Modal show={open} onHide={handleClose} dialogClassName="modal-90w">
          <Modal.Header closeButton>
            <Modal.Title>Data Table</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Table striped hover className="rounded-3 overflow-hidden">
              <thead>
                <tr>
                  {columnNames.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(numOfRows)].map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {columnValues.map((values, colIndex) => (
                      <td key={`${colIndex}-${rowIndex}`}>
                        {values[rowIndex]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
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

WeatherTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default WeatherTable;
