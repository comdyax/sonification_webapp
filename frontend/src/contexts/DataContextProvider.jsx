import { useState } from "react";
import PropTypes from "prop-types";
import { DataContext } from "./DataContext";

export const DataProvider = ({ children }) => {
  const [weatherData, setWeatherData] = useState([]);
  const [data, setData] = useState({});

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

  return (
    <DataContext.Provider
      value={{
        weatherData,
        setWeatherData,
        updateData,
        getData,
        getDataValues,
        getDataKeys,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

DataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
