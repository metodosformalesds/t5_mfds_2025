import React from "react";

const ChangePassword = () => {
    return (
        <div className="accountsettings"> 
            <h1 className="mainhead1">Cambiar Contrasena</h1>
            <div className="form">
                <div className="formgroup">
                    <label htmlFor="oldpass">Old pasword<span>*</span></label>
                    <input type="password" name='name' id='name'/>
                </div>
                <div className="formgroup">
                    <label htmlFor="newpass">New password<span>*</span></label>
                    <input type="password" name='phone' id='phone'/>
                </div>
                <div className="formgroup">
                    <label htmlFor="confirmpass">Confirm password<span>*</span></label>
                    <input type="password" name='email' id='email'/>
                </div>
            </div>
            <button className="mainbutton1">
                Guardar cambios
            </button>
        </div>
    )
}

export default ChangePassword;