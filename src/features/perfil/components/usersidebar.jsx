// src/features/perfil/components/usersidebar.jsx
import React from "react";
import "./usersidebar.css";
import { Link } from "react-router-dom";
import editIcon from "../../../assets/icons/boton-editar.png"; // ajusta si tu ruta es otra

const UserSidebar = ({ activepage }) => {
  return (
    <div className="usersidebar">
      {/* Editar perfil */}
      {activepage === "accountsettings" ? (
        <div className="s2">
          <img src={editIcon} alt="Editar" />
          <span> Editar Perfil </span>
        </div>
      ) : (
        <Link to="/perfil/accountsettings" className="stylenone">
          <div className="s1">
            <img src={editIcon} alt="Editar" />
            <span> Editar Perfil </span>
          </div>
        </Link>
      )}

      {/* Suscripción */}
      {activepage === "suscripcion" ? (
        <div className="s2">
          <img src={editIcon} alt="Editar" />
          <span> Suscripción </span>
        </div>
      ) : (
        <Link to="/perfil/suscripcion" className="stylenone">
          <div className="s1">
            <img src={editIcon} alt="Editar" />
            <span> Suscripción </span>
          </div>
        </Link>
      )}

      {/* Cambiar contraseña */}
      {activepage === "changepassword" ? (
        <div className="s2">
          <img src={editIcon} alt="Editar" />
          <span> Cambiar contraseña </span>
        </div>
      ) : (
        <Link to="/perfil/changepassword" className="stylenone">
          <div className="s1">
            <img src={editIcon} alt="Editar" />
            <span> Cambiar contraseña </span>
          </div>
        </Link>
      )}

      {/* Dirección */}
      {activepage === "useraddress" ? (
        <div className="s2">
          <img src={editIcon} alt="Editar" />
          <span> Dirección </span>
        </div>
      ) : (
        <Link to="/perfil/useraddress" className="stylenone">
          <div className="s1">
            <img src={editIcon} alt="Editar" />
            <span> Dirección </span>
          </div>
        </Link>
      )}
    </div>
  );
};

export default UserSidebar;
