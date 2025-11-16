// src/features/login-signup/pages/login-signup.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../pages/loginsignup.css";

import google_icon from "../../../assets/icons/google.png";
import microsoft_icon from "../../../assets/icons/microsoft.png";

export function LoginSignup() {
  const navigate = useNavigate();

  // 'login' o 'signup'
  const [mode, setMode] = React.useState("login");
  const isLogin = mode === "login";

  const [form, setForm] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    remember: true,
  });

  const [error, setError] = React.useState("");

  const handleChange = (field) => (e) => {
    const value =
      field === "remember" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateLogin = () => {
    if (!form.email.trim() || !form.password.trim()) {
      setError("Por favor llena tu correo electrónico y tu contraseña.");
      return false;
    }
    return true;
  };

  const validateSignup = () => {
    if (
      !form.fullName.trim() ||
      !form.phone.trim() ||
      !form.email.trim() ||
      !form.password.trim() ||
      !form.confirmPassword.trim()
    ) {
      setError("Por favor completa todos los campos para crear tu cuenta.");
      return false;
    }

    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setError("La contraseña y la confirmación no coinciden.");
      return false;
    }

    return true;
  };

  // Aquí luego conectas tu API de login/registro
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const isValid = isLogin ? validateLogin() : validateSignup();
    if (!isValid) return;

    if (isLogin) {
      console.log("LOGIN =>", {
        email: form.email,
        password: form.password,
        remember: form.remember,
      });
      // TODO: llamar a tu backend para login
    } else {
      console.log("SIGNUP =>", {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      // TODO: llamar a tu backend para registro
    }

    // Cuando el login/registro sea correcto:
    navigate("/"); // Home
  };

  const handleGoogle = () => {
    console.log("Login con Google (pendiente conectar API)");
    // Aquí luego inicias tu flujo de OAuth
  };

  const handleMicrosoft = () => {
    console.log("Login con Microsoft (pendiente conectar API)");
    // Aquí luego inicias tu flujo de OAuth
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* PANEL IZQUIERDO (FORM) */}
        <div className="auth-left">
          {/* LOGO CENTRADO */}
          <div className="auth-logo">
            {/* Aquí colocarás tu logo, por ejemplo:
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
                : "Comparte algunos datos para obtener el mejor servicio."}
            </p>
          </header>

          {/* WARNING / ERRORES */}
          {error && <div className="auth-error">{error}</div>}

          {/* Botones sociales */}
          <div className="social-login">
            <button
              type="button"
              className="social-button"
              onClick={handleGoogle}
            >
              <img src={google_icon} alt="Google" />
              Google
            </button>
            <button
              type="button"
              className="social-button"
              onClick={handleMicrosoft}
            >
              <img src={microsoft_icon} alt="Microsoft" />
              Microsoft
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Campos SIGNUP */}
            {!isLogin && (
              <>
                <div className="auth-field">
                  <label htmlFor="fullName">Nombre completo *</label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Ej. Juan Pérez"
                    value={form.fullName}
                    onChange={handleChange("fullName")}
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="phone">Teléfono *</label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Ej. 656 123 4567"
                    value={form.phone}
                    onChange={handleChange("phone")}
                  />
                </div>
              </>
            )}

            {/* Campos comunes */}
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

            <div className="auth-field">
              <label htmlFor="password">Contraseña *</label>
              <input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={handleChange("password")}
              />
            </div>

            {!isLogin && (
              <div className="auth-field">
                <label htmlFor="confirmPassword">
                  Confirmar contraseña *
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite tu contraseña"
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                />
              </div>
            )}

            {/* Opciones extra para LOGIN */}
            {isLogin && (
              <div className="auth-extra-row">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={handleChange("remember")}
                  />
                  Recordarme
                </label>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => console.log("Recuperar contraseña")}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            {/* Botones inferiores */}
            {isLogin ? (
              <>
                <button type="submit" className="primary-btn full-width">
                  Login
                </button>
                <div className="auth-toggle-row">
                  <span>¿Aún no tienes cuenta?</span>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => {
                      setError("");
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
                      setError("");
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

        {/* PANEL DERECHO (IMAGEN/ILUSTRACIÓN) */}
        <div className="auth-right">
          {/* Aquí tú puedes poner tu imagen de forma manual */}
          <div className="auth-illustration-placeholder">
            <span className="auth-brand">Sprout Market</span>
          </div>
        </div>
      </div>
    </div>
  );
}
