/**

 * Autor: Eibram Alexis Alvarado Orta

 * Componente: Vista del dashboard donde el usuario ve información de su cuenta.

 * Descripción: En esta vista se muestra el sidebar de navegación y el contenido
 * correspondiente a la sección activa del perfil de usuario.

 */

import React from "react";
import { useParams } from "react-router-dom";

import UserSidebar from "./usersidebar.jsx";
import AccountSettings from "./accountsettings.jsx";
import ChangePassword from "./changepassword.jsx";
import Suscripcion from "./suscripcion.jsx";

import "./userperfil.css";

const UserPerfil = () => {
  const { activepage } = useParams();

  // Si no viene nada en la URL, caemos por defecto en "accountsettings"
  const currentPage = activepage || "accountsettings";

  return (
    <div className="userperfil">
      <div className="userprofilein">
        <div className="left">
          <UserSidebar activepage={currentPage} />
        </div>

        <div className="right">
          {currentPage === "accountsettings" && <AccountSettings />}
          {currentPage === "changepassword" && <ChangePassword />}
          {currentPage === "suscripcion" && <Suscripcion />}
        </div>
      </div>
    </div>
  );
};

export default UserPerfil;
