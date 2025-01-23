import PlotWeather from "./components/PlotWeather";
import "./App.css";
import PlotStatistics from "./components/PlotStatistics";
import { DataProvider } from "./contexts/DataContextProvider";
import { DurationProvider } from "./contexts/DurationContextProvider";
import SelectDuration from "./components/SelectDuration";
import PlotDistances from "./components/PlotDistances";

function App() {
  return (
    <>
      <DurationProvider>
        <DataProvider>
          <PlotWeather />
          <PlotStatistics />
          <PlotDistances />
          <SelectDuration />
        </DataProvider>
      </DurationProvider>
    </>
  );
}

export default App;
