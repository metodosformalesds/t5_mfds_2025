import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./loginsignup.css";
import api from "../api/client"; // ajusta la ruta si tu api/client está en otro lugar

export function LoginSignup() {
  const navigate = useNavigate();

  // "login" o "signup"
  const [mode, setMode] = useState("login");
  const isLogin = mode === "login";

  // Campos necesarios para LOGIN y REGISTER del backend
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  const [message, setMessage] = useState(""); // mensajes de éxito / error

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // Validaciones de front
  const validateLogin = () => {
    if (!form.username.trim() || !form.password.trim()) {
      setMessage("❌ Por favor ingresa tu usuario y contraseña.");
      return false;
    }
    return true;
  };

  const validateSignup = () => {
    if (
      !form.username.trim() ||
      !form.email.trim() ||
      !form.password.trim() ||
      !form.password_confirm.trim()
    ) {
      setMessage("❌ Por favor completa todos los campos para crear tu cuenta.");
      return false;
    }

    if (form.password.length < 8) {
      setMessage("❌ La contraseña debe tener al menos 8 caracteres.");
      return false;
    }

    if (form.password !== form.password_confirm) {
      setMessage("❌ La contraseña y la confirmación no coinciden.");
      return false;
    }

    return true;
  };

  // SUBMIT -> usa las mismas llamadas que Login.jsx y Register.jsx
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const isValid = isLogin ? validateLogin() : validateSignup();
    if (!isValid) return;

    try {
      if (isLogin) {
        // === LOGIN (misma lógica que Login.jsx) ===
        const res = await api.post("/auth/login/", {
          username: form.username,
          password: form.password,
        });

        setMessage("✅ Inicio de sesión exitoso");
        // Guardar token y disparar evento global
        localStorage.setItem(
          "access_token",
          res.data?.cognito_tokens?.access_token
        );
        window.dispatchEvent(new Event("auth-change"));

        setTimeout(() => navigate("/"), 1000); // redirige a Home
      } else {
        // === REGISTER (misma lógica que Register.jsx) ===
        const payload = {
          username: form.username,
          email: form.email,
          password: form.password,
          password_confirm: form.password_confirm,
        };

        await api.post("/auth/register/", payload);
        setMessage("✅ Registro exitoso. Redirigiendo a verificación...");

        setTimeout(() => {
          navigate("/verify-email", { state: { username: form.username } });
        }, 2000);
      }
    } catch (err) {
      console.error("Error en auth:", err?.response?.data || err);
      const backendError =
        typeof err?.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : err?.response?.data || "Error desconocido";

      setMessage(`❌ ${backendError}`);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* PANEL IZQUIERDO */}
        <div className="auth-left">
          {/* LOGO (tú colocas la imagen) */}
          <div className="auth-logo">
            {/* Ejemplo:
              <img src={logoSprout} alt="Sprout Market" />
            */}
          </div>

          <header className="auth-header">
            <h1 className="auth-title">
              {isLogin ? "Inicia sesión" : "Crea una nueva cuenta"}
            </h1>
            <p className="auth-subtitle">
              {isLogin
                ? "Bienvenido de nuevo, inicia sesión para continuar."
                : "Comparte algunos datos para comenzar en Sprout Market."}
            </p>
          </header>

          {/* Mensajes de error / éxito */}
          {message && <div className="auth-error">{message}</div>}

          {/* FORMULARIO */}
          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Campos LOGIN y SIGNUP comparten username y password, 
                pero en signup agregamos email + confirm */}
            <div className="auth-field">
              <label htmlFor="username">
                {isLogin ? "Usuario *" : "Nombre de usuario *"}
              </label>
              <input
                id="username"
                type="text"
                placeholder="Ej. eibram_dev"
                value={form.username}
                onChange={handleChange("username")}
              />
            </div>

            {!isLogin && (
              <div className="auth-field">
                <label htmlFor="email">Correo electrónico *</label>
                <input
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={form.email}
                  onChange={handleChange("email")}
                />
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="password">Contraseña *</label>
              <input
                id="password"
                type="password"
                placeholder={
                  isLogin ? "Tu contraseña" : "Mínimo 8 caracteres"
                }
                value={form.password}
                onChange={handleChange("password")}
              />
            </div>

            {!isLogin && (
              <div className="auth-field">
                <label htmlFor="password_confirm">
                  Confirmar contraseña *
                </label>
                <input
                  id="password_confirm"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={form.password_confirm}
                  onChange={handleChange("password_confirm")}
                />
              </div>
            )}

            {/* Extras sólo para LOGIN */}
            {isLogin && (
              <div className="auth-extra-row">
                <label className="remember-me">
                  <input type="checkbox" defaultChecked />
                  Recordarme
                </label>
                <button
                  type="button"
                  className="link-button"
                  onClick={() =>
                    console.log("TODO: flujo de recuperar contraseña")
                  }
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            {/* Botones inferiores */}
            {isLogin ? (
              <>
                <button type="submit" className="primary-btn full-width">
                  Iniciar sesión
                </button>
                <div className="auth-toggle-row">
                  <span>¿Aún no tienes cuenta?</span>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => {
                      setMessage("");
                      setMode("signup");
                    }}
                  >
                    Crear cuenta
                  </button>
                </div>
              </>
            ) : (
              <>
                <button type="submit" className="primary-btn full-width">
                  Crear tu cuenta
                </button>
                <div className="auth-toggle-row">
                  <span>¿Ya tienes cuenta?</span>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => {
                      setMessage("");
                      setMode("login");
                    }}
                  >
                    Inicia sesión
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        {/* PANEL DERECHO (ilustración / imagen grande) */}
        <div className="auth-right">
          <div className="auth-illustration-placeholder">
            {/* Aquí puedes poner la imagen que usas en tus mocks */}
            <span className="auth-brand">Sprout Market</span>
          </div>
        </div>
      </div>
    </div>
  );
}
