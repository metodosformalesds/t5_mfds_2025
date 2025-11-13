import { useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/client";
import "./VerifyEmail.css";

export default function VerifyEmail() {
  const location = useLocation();
  const prefilledUsername = location.state?.username || "";

  const [form, setForm] = useState({
    username: prefilledUsername,
    verification_code: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/verify-email/", form);
      setMessage("✅ Correo verificado exitosamente. Ya puedes iniciar sesión.");
    } catch (err) {
      console.error("Error en verificación:", err.response?.data || err);
      setMessage(`❌ ${JSON.stringify(err.response?.data) || "Código inválido"}`);
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-left">
        <h2>Verifica tu cuenta</h2>
        <p>Ingresa el código enviado a tu correo electrónico.</p>

        <form className="verify-form" onSubmit={handleSubmit}>
          <label>Nombre de usuario</label>
          <input
            type="text"
            name="username"
            placeholder="Tu nombre de usuario"
            value={form.username}
            onChange={handleChange}
            required
          />

          <label>Código de verificación</label>
          <input
            type="text"
            name="verification_code"
            placeholder="Ejemplo: 123456"
            value={form.verification_code}
            onChange={handleChange}
            required
          />

          <button type="submit" className="btn-verify">Verificar</button>
        </form>

        <p className="verify-message">{message}</p>
        <p className="login-link">
          ¿Ya verificaste tu cuenta? <a href="/login">Inicia sesión</a>
        </p>
      </div>

      <div className="verify-right">
        <div className="logo-placeholder">🌿</div>
        <h1>Sprout <span>Market</span></h1>
      </div>
    </div>
  );
}
