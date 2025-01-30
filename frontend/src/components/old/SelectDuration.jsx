import { useContext, useState } from "react";
import { DurationContext } from "../contexts/DurationContext";
import { Button, Container, Form, InputGroup } from "react-bootstrap";

const SelectDuration = () => {
  const { duration, setDuration } = useContext(DurationContext);
  const [newDuration, setNewDuration] = useState(duration);

  return (
    <Container
      fluid
      style={{ textAlign: "center", maxWidth: "700px", margin: "auto" }}
    >
      <InputGroup className="mb-3">
        <InputGroup.Text id="duration">
          Duration of Sonification in Seconds:
        </InputGroup.Text>
        <Form.Control
          type="number"
          placeholder={newDuration}
          value={newDuration}
          onChange={(e) => setNewDuration(e.target.value)}
        />
        <Button variant="dark" onClick={() => setDuration(newDuration)}>
          Update Duration
        </Button>
      </InputGroup>
    </Container>
  );
};

export default SelectDuration;
