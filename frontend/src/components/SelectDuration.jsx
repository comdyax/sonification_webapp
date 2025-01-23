import { useContext, useState } from "react";
import { DurationContext } from "../contexts/DurationContext";

const SelectDuration = () => {
  const { duration, setDuration } = useContext(DurationContext);
  const [newDuration, setNewDuration] = useState(duration);

  const handleSetClick = () => {
    setDuration(newDuration);
  };

  return (
    <>
      <div></div>
      <label style={{ marginLeft: "20px" }}>
        Duration of the soundscape in seconds:&ensp;
        <input
          type="number"
          value={newDuration}
          onChange={(e) => setNewDuration(e.target.value)}
        />
      </label>
      <button style={{ margin: "20px" }} onClick={handleSetClick}>
        Update Duration
      </button>
    </>
  );
};

export default SelectDuration;
