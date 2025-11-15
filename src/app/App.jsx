import React from "react";
import { Routes, Route } from "react-router-dom";

import "../features/login-signup/pages/loginsignup.css";
import { LoginSignup } from "../features/login-signup/pages/login-signup.jsx";
import UserPerfil from "../features/perfil/pages/user-perfil.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginSignup />} />
      <Route path="/perfil/:activepage" element={<UserPerfil />} />
    </Routes>
  );
}

export default App;
