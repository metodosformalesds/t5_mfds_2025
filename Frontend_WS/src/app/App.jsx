import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "../features/Home";
import Login from "../features/Login";
import Register from "../features/Register";
import VerifyEmail from "../features/VerifyEmail";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />              {/* Página principal */}
        <Route path="/login" element={<Login />} />        {/* Iniciar sesión */}
        <Route path="/register" element={<Register />} />  {/* Registro */}
        <Route path="/verify-email" element={<VerifyEmail />} /> {/* Verificación */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
