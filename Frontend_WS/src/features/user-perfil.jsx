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
