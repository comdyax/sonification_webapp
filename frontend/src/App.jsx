import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { DataProvider } from "./contexts/DataContextProvider";
import { MIDIProvider } from "./contexts/MidiContextProvider";
import PlotWeather from "./components/PlotWeather";

import MapDataToMidi from "./components/MapDataToMidi";
import { Container } from "react-bootstrap";

import { logo } from "./p5/logo";
import { useRef, useEffect } from "react";
import p5 from "p5";

const App = () => {
  const canvasRef = useRef(null);
  const p5Instance = useRef(null);

  useEffect(() => {
    if (!p5Instance.current) {
      p5Instance.current = new p5(logo, canvasRef.current);
    }
    return () => {
      if (p5Instance.current) {
        p5Instance.current.remove();
        p5Instance.current = null;
      }
    };
  }, []);

  return (
    <Container fluid style={{ maxWidth: "1200px" }}>
      <MIDIProvider>
        <DataProvider>
          <div className="header">
            <span ref={canvasRef} />
            <h1>Data-to-Midi-o-mat</h1>
          </div>
          <PlotWeather />
          <MapDataToMidi />
        </DataProvider>
      </MIDIProvider>
    </Container>
  );
};

export default App;
