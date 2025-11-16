import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login/", form);
      setMessage("✅ Inicio de sesión exitoso");
      console.log("Login OK:", res.data);

      // Simular guardado del token y redirección a home
      localStorage.setItem("access_token", res.data.cognito_tokens.access_token);
      window.dispatchEvent(new Event("auth-change"));
      setTimeout(() => navigate("/"), 1000);

    } catch (err) {
      console.error("Error en login:", err.response?.data || err);
      setMessage(`❌ ${JSON.stringify(err.response?.data) || "Credenciales inválidas"}`);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <h2>Bienvenido de nuevo</h2>
        <p>Inicia sesión para continuar en Sprout Market 🌿</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>Usuario</label>
          <input
            type="text"
            name="username"
            placeholder="Tu nombre de usuario"
            value={form.username}
            onChange={handleChange}
            required
          />

          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            placeholder="Tu contraseña"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit" className="btn-login">Iniciar sesión</button>
        </form>

        <p className="login-message">{message}</p>

        <p className="register-link">
          ¿No tienes cuenta? <a href="/register">Crea una aquí</a>
        </p>
      </div>

      <div className="login-right">
        <div className="logo-placeholder">🌱</div>
        <h1>Sprout <span>Market</span></h1>
      </div>
    </div>
  );
}
