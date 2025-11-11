import Navbar from "../features/components/Navbar";
import Home from "../features/pages/Home";
import "../shared/styles/index.css";

function App() {
  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      <Navbar />
      <Home />
    </div>
  );
}

export default App;
