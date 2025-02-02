import { useState } from "react";
import PropTypes from "prop-types";
import { DataContext } from "./DataContext";

export const DataProvider = ({ children }) => {
  const [plotData, setPlotData] = useState([]);
  const [weatherData, setWeatherData] = useState([]);
  const [data, setData] = useState({});
  const [polyDegree, setPolyDegree] = useState("");
  const [windowSize, setWindowSize] = useState(5);

  const updateData = (key, dataList) => {
    setData((prev) => ({
      ...prev,
      [key]: dataList,
    }));
  };

  const getDataValues = (key) => {
    return key in data ? ("value" in data[key] ? data[key]["value"] : []) : [];
  };

  const getDataKeys = () => {
    return Object.keys(data);
  };

  const getData = (key) => {
    return key in data ? data[key] : [];
  };

  const removeData = (key) => {
    if (key in data) {
      setData((prev) =>
        Object.fromEntries(Object.entries(prev).filter(([k]) => k !== key))
      );
    }
  };

  return (
    <DataContext.Provider
      value={{
        plotData,
        setPlotData,
        weatherData,
        setWeatherData,
        updateData,
        getData,
        getDataValues,
        getDataKeys,
        removeData,
        polyDegree,
        setPolyDegree,
        windowSize,
        setWindowSize,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

DataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
