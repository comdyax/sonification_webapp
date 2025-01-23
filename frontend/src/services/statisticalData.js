import axios from "axios";

const baseUrl = "/api";

const getDistanceToBefore = async (duration, data) => {
  const body = {
    data: data,
  };

  const request = await axios.post(`${baseUrl}/get_distance_to_before`, body, {
    params: { duration_s: duration },
  });
  return request.data;
};

const getDistanceToNext = async (duration, data) => {
  const body = {
    data: data,
  };
  const request = await axios.post(`${baseUrl}/get_distance_to_next`, body, {
    params: { duration_s: duration },
  });
  return request.data;
};

const getPolynomialFit = async (duration, degree, deviation, data) => {
  const body = {
    data: data,
  };
  const params = {
    duration_s: duration,
    deviation: deviation,
  };

  if (degree !== undefined && degree !== null && degree !== "") {
    params.degree = degree;
  }
  const request = await axios.post(`${baseUrl}/get_polynomial_fit`, body, {
    params: params,
  });
  return request.data;
};

const getRollingAvg = async (duration, windowSize, deviation, data) => {
  const body = {
    data: data,
  };
  const params = {
    duration_s: duration,
    deviation: deviation,
  };

  if (windowSize !== undefined && windowSize !== null && windowSize !== "") {
    params.window_size = windowSize;
  }

  const request = await axios.post(`${baseUrl}/get_rolling_average`, body, {
    params: params,
  });
  return request.data;
};

const getSummaryStat = async (
  duration,
  aggType,
  percentile,
  deviation,
  data
) => {
  const body = {
    data: data,
  };
  const request = await axios.post(`${baseUrl}/get_summary_statistic`, body, {
    params: {
      duration_s: duration,
      aggregation_type: aggType,
      percentile: percentile,
      devation: deviation,
    },
  });
  return request.data;
};

export default {
  getDistanceToBefore,
  getDistanceToNext,
  getPolynomialFit,
  getRollingAvg,
  getSummaryStat,
};
