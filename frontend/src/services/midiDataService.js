import axios from "axios";

const baseUrl = "/api";

const getMidiToNotes = async (
  duration,
  startMidi,
  veloctiyMin,
  velocityMax,
  reverseVelocity,
  dataNotes,
  dataVelocity,
  dataDuration
) => {
  const body = {
    data_for_notes: dataNotes,
    data_for_velocity: dataVelocity,
    data_for_duration: dataDuration,
  };

  const request = await axios.post(`${baseUrl}/map_data_to_midi_notes`, body, {
    params: {
      duration_s: duration,
      start_midi_notes: startMidi,
      velocity_midi_min: veloctiyMin,
      velocity_midi_max: velocityMax,
      velocity_mapping_reversed: reverseVelocity,
    },
  });
  return request.data;
};

const getMidiToChords = async (
  duration,
  startMidi,
  veloctiyMin,
  velocityMax,
  reverseVelocity,
  chordType,
  dataChords,
  dataVelocity,
  dataDuration
) => {
  const body = {
    data_for_chords: dataChords,
    data_for_velocity: dataVelocity,
    data_for_duration: dataDuration,
  };

  const request = await axios.post(`${baseUrl}/map_data_to_midi_chords`, body, {
    params: {
      duration_s: duration,
      start_midi_notes: startMidi,
      velocity_midi_min: veloctiyMin,
      velocity_midi_max: velocityMax,
      velocity_mapping_reversed: reverseVelocity,
      chord_type: chordType,
    },
  });
  return request.data;
};

const getMidiToDrone = async (duration, startMidi, droneBuildOptions, data) => {
  const body = {
    data_for_drone: data,
    drone_build_options: droneBuildOptions,
  };

  const request = await axios.post(`${baseUrl}/map_data_to_midi_drone`, body, {
    params: {
      duration_s: duration,
      start_midi_notes: startMidi,
    },
  });

  return request.data;
};

const getMidiToCC = async (
  duration,
  midiMin,
  midiMax,
  reverseMapping,
  ccDuration,
  ccData,
  durationData
) => {
  const body = {
    data_for_cc: ccData,
    data_for_durations: durationData,
  };

  const params = {
    duration_s: duration,
    midi_min: midiMin,
    midi_max: midiMax,
    mapping_reversed: reverseMapping,
  };

  if (ccDuration !== undefined && ccDuration !== null && ccDuration !== "") {
    params.duration_per_cc_value = ccDuration;
  }

  const request = await axios.post(`${baseUrl}/map_data_to_midi_cc`, body, {
    params: params,
  });
  return request.data;
};

export default { getMidiToNotes, getMidiToChords, getMidiToDrone, getMidiToCC };
