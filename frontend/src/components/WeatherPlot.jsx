import PropTypes from "prop-types";
import { Button, Container, Modal } from "react-bootstrap";
import { useState } from "react";
import Plot from "react-plotly.js";

const WeatherPlot = ({ plotData, plotName }) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);
  const handleShow = () => setOpen(true);
  return (
    <Container fluid>
      <Button size="lg" onClick={handleShow} className="m-3" variant="dark">
        {open ? "Hide Plot" : "Show Plot"}
      </Button>
      <div className="modal-90w">
        <Modal show={open} onHide={handleClose} dialogClassName="modal-90w">
          <Modal.Header closeButton>
            <Modal.Title>{plotName}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container fluid className="d-flex justify-content-center mb-3">
              <Plot
                data={plotData}
                layout={{
                  width: window.innerWidth * 0.85,
                  height:
                    window.innerWidth > window.innerHeight
                      ? window.innerHeight * 0.7
                      : window.innerHeight * 0.6,
                  xaxis: { title: "Time" },
                  yaxis: { title: "Value" },
                  legend: {
                    orientation: "h",
                    x: 0.5,
                    xanchor: "center",
                    y: -0.2,
                    yanchor: "top",
                  },
                }}
              />
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

WeatherPlot.propTypes = {
  plotData: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.arrayOf(Number).isRequired,
      y: PropTypes.arrayOf(Number).isRequired,
      type: PropTypes.string.isRequired,
      mode: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      marker: PropTypes.shape({
        color: PropTypes.string.isRequired,
      }),
    })
  ).isRequired,
  plotName: PropTypes.string.isRequired,
};

export default WeatherPlot;
