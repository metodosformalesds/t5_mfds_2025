/**
 * Autor: Carlo Lara 215661
 * Componente: MembershipSuccess
 * Descripción: Confirma el pago con Stripe, activa la membresía y actualiza el perfil del usuario.
 */

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function MembershipSuccess() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Confirmando tu pago...");

  useEffect(() => {
    const confirmMembership = async () => {
      try {
        const url = new URL(window.location.href);
        const session_id = url.searchParams.get("session_id");
        const token = localStorage.getItem("access_token");

        if (!session_id) {
          setMessage("No se encontró el session_id.");
          return;
        }

        // 1️⃣ Confirmar membresía en el backend
        const confirmRes = await axios.get(
          `http://localhost:8000/api/payments/membership/checkout/confirm/?session_id=${session_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setMessage("Membresía activada. Actualizando tu cuenta...");

        // 2️⃣ Obtener usuario actualizado del backend
        const profileRes = await axios.get(
          "http://localhost:8000/api/auth/profile/",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // 3️⃣ Guardar usuario en localStorage
        localStorage.setItem("user", JSON.stringify(profileRes.data));

        // 4️⃣ Avisar al navbar que cambió la sesión
        window.dispatchEvent(new Event("auth-change"));

        // 5️⃣ Mensaje final
        setMessage("🎉 ¡Tu membresía ha sido activada exitosamente!");

        // 6️⃣ Redirigir luego de 2.5 segundos
        setTimeout(() => {
          navigate("/perfil");
        }, 2500);

      } catch (error) {
        console.error("Error confirmando membresía:", error);
        setMessage("Hubo un error al confirmar tu membresía.");
      } finally {
        setLoading(false);
      }
    };

    confirmMembership();
  }, [navigate]);

  return (
    <div style={{ padding: "4rem", textAlign: "center" }}>
      <h1>Membresía</h1>
      <p style={{ fontSize: "1.2rem" }}>{message}</p>

      {loading && <p>Procesando pago...</p>}
      {!loading && (
        <button
          onClick={() => navigate("/perfil")}
          style={{
            marginTop: "2rem",
            padding: "10px 20px",
            background: "#5a975a",
            color: "white",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Ir a mi perfil
        </button>
      )}
    </div>
  );
}
