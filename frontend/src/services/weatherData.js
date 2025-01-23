import axios from "axios";

const baseUrl = "/api/get_data";

const getWeatherData = async (
  startDate,
  endDate,
  latitude,
  longitude,
  dataType
) => {
  const request = await axios.get(baseUrl, {
    params: {
      start_date: startDate,
      end: endDate,
      lat: latitude,
      lon: longitude,
      data_field: dataType,
    },
  });
  return request.data;
};

export default { getWeatherData };
