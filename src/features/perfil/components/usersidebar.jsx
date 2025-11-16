import React from "react";
import "../components/usersidebar.css";
import { Link } from "react-router-dom";
import editIcon from "../../../assets/icons/boton-editar.png";
import SuscripcionIcon from "../../../assets/icons/tarjeta-de-credito.png";
import ChangePicon from "../../../assets/icons/candado-abierto.png";


const UserSidebar = ({ activepage }) => {
  return (
    <div className="usersidebar">
      {/* Editar perfil */}
      {activepage === "accountsettings" ? (
        <div className="s1">
          <img src={editIcon} alt="Editar" />
          <span> Editar Perfil </span>
        </div>
      ) : (
        <Link to="/editarPerfil/accountsettings" className="stylenone">
          <div className="s2">
            <img src={editIcon} alt="Editar" />
            <span className="span-user"> Editar Perfil </span>
          </div>
        </Link>
      )}

      {/* Suscripción */}
      {activepage === "suscripcion" ? (
        <div className="s1">
          <img src={SuscripcionIcon} alt="Editar" />
          <span> Suscripción </span>
        </div>
      ) : (
        <Link to="/editarPerfil/suscripcion" className="stylenone">
          <div className="s2">
            <img src={SuscripcionIcon} alt="Editar" />
            <span> Suscripción </span>
          </div>
        </Link>
      )}

      {/* Cambiar contraseña */}
      {activepage === "changepassword" ? (
        <div className="s1">
          <img src={ChangePicon} alt="Editar" />
          <span> Cambiar contraseña </span>
        </div>
      ) : (
        <Link to="/editarPerfil/changepassword" className="stylenone">
          <div className="s2">
            <img src={ChangePicon} alt="Editar" />
            <span> Cambiar contraseña </span>
          </div>
        </Link>
      )}
    </div>
  );
};

export default UserSidebar;
