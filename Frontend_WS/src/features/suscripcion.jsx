/**
 * Autor: Carlo Lara 215661
 * Componente: Suscripcion
 * Descripción: Muestra el estado actual de la membresía del usuario o invita a suscribirse.
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./suscripcion.css";

const Suscripcion = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Leer datos actuales del usuario desde localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  // Si aún no carga
  if (!user) return <div>Cargando...</div>;

  // Verificar si el usuario tiene membresía activa
  const isActive = user.membership_is_active;
  const expiresAt = user.membership_expires_at;

  // Si tiene membresía activa → mostrar panel de membresía
  if (isActive && expiresAt) {
    const expirationDate = new Date(expiresAt);
    const today = new Date();

    const diffTime = expirationDate - today;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const formattedDate = expirationDate.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <div className="suscripcion-wrapper">
        <h2 className="suscripcion-expira">
          ⭐ Tu membresía está activa
        </h2>

        <p className="suscripcion-subtext">
          Expira el: <strong>{formattedDate}</strong> <br />
          Te quedan <strong>{daysLeft} días</strong> de acceso premium.
        </p>

        <div className="suscripcion-card">
          <h2 className="suscripcion-plan-title">
            Plan: {user.membership_type.toUpperCase()}
          </h2>

          <p className="suscripcion-plan-price">
            ¡Disfruta de todos tus beneficios!
          </p>

          <ul className="suscripcion-benefits">
            <li>✓ Publicaciones ilimitadas</li>
            <li>✓ Catálogo para compartir</li>
            <li>✓ Perfil en el directorio</li>
            <li>✓ Reportes avanzados</li>
          </ul>

          <button
            className="suscripcion-btn"
            onClick={() => navigate("/perfil")}
          >
            Ir a mi perfil
          </button>
        </div>
      </div>
    );
  }

  // Si no tiene membresía → mostrar la oferta
  return (
    <div className="suscripcion-wrapper">
      <h2 className="suscripcion-expira">
        No tienes una membresía activa.
      </h2>

      <p className="suscripcion-subtext">
        Suscríbete y obtén acceso premium a todas las funciones. <br />
        Pago 100% seguro con <span className="suscripcion-stripe">Stripe</span>.
      </p>

      <div className="suscripcion-plans-container">

        <div className="suscripcion-card">
          <h2 className="suscripcion-plan-title">3 Meses</h2>
          <p className="suscripcion-plan-price">$400 MXN</p>

          <ul className="suscripcion-benefits">
            <li>✓ Productos ilimitados</li>
            <li>✓ Catálogo para compartir</li>
            <li>✓ Perfil en el directorio</li>
            <li>✓ Reporte mensual</li>
          </ul>

          <button
            className="suscripcion-btn"
            onClick={() => navigate("/checkout", { state: { planId: "basic" } })}
          >
            Escoger plan
          </button>
        </div>

        <div className="suscripcion-card">
          <h2 className="suscripcion-plan-title">6 Meses</h2>
          <p className="suscripcion-plan-price">$750 MXN</p>

          <ul className="suscripcion-benefits">
            <li>✓ Productos ilimitados</li>
            <li>✓ Catálogo para compartir</li>
            <li>✓ Reporte mensual</li>
            <li>✓ Soporte prioritario</li>
          </ul>

          <button
            className="suscripcion-btn"
            onClick={() => navigate("/checkout", { state: { planId: "pro" } })}
          >
            Escoger plan
          </button>
        </div>

        <div className="suscripcion-card">
          <h2 className="suscripcion-plan-title">12 Meses</h2>
          <p className="suscripcion-plan-price">$1350 MXN</p>

          <ul className="suscripcion-benefits">
            <li>✓ Publicaciones ilimitadas</li>
            <li>✓ Reportes avanzados</li>
            <li>✓ Anuncios destacados</li>
            <li>✓ Soporte premium</li>
          </ul>

          <button
            className="suscripcion-btn"
            onClick={() => navigate("/checkout", { state: { planId: "premium" } })}
          >
            Escoger plan
          </button>
        </div>

      </div>

    </div>
  );
};

export default Suscripcion;
