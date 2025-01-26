import { useState } from "react";
import DataToCC from "./DataToCC";

const CCDataCreator = () => {
  const [ccComponents, setCcComponents] = useState({});
  const [nextId, setNextId] = useState(0);

  const addCcComponent = () => {
    const newId = nextId;
    setCcComponents((prev) => ({
      ...prev,
      [newId]: { id: newId },
    }));
    setNextId((prev) => prev + 1);
  };

  const removeCcComponent = (id) => {
    setCcComponents((prev) => {
      // eslint-disable-next-line no-unused-vars
      const { [id]: _, ...newComponents } = prev;
      return newComponents;
    });
  };

  return (
    <div>
      <h1>MIDI CC Data Creator</h1>
      {Object.entries(ccComponents).map(([id, component]) => (
        <DataToCC
          key={id}
          index={component.id} 
          onRemove={() => removeCcComponent(id)}
        />
      ))}
      <br />
      <button onClick={addCcComponent}>Add CC Data</button>
    </div>
  );
};

export default CCDataCreator;
