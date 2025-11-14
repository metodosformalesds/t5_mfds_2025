import React from "react";
import './accountsettings.css';

const AccountSettings = () => {
    return (
        <div className="accountsettings"> 
            <h1 className="mainhead1">Informacion personal</h1>
            <div className="form">
                <div className="formgroup">
                    <label htmlFor="nombre">Nombre<span>*</span></label>
                    <input type="text" name='name' id='name'/>
                </div>
                <div className="formgroup">
                    <label htmlFor="phone">Telefono<span>*</span></label>
                    <input type="text" name='phone' id='phone'/>
                </div>
                <div className="formgroup">
                    <label htmlFor="email">Email<span>*</span></label>
                    <input type="text" name='email' id='email'/>
                </div>
            </div>
            <button className="mainbutton1">
                Guardar cambios
            </button>
        </div>
    )
}

export default AccountSettings; 