import { useState } from "react";
import PropTypes from "prop-types";
import { DurationContext } from "./DurationContext";

export const DurationProvider = ({ children }) => {
  const [duration, setDuration] = useState(300);

  return (
    <DurationContext.Provider value={{ duration, setDuration }}>
      {children}
    </DurationContext.Provider>
  );
};

DurationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
