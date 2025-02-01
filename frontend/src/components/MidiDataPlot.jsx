import PropTypes from "prop-types";
import { Button, Container, Form, Modal } from "react-bootstrap";
import { useEffect, useMemo, useState } from "react";
import Plot from "react-plotly.js";

const MIDIDataPlot = ({ midiData }) => {
  const getRandomColor = (existingColors) => {
    let color;
    do {
      color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    } while (existingColors.includes(color));
    return color;
  };

  const [open, setOpen] = useState(false);

  const data = useMemo(() => {
    let data = [];
    let usedColors = [];
    const durations = [0].concat(midiData.map((data) => data.duration));
    const xAxis = durations.reduce((acc, curr, index) => {
      acc.push((acc[index - 1] || 0) + curr);
      return acc;
    }, []);

    if ("chord" in midiData[0]) {
      for (let idx = 0; idx < midiData[0].chord.length; idx++) {
        const color = getRandomColor(usedColors);
        const lastItem = midiData[midiData.length - 1].chord[idx];
        const yAxisMidi = midiData
          .map((data) => data.chord[idx])
          .concat(lastItem);
        data.push({
          x: xAxis,
          y: yAxisMidi,
          type: "scatter",
          mode: "lines+markers",
          line: { shape: "hv" },
          name: `chord note ${idx + 1}`,
          marker: { color: color },
        });
        usedColors.push(color);
      }
    }

    if ("note" in midiData[0]) {
      const color = getRandomColor(usedColors);
      const lastItem = midiData[midiData.length - 1].note;
      const yAxisMidi = midiData.map((data) => data.note).concat(lastItem);
      data.push({
        x: xAxis,
        y: yAxisMidi,
        type: "scatter",
        mode: "lines+markers",
        line: { shape: "hv" },
        name: "notes",
        marker: { color: color },
      });
      usedColors.push(color);
    }

    if ("cc_message" in midiData[0]) {
      const color = getRandomColor(usedColors);
      const lastItem = midiData[midiData.length - 1].cc_message;
      const yAxisMidi = midiData
        .map((data) => data.cc_message)
        .concat(lastItem);
      data.push({
        x: xAxis,
        y: yAxisMidi,
        type: "scatter",
        mode: "lines+markers",
        line: { shape: "hv" },
        name: "cc values",
        marker: { color: color },
      });
      usedColors.push(color);
    }

    if ("velocity" in midiData[0]) {
      const color = getRandomColor(usedColors);
      const lastItem = midiData[midiData.length - 1].velocity;
      const yAxisVelocity = midiData
        .map((data) => data.velocity)
        .concat(lastItem);
      data.push({
        x: xAxis,
        y: yAxisVelocity,
        type: "scatter",
        mode: "lines+markers",
        line: { shape: "hv" },
        name: "midi velocity",
        marker: { color: color },
      });
    }
    return data;
  }, [midiData]);

  const [plotData, setPlotData] = useState(null);
  const [plotDataType, setPlotDataType] = useState("value");

  useEffect(() => {
    if ("cc_message" in midiData[0]) {
      setPlotData(data);
    } else {
      setPlotData(data.slice(0, -1));
    }
    setPlotDataType("value");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [midiData]);

  const handleClose = () => setOpen(false);
  const handleShow = () => setOpen(true);

  const handleSelect = (e) => {
    setPlotDataType(e);
    setPlotData(e === "value" ? data.slice(0, -1) : data.slice(-1));
  };

  return (
    <Container fluid>
      <Button size="lg" onClick={handleShow} className="mb-2" variant="dark">
        {open ? "Hide Plot" : "Show Plot"}
      </Button>
      <div className="modal-90w">
        <Modal show={open} onHide={handleClose} dialogClassName="modal-90w">
          <Modal.Header closeButton>
            <Modal.Title>Midi Data Plot</Modal.Title>
            <Modal.Title className="position-absolute top-1 start-50 translate-middle-x">
              {!("cc_message" in midiData[0]) && (
                <Form.Select
                  aria-label="Select Type"
                  value={plotDataType}
                  onChange={(e) => handleSelect(e.target.value)}
                >
                  <option value="value">
                    {midiData[0].chord ? "Chord" : "Notes"}
                  </option>
                  <option value="velocity">Velocity</option>
                </Form.Select>
              )}
            </Modal.Title>
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
                  yaxis: { title: "Midi Value" },
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

MIDIDataPlot.propTypes = {
  midiData: PropTypes.arrayOf(
    PropTypes.shape({
      note: PropTypes.number,
      cc_message: PropTypes.number,
      chord: PropTypes.array,
      velocity: PropTypes.number,
      duration: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default MIDIDataPlot;
