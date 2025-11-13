import { useState } from "react";
import { useNavigate } from "react-router-dom";   // 👈 importamos el hook
import api from "../api/client";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();                 // 👈 inicializamos el hook

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register/", form);
      setMessage("✅ Registro exitoso. Redirigiendo a verificación...");

      // Esperar 2 segundos y redirigir a /verify-email
      setTimeout(() => {
        navigate("/verify-email", { state: { username: form.username } });  // 👈 pasamos el username
      }, 2000);
    } catch (err) {
      console.error("Error en registro:", err.response?.data || err);
      setMessage(`❌ ${JSON.stringify(err.response?.data) || "Error desconocido"}`);
    }
  };

  return (
    <div className="register-container">
      <div className="register-left">
        <h2>Crea una nueva cuenta</h2>
        <p>Regístrate para comenzar a vender o intercambiar plantas 🌿</p>

        <form className="register-form" onSubmit={handleSubmit}>
          <label>Nombre de usuario</label>
          <input
            type="text"
            name="username"
            placeholder="Ingresa un nombre de usuario"
            value={form.username}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="ejemplo@correo.com"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            placeholder="Mínimo 8 caracteres"
            value={form.password}
            onChange={handleChange}
            required
          />

          <label>Confirmar contraseña</label>
          <input
            type="password"
            name="password_confirm"
            placeholder="Repite tu contraseña"
            value={form.password_confirm}
            onChange={handleChange}
            required
          />

          <button type="submit" className="btn-register">
            Crear cuenta
          </button>
        </form>

        <p className="register-message">{message}</p>

        <p className="login-link">
          ¿Ya tienes una cuenta? <a href="/login">Inicia sesión</a>
        </p>
      </div>

      <div className="register-right">
        <div className="logo-placeholder">🌱</div>
        <h1>Sprout <span>Market</span></h1>
      </div>
    </div>
  );
}
