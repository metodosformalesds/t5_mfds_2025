
import React from "react";
import { useParams } from "react-router-dom";

import UserSidebar from "../components/usersidebar.jsx";
import AccountSettings from "../components/accountsettings.jsx";
import ChangePassword from "../components/changepassword.jsx";
import UserAddress from "../components/useradress.jsx";
import Suscripcion from "../components/suscripcion.jsx";
import "./userperfil.css";

const UserPerfil = () => {
  const { activepage } = useParams();

  return (
    <div className="userperfil">
      <div className="userprofilein">
        <div className="left">
          <UserSidebar activepage={activepage} />
        </div>

        <div className="right">
          {activepage === "accountsettings" && <AccountSettings />}
          {activepage === "changepassword" && <ChangePassword />}
          {activepage === "useraddress" && <UserAddress />}
          {activepage === "suscripcion" && <Suscripcion />}
        </div>
      </div>
    </div>
  );
};

export default UserPerfil;
