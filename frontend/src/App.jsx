import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ClipboardProvider } from "./context/ClipboardContext";
import "./App.css";
import TextPage from "./pages/TextPage";
import ImagePage from "./pages/ImagePage";
import Navbar from "./components/Navbar";

const App = () => (
  <ClipboardProvider>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<TextPage />} />
        <Route path="/image" element={<ImagePage />} />
      </Routes>
    </Router>
  </ClipboardProvider>
);

export default App;
