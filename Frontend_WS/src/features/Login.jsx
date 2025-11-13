import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      setMessage("✅ Inicio de sesión exitoso");
    } else {
      setMessage(`❌ ${result.message}`);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="brand">
          <h2>🌱 Sprout <span>Market</span></h2>
        </div>

        <h3>Compra y vende plantas en Ciudad Juárez.</h3>
        <p>Bienvenido de nuevo, inicia sesión en tu cuenta</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>Email</label>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="login-options">
            <label className="remember">
              <input type="checkbox" /> Recordarme
            </label>
            <a href="#" className="forgot">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button type="submit" className="btn-login">Iniciar sesión</button>
          <button
            type="button"
            className="btn-signup"
            onClick={() => navigate("/register")} 
          >
            Crear cuenta
          </button>

          <p className="or">O inicia sesión con</p>
          <div className="social-login">
            <button className="social facebook">Facebook</button>
            <button className="social google">Google</button>
          </div>
        </form>

        <p className="message">{message}</p>
      </div>

      <div className="login-right">
        {/* Imagen o logo decorativo (temporalmente vacío) */}
        <div className="plant-logo">🌿</div>
      </div>
    </div>
  );
}
