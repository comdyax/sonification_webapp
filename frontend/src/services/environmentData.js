import axios from "axios";

const baseUrl = "/api/get_data";

const cache = new Map();

const cacheWeatherData = async (
  startDate,
  endDate,
  latitude,
  longitude,
  dataType,
  interval
) => {
  const key = JSON.stringify({
    startDate,
    endDate,
    latitude,
    longitude,
    dataType,
    interval,
  });

  if (cache.has(key)) {
    console.log("Returning cached result");
    return cache.get(key);
  }

  console.log("Fetching new data and caching it");
  const request = await axios.get(baseUrl, {
    params: {
      start_date: startDate,
      end_date: endDate,
      lat: latitude,
      lon: longitude,
      data_field: dataType,
      interval: interval,
    },
  });

  cache.set(key, request.data);
  return request.data;
};

export default { getWeatherData: cacheWeatherData };
