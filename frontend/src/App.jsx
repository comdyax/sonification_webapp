import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { DataProvider } from "./contexts/DataContextProvider";
import { DurationProvider } from "./contexts/DurationContextProvider";
import { MIDIProvider } from "./contexts/MidiContextProvider";
import SelectDuration from "./components/SelectDuration";
import PlotWeather from "./components/PlotWeather";

import MapDataToMidi from "./components/MapDataToMidi";

function App() {
  return (
    <>
      <MIDIProvider>
        <DurationProvider>
          <DataProvider>
            <PlotWeather />
            <SelectDuration />
            <MapDataToMidi />
          </DataProvider>
        </DurationProvider>
      </MIDIProvider>
    </>
  );
}

export default App;
