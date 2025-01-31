import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { DataProvider } from "./contexts/DataContextProvider";
import { MIDIProvider } from "./contexts/MidiContextProvider";
import PlotWeather from "./components/PlotWeather";

import MapDataToMidi from "./components/MapDataToMidi";
import { Container } from "react-bootstrap";

const App = () => {
  return (
    <Container fluid style={{ maxWidth: "1200px" }}>
      <MIDIProvider>
          <DataProvider>
            <h1>Data-to-Midi-o-mat</h1>
            <PlotWeather />
            <MapDataToMidi />
          </DataProvider>
      </MIDIProvider>
    </Container>
  );
};

export default App;
