import React from "react";
import { useNavigate } from "react-router-dom";
import "./suscripcion.css";

const Suscripcion = () => {
  const navigate = useNavigate();

  const handleChoosePlan = (planId) => {
    
    navigate("/checkout", { state: { planId } });
  };

  return (
    <div className="suscripcion-wrapper">
      <h2 className="suscripcion-expira">
        Tu prueba termina en <strong>1 mes</strong> (14 de Diciembre, 2025).
      </h2>

      <p className="suscripcion-subtext">
        Suscríbete a un Plan: <br />
        Se renueva automáticamente, puedes cancelar en cualquier momento y
        seguir publicado hasta el final del plazo. <br />
        Pago seguro con <span className="suscripcion-stripe">Stripe</span>.
      </p>

      <div className="suscripcion-card">
        <h2 className="suscripcion-plan-title">3 Meses</h2>
        <p className="suscripcion-plan-price">$400 MXN</p>

        <ul className="suscripcion-benefits">
          <li>✓ Productos ilimitados</li>
          <li>✓ Catálogo para compartir</li>
          <li>✓ Tu perfil publicado en el directorio</li>
          <li>✓ Reporte mensual</li>
        </ul>

        <button
          className="suscripcion-btn"
          onClick={() => handleChoosePlan("basic")} 
        >
          Escoger plan
        </button>
      </div>
    </div>
  );
};

export default Suscripcion;
