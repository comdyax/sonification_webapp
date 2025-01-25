import { useContext, useState, useEffect, useRef } from "react";
import * as Tone from "tone";
import { DataContext } from "../contexts/DataContext";
import { MIDIContext } from "../contexts/MidiContext";
import { DurationContext } from "../contexts/DurationContext";
import midiData from "../services/midiData";

const dataTextMapping = {
  weatherData: "weather data",
  rollingAvg: "rolling window average",
  rollingAvgDev: "rolling window average deviation",
  polyFit: "polynomial fit",
  polyFitDev: "polynomial fit residual magnitude",
  summaryStatsMin: "minimum",
  summaryStatsMean: "mean",
  summaryStatsMedian: "median",
  summaryStatsMax: "maximum",
  minDev: "absolute distance to minimum",
  meanDev: "absolute distance to mean",
  medianDev: "absolute distance to median",
  maxDev: "absolute Distance to maximum",
  distanceNext: "absolute distance to next value",
  distanceBefore: "absolute distance to value before",
};

const DataToNotes = () => {
  const { getDataKeys, getDataValues } = useContext(DataContext);
  const { duration } = useContext(DurationContext);
  const { setMidiData } = useContext(MIDIContext);
  const [startMidi, setStartMidi] = useState(36);
  const [velocityMin, setVelocityMin] = useState(50);
  const [velocityMax, setVelocityMax] = useState(127);
  const [reverseVelocity, setReverseVelocity] = useState(false);
  const [dataNotes, setDataNotes] = useState("weatherData");
  const [dataDuration, setDataDuration] = useState("weatherData");
  const [dataVelocity, setDataVelocity] = useState("weatherData");

  const dataTypes = getDataKeys();

  const fetchData = async () => {
    try {
      const response = await midiData.getMidiToNotes(
        duration,
        startMidi,
        velocityMin,
        velocityMax,
        reverseVelocity,
        getDataValues(dataNotes),
        getDataValues(dataVelocity),
        getDataValues(dataDuration)
      );
      setMidiData(response);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  return (
    <>
      <label>
        set lowest midi note: &ensp;
        <input
          type="number"
          value={startMidi}
          onChange={(e) => setStartMidi(e.target.value)}
        />
      </label>
      <br />
      <label>
        set minimum velocity: &ensp;
        <input
          type="number"
          value={velocityMin}
          onChange={(e) => setVelocityMin(e.target.value)}
        />
      </label>
      <br />
      <label>
        set maximum velocity: &ensp;
        <input
          type="number"
          value={velocityMax}
          onChange={(e) => setVelocityMax(e.target.value)}
        />
      </label>
      <br />
      <label>
        <input
          type="checkbox"
          value={reverseVelocity}
          onChange={(e) => setReverseVelocity(e.target.value)}
        />
        reverse velocity mapping
      </label>
      <br />
      <label>
        select data for notes: &ensp;
        <select
          value={dataNotes}
          onChange={(e) => setDataNotes(e.target.value)}
        >
          {dataTypes.map((t) => (
            <option key={t} value={t}>
              {dataTextMapping[t]}
            </option>
          ))}
        </select>
      </label>
      <br />
      <label>
        select data for duration: &ensp;
        <select
          value={dataDuration}
          onChange={(e) => setDataDuration(e.target.value)}
        >
          {dataTypes.map((t) => (
            <option key={t} value={t}>
              {dataTextMapping[t]}
            </option>
          ))}
        </select>
      </label>
      <br />
      <label>
        select data for velocity: &ensp;
        <select
          value={dataVelocity}
          onChange={(e) => setDataVelocity(e.target.value)}
        >
          {dataTypes.map((t) => (
            <option key={t} value={t}>
              {dataTextMapping[t]}
            </option>
          ))}
        </select>
      </label>
      <br />
      <button style={{ margin: "20px" }} onClick={() => fetchData()}>
        Calculate Midi Data
      </button>
    </>
  );
};

// const MidiPlayer = () => {
//   const { midiData } = useContext(MIDIContext);
//   useEffect(() => {
//     const synth = new Tone.Synth().toDestination();

//     const playNotes = async () => {
//       await Tone.start();
//       let time = Tone.now();
//       midiData.map(({ note, velocity, duration }) => {
//         const tone = Tone.Frequency(note, "midi").toNote();
//         synth.triggerAttack(tone, time, velocity);
//         time = time + duration;
//         synth.triggerRelease(time);
//       });
//     };

//     playNotes();
//   }, [midiData]);
//   return <div>Playing MIDI Notes...</div>;
// };


const MidiPlayer = () => {
    const { midiData } = useContext(MIDIContext);
    const [isPlaying, setIsPlaying] = useState(false); // Track playback state
    const synthRef = useRef(null); // Use ref to persist the synth instance
    const timeoutIds = useRef([]); // Store timeouts to stop playback
  
    const playNotes = async () => {
      await Tone.start(); // Ensure Tone.js is started
      if (!synthRef.current) {
        synthRef.current = new Tone.Synth().toDestination(); // Initialize synth once
      }
      const synth = synthRef.current;
  
      let time = Tone.now();
      midiData.forEach(({ note, velocity, duration }) => {
        const tone = Tone.Frequency(note, "midi").toNote();
        const attackTimeout = setTimeout(() => synth.triggerAttack(tone, undefined, velocity), (time - Tone.now()) * 1000);
        const releaseTimeout = setTimeout(() => synth.triggerRelease(), (time + duration - Tone.now()) * 1000);
  
        timeoutIds.current.push(attackTimeout, releaseTimeout);
        time += duration;
      });
    };
  
    const stopNotes = () => {
      timeoutIds.current.forEach((id) => clearTimeout(id)); // Clear all scheduled timeouts
      timeoutIds.current = [];
      if (synthRef.current) {
        synthRef.current.triggerRelease(); // Ensure any playing note is stopped
      }
    };
  
    const handleButtonClick = () => {
      if (isPlaying) {
        stopNotes(); // Stop the playback
      } else {
        playNotes(); // Start the playback
      }
      setIsPlaying(!isPlaying); // Toggle the playback state
    };
  
    return (
      <div>
        <button onClick={handleButtonClick}>
          {isPlaying ? "Stop" : "Play"}
        </button>
      </div>
    );
  };

const MapDataToMidi = () => {
  const { midiData } = useContext(MIDIContext);
  const { weatherData } = useContext(DataContext);

  const [midiStrategy, setMidiStrategy] = useState("notes");

  return (
    <>
      {weatherData.length > 0 && (
        <div>
          <h2 style={{ textAlign: "center", padding: "4%" }}>
            4. Build Sonification
          </h2>
          <div style={{ textAlign: "center" }}>
            <label>
              select sonification strategy: &ensp;
              <select
                value={midiStrategy}
                onChange={(e) => setMidiStrategy(e.target.value)}
              >
                <option value="notes">data to notes</option>
                <option value="chords">data to chords</option>
                <option value="drone">data to drone</option>
              </select>
            </label>
            <br />
            {midiStrategy === "notes" && <DataToNotes />}
            <br />
            {midiData && <MidiPlayer />}
          </div>
        </div>
      )}
    </>
  );
};

export default MapDataToMidi;
