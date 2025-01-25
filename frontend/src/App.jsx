import "./App.css";
import { DataProvider } from "./contexts/DataContextProvider";
import { DurationProvider } from "./contexts/DurationContextProvider";
import { MIDIProvider } from "./contexts/MidiContextProvider";
import SelectDuration from "./components/SelectDuration";
import PlotDistances from "./components/PlotDistances";
import PlotWeather from "./components/PlotWeather";
import PlotStatistics from "./components/PlotStatistics";

import MapDataToMidi from "./components/MapDataToMidi";

function App() {
  return (
    <>
      <MIDIProvider>
        <DurationProvider>
          <DataProvider>
            <PlotWeather />
            <PlotStatistics />
            <PlotDistances />
            <SelectDuration />
            <MapDataToMidi />
          </DataProvider>
        </DurationProvider>
      </MIDIProvider>
    </>
  );
}

export default App;
