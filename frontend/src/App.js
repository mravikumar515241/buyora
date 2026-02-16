import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8080/api/test")
      .then(res => setMessage(res.data));
  }, []);

  return (
    <div>
      <h1>Buyora</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
