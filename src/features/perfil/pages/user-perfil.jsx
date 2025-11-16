// src/features/perfil/pages/user-perfil.jsx
import React from "react";
import { useParams } from "react-router-dom";

import UserSidebar from "../components/usersidebar.jsx";
import AccountSettings from "../components/accountsettings.jsx";
import ChangePassword from "../components/changepassword.jsx";
import Suscripcion from "../components/suscripcion.jsx";

import "../pages/userperfil.css";

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
